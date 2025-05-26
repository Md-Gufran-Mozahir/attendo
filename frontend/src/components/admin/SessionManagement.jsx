import React, { useState, useEffect } from 'react';
// Import individual components
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';

import { 
  getAllSessions, 
  createSession, 
  updateSession,
  closeSession,
  deleteSession
} from '../../services/sessionService';
import { getAllSubjects } from '../../services/subjectService';
import { getAllPrograms } from '../../services/programService';
import { getAllLocations } from '../../services/locationService';
import { getAllTeachers } from '../../services/userService';
import { getAllBatches } from '../../services/batchService';

const SessionManagement = () => {
  // States for sessions data
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    subjectId: '',
    teacherId: '',
    batchId: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    teacherId: '',
    programId: '',
    batchId: '',
    subjectId: '',
    locationId: '',
    startTime: '',
    endTime: '',
    status: 'Open'
  });
  
  // UI states
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load all required data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [
          sessionsRes,
          subjectsRes,
          programsRes, 
          locationsRes,
          teachersRes,
          batchesRes
        ] = await Promise.all([
          getAllSessions(),
          getAllSubjects(),
          getAllPrograms(),
          getAllLocations(),
          getAllTeachers(),
          getAllBatches()
        ]);
        
        console.log('Batches response:', batchesRes);
        
        setSessions(sessionsRes.data);
        setSubjects(subjectsRes.data);
        setPrograms(programsRes.data);
        setLocations(locationsRes.data);
        // Filter to only get teachers
        setTeachers(teachersRes.data.filter(user => user.type === 'teacher'));
        setBatches(batchesRes.data || []);  // Ensure it's at least an empty array
        console.log('Batches data after setting:', batchesRes.data); // Debug: log batch data
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({
          text: 'Failed to load data. Please try again.',
          type: 'danger'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };
  
  // Apply filters
  const applyFilters = async () => {
    try {
      setLoading(true);
      const response = await getAllSessions(filters);
      setSessions(response.data);
      setShowFilters(false);
    } catch (error) {
      console.error('Error applying filters:', error);
      setMessage({
        text: 'Failed to filter sessions. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Reset filters
  const resetFilters = async () => {
    setFilters({
      subjectId: '',
      teacherId: '',
      batchId: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    
    try {
      setLoading(true);
      const response = await getAllSessions();
      setSessions(response.data);
      setShowFilters(false);
    } catch (error) {
      console.error('Error resetting filters:', error);
      setMessage({
        text: 'Failed to reset filters. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      teacherId: '',
      programId: '',
      batchId: '',
      subjectId: '',
      locationId: '',
      startTime: '',
      endTime: '',
      status: 'Open'
    });
    setEditingSession(null);
  };
  
  // Format date for form inputs
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };

  // Handle "Add New" button click
  const handleAddNewClick = () => {
    resetForm();
    setShowForm(true);
  };

  // Handle edit button click
  const handleEditClick = (session) => {
    setFormData({
      teacherId: session.teacherId.toString(),
      programId: session.programId.toString(),
      batchId: session.batchId.toString(),
      subjectId: session.subjectId.toString(),
      locationId: session.locationId.toString(),
      startTime: formatDateForInput(session.startTime),
      endTime: formatDateForInput(session.endTime),
      status: session.status
    });
    setEditingSession(session);
    setShowForm(true);
  };

  // Handle delete button click
  const handleDeleteClick = (session) => {
    setSessionToDelete(session);
    setShowDeleteModal(true);
  };

  // Handle close session button click
  const handleCloseSessionClick = async (session) => {
    try {
      setLoading(true);
      await closeSession(session.sessionId);
      
      // Refresh sessions list
      const response = await getAllSessions(filters);
      setSessions(response.data);
      
      setMessage({
        text: 'Session closed successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error closing session:', error);
      setMessage({
        text: error.response?.data?.message || 'Failed to close session. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;
    
    try {
      setLoading(true);
      await deleteSession(sessionToDelete.sessionId);
      
      setMessage({
        text: 'Session deleted successfully!',
        type: 'success'
      });
      
      // Refresh sessions list
      const response = await getAllSessions(filters);
      setSessions(response.data);
      
      setShowDeleteModal(false);
      setSessionToDelete(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      setMessage({
        text: error.response?.data?.message || 'Failed to delete session. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.teacherId || !formData.programId || !formData.batchId || 
        !formData.subjectId || !formData.locationId || !formData.startTime) {
      setMessage({
        text: 'Please fill in all required fields',
        type: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Format date objects for API
      const sessionData = {
        teacherId: parseInt(formData.teacherId),
        programId: parseInt(formData.programId),
        batchId: parseInt(formData.batchId),
        subjectId: parseInt(formData.subjectId),
        locationId: parseInt(formData.locationId),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        status: formData.status
      };
      
      if (editingSession) {
        // Update existing session
        await updateSession(editingSession.sessionId, sessionData);
        setMessage({
          text: 'Session updated successfully!',
          type: 'success'
        });
      } else {
        // Create new session
        await createSession(sessionData);
        setMessage({
          text: 'New session created successfully!',
          type: 'success'
        });
      }
      
      // Refresh sessions list
      const response = await getAllSessions(filters);
      setSessions(response.data);
      
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving session:', error);
      setMessage({
        text: error.response?.data?.message || 'Failed to save session. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get subject name by ID
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.subjectId === subjectId);
    return subject ? subject.name || subject.subjectName : 'Unknown Subject';
  };

  // Get teacher name by ID
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.userId === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  // Get batch name by ID
  const getBatchName = (batchId) => {
    const batch = batches.find(b => b.batchId === batchId);
    console.log("Found batch:", batch); // Debug: log the found batch
    return batch ? (batch.batchName || batch.name || `Batch ID: ${batch.batchId}`) : 'Unknown Batch';
  };

  // Get location name by ID
  const getLocationName = (locationId) => {
    const location = locations.find(l => l.locationId === locationId);
    return location ? location.campusName : 'Unknown Location';
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Session Management</h2>
      
      {message.text && (
        <Alert 
          variant={message.type} 
          dismissible 
          onClose={() => setMessage({ text: '', type: '' })}
        >
          {message.text}
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between mb-3">
            <div>
              <Button 
                variant="primary" 
                onClick={handleAddNewClick}
                className="me-2"
                disabled={loading}
              >
                Create New Session
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
            <div>
              {loading && (
                <Spinner animation="border" size="sm" className="me-2" />
              )}
              {sessions.length > 0 && (
                <span className="text-muted">
                  {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
                </span>
              )}
            </div>
          </div>
          
          {showFilters && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Filter Sessions</Card.Title>
                <Form>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Subject</Form.Label>
                        <Form.Select
                          name="subjectId"
                          value={filters.subjectId}
                          onChange={handleFilterChange}
                        >
                          <option value="">All Subjects</option>
                          {subjects.map(subject => (
                            <option 
                              key={subject.subjectId} 
                              value={subject.subjectId}
                            >
                              {subject.name || subject.subjectName}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Teacher</Form.Label>
                        <Form.Select
                          name="teacherId"
                          value={filters.teacherId}
                          onChange={handleFilterChange}
                        >
                          <option value="">All Teachers</option>
                          {teachers.map(teacher => (
                            <option 
                              key={teacher.userId} 
                              value={teacher.userId}
                            >
                              {teacher.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Batch</Form.Label>
                        <Form.Select
                          name="batchId"
                          value={filters.batchId}
                          onChange={handleFilterChange}
                        >
                          <option value="">All Batches</option>
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
                  </Row>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          name="status"
                          value={filters.status}
                          onChange={handleFilterChange}
                        >
                          <option value="">All Statuses</option>
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="startDate"
                          value={filters.startDate}
                          onChange={handleFilterChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="endDate"
                          value={filters.endDate}
                          onChange={handleFilterChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      onClick={applyFilters}
                      disabled={loading}
                    >
                      Apply Filters
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={resetFilters}
                      disabled={loading}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
          
          {showForm && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>{editingSession ? 'Edit Session' : 'Create New Session'}</Card.Title>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Teacher</Form.Label>
                        <Form.Select
                          name="teacherId"
                          value={formData.teacherId}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Teacher</option>
                          {teachers.map(teacher => (
                            <option 
                              key={teacher.userId} 
                              value={teacher.userId}
                            >
                              {teacher.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Program</Form.Label>
                        <Form.Select
                          name="programId"
                          value={formData.programId}
                          onChange={handleInputChange}
                          required
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
                        <Form.Label>Subject</Form.Label>
                        <Form.Select
                          name="subjectId"
                          value={formData.subjectId}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.programId}
                        >
                          <option value="">Select Subject</option>
                          {subjects
                            .filter(subject => !formData.programId || subject.programId === parseInt(formData.programId))
                            .map(subject => (
                              <option 
                                key={subject.subjectId} 
                                value={subject.subjectId}
                              >
                                {subject.name || subject.subjectName}
                              </option>
                            ))
                          }
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Select
                          name="locationId"
                          value={formData.locationId}
                          onChange={handleInputChange}
                          required
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
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Open">Open</option>
                          <option value="Closed">Closed</option>
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
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex gap-2">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : (editingSession ? 'Update Session' : 'Create Session')}
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      
      <Row>
        <Col>
          <h4>Sessions</h4>
          {loading && !sessions.length ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <p>No sessions found. Create a new session to get started.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Batch</th>
                  <th>Location</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.sessionId}>
                    <td>{getSubjectName(session.subjectId)}</td>
                    <td>{getTeacherName(session.teacherId)}</td>
                    <td>{getBatchName(session.batchId)}</td>
                    <td>{getLocationName(session.locationId)}</td>
                    <td>{formatDate(session.startTime)}</td>
                    <td>{formatDate(session.endTime)}</td>
                    <td>
                      <Badge bg={session.status === 'Open' ? 'success' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button 
                          variant="info" 
                          size="sm"
                          onClick={() => handleEditClick(session)}
                        >
                          Edit
                        </Button>
                        {session.status === 'Open' && (
                          <Button 
                            variant="warning" 
                            size="sm"
                            onClick={() => handleCloseSessionClick(session)}
                          >
                            Close
                          </Button>
                        )}
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeleteClick(session)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this session? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SessionManagement; 