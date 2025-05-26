import React, { useState, useEffect } from 'react';
import { 
  Modal, Button, Form, Row, Col, Alert, Spinner 
} from 'react-bootstrap';
import { createSession, updateSession } from '../../services/sessionService';
import { getAllSubjects } from '../../services/subjectService';
import { getAllPrograms } from '../../services/programService';
import { getAllLocations } from '../../services/locationService';
import { getAllBatches } from '../../services/batchService';
import { useAuth } from '../../context/authContext';

const SessionForm = ({ show, onHide, onSessionCreated, onSessionUpdated, sessionToEdit }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Data for dropdowns
  const [allSubjects, setAllSubjects] = useState([]);  // All subjects
  const [filteredSubjects, setFilteredSubjects] = useState([]); // Filtered by program
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    subjectId: '',
    programId: '',
    batchId: '',
    locationId: '',
    startTime: formatDateForInput(new Date()),
    endTime: '',
  });
  
  const isEditMode = !!sessionToEdit;
  
  // Helper function to format date for input fields
  function formatDateForInput(date) {
    if (!date) return '';
    const d = new Date(date);
    // Format: YYYY-MM-DDThh:mm
    return d.toISOString().slice(0, 16);
  }
  
  // Load dropdown data when component mounts or when editing a session
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Load all required data for dropdowns
        const [
          subjectsRes,
          programsRes, 
          locationsRes,
          batchesRes
        ] = await Promise.all([
          getAllSubjects(),
          getAllPrograms(),
          getAllLocations(),
          getAllBatches()
        ]);
        
        // Filter subjects by teacher
        const teacherSubjects = subjectsRes.data.filter(
          subject => subject.teacherId === user.userId || user.type === 'admin'
        );
        
        setAllSubjects(teacherSubjects);
        setPrograms(programsRes.data);
        setLocations(locationsRes.data);
        setBatches(batchesRes.data || []);
        
        // If editing, set form data
        if (isEditMode && sessionToEdit) {
          const editData = {
            subjectId: sessionToEdit.subjectId?.toString() || sessionToEdit.subject?.subjectId?.toString() || '',
            programId: sessionToEdit.programId?.toString() || sessionToEdit.program?.programId?.toString() || '',
            batchId: sessionToEdit.batchId?.toString() || sessionToEdit.batch?.batchId?.toString() || '',
            locationId: sessionToEdit.locationId?.toString() || sessionToEdit.location?.locationId?.toString() || '',
            startTime: formatDateForInput(sessionToEdit.startTime) || '',
            endTime: sessionToEdit.endTime ? formatDateForInput(sessionToEdit.endTime) : '',
          };
          
          setFormData(editData);
          
          // If program is already selected, filter subjects
          if (editData.programId) {
            const programId = parseInt(editData.programId);
            const programSubjects = teacherSubjects.filter(
              subject => subject.programId === programId
            );
            setFilteredSubjects(programSubjects);
          }
        } else {
          // Reset form for new session
          setFormData({
            subjectId: '',
            programId: '',
            batchId: '',
            locationId: '',
            startTime: formatDateForInput(new Date()),
            endTime: '',
          });
          setFilteredSubjects([]);
        }
        
        setError('');
      } catch (err) {
        console.error('Error loading form data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (show) {
      fetchData();
    }
  }, [show, user.userId, user.type, sessionToEdit]);
  
  // Filter subjects when program changes
  useEffect(() => {
    if (!formData.programId) {
      setFilteredSubjects([]);
      return;
    }
    
    const programId = parseInt(formData.programId);
    
    // Filter subjects by program
    const programSubjects = allSubjects.filter(
      subject => subject.programId === programId
    );
    
    setFilteredSubjects(programSubjects);
    
    // Clear subject selection if it doesn't belong to the selected program
    if (formData.subjectId && !programSubjects.some(s => s.subjectId === parseInt(formData.subjectId))) {
      setFormData(prev => ({
        ...prev,
        subjectId: ''
      }));
    }
  }, [formData.programId, allSubjects]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any previous error/success messages
    setError('');
    setSuccess('');
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.subjectId || !formData.programId || !formData.batchId || 
        !formData.locationId || !formData.startTime) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare session data with current teacher ID
      const sessionData = {
        teacherId: user.userId,
        subjectId: parseInt(formData.subjectId),
        programId: parseInt(formData.programId),
        batchId: parseInt(formData.batchId),
        locationId: parseInt(formData.locationId),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        status: 'Open'
      };
      
      let response;
      
      if (isEditMode) {
        // Update existing session
        response = await updateSession(sessionToEdit.sessionId, sessionData);
        
        // Get updated session data
        const updatedSession = response.data.session || response.data;
        
        // Find full program, subject, batch, and location details from the form data
        const program = programs.find(p => p.programId === parseInt(formData.programId));
        const subject = filteredSubjects.find(s => s.subjectId === parseInt(formData.subjectId));
        const batch = batches.find(b => b.batchId === parseInt(formData.batchId));
        const location = locations.find(l => l.locationId === parseInt(formData.locationId));
        
        // Create a complete session object with entity details
        const completeSession = {
          ...updatedSession,
          // Preserve the existing ID
          sessionId: sessionToEdit.sessionId,
          // Include related entities
          program: program || { programName: 'Unknown Program', programId: parseInt(formData.programId) },
          subject: {
            name: subject?.name || subject?.subjectName || 'Unknown Subject',
            subjectId: parseInt(formData.subjectId)
          },
          batch: batch || { 
            name: batch?.name || batch?.batchName || 'Unknown Batch',
            batchId: parseInt(formData.batchId)
          },
          location: location || { 
            campusName: 'Unknown Location',
            locationId: parseInt(formData.locationId)
          },
          // Preserve attendance data if it exists
          attendanceCount: sessionToEdit.attendanceCount || 0,
          totalStudents: sessionToEdit.totalStudents || 0
        };
        
        setSuccess('Session updated successfully!');
        
        // Notify parent component with updated session data
        if (onSessionUpdated) {
          onSessionUpdated(completeSession);
        }
      } else {
        // Create new session
        response = await createSession(sessionData);
        
        // Prepare complete session data with related entities
        const createdSession = response.data.session;
        
        // Find full program, subject, batch, and location details from the form data
        const program = programs.find(p => p.programId === parseInt(formData.programId));
        const subject = filteredSubjects.find(s => s.subjectId === parseInt(formData.subjectId));
        const batch = batches.find(b => b.batchId === parseInt(formData.batchId));
        const location = locations.find(l => l.locationId === parseInt(formData.locationId));
        
        // Debug logs
        console.log("Creating session with subject:", subject);
        console.log("All filtered subjects:", filteredSubjects);
        console.log("Selected subject ID:", formData.subjectId);
        
        // Create a complete session object with entity details
        const completeSession = {
          ...createdSession,
          program: program || { programName: 'Unknown Program' },
          subject: {
            name: subject?.name || subject?.subjectName || 'Unknown Subject',
            subjectId: parseInt(formData.subjectId)
          },
          batch: batch || { name: batch?.name || batch?.batchName || 'Unknown Batch' },
          location: location || { campusName: 'Unknown Location' },
          attendanceCount: 0,
          totalStudents: 0
        };
        
        setSuccess('Session created successfully!');
        
        // Notify parent component with complete session data
        if (onSessionCreated) {
          onSessionCreated(completeSession);
        }
      }
      
      // Reset form
      setFormData({
        subjectId: '',
        programId: '',
        batchId: '',
        locationId: '',
        startTime: formatDateForInput(new Date()),
        endTime: '',
      });
      
      // Close modal after a brief delay to show success message
      setTimeout(() => {
        onHide();
        setSuccess('');
      }, 1500);
      
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} session:`, err);
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} session. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Session' : 'Start New Session'}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Program</Form.Label>
                <Form.Select
                  name="programId"
                  value={formData.programId}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Program</option>
                  {programs.map(program => (
                    <option 
                      key={program.programId} 
                      value={program.programId}
                    >
                      {program.programName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Subject</Form.Label>
                <Form.Select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  required
                  disabled={loading || !formData.programId}
                >
                  <option value="">Select Subject</option>
                  {filteredSubjects.map(subject => (
                    <option 
                      key={subject.subjectId} 
                      value={subject.subjectId}
                    >
                      {subject.name || subject.subjectName}
                    </option>
                  ))}
                </Form.Select>
                {formData.programId && filteredSubjects.length === 0 && (
                  <Form.Text className="text-muted">
                    No subjects found for this program.
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Batch</Form.Label>
                <Form.Select
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Batch</option>
                  {batches.map(batch => (
                    <option 
                      key={batch.batchId} 
                      value={batch.batchId}
                    >
                      {batch.batchName || batch.name || `Batch ID: ${batch.batchId}`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Select
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option 
                      key={location.locationId} 
                      value={location.locationId}
                    >
                      {location.campusName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Time (optional)</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading} className="btn-modern">
          <i className="fas fa-times"></i> Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading}
          className="btn-modern"
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <i className={`fas ${isEditMode ? 'fa-save' : 'fa-play-circle'}`}></i> {isEditMode ? 'Update Session' : 'Start Session'}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SessionForm; 