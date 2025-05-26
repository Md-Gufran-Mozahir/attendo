import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import Header from '../Header';
import { getSessionById } from '../../services/sessionService';
import { getAttendanceBySession, updateAttendanceStatus, verifyAllAttendance } from '../../services/attendanceService';
import './SessionAttendanceView.css';

const SessionAttendanceView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [updateComment, setUpdateComment] = useState('');

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  const fetchSessionData = async () => {
    setLoading(true);
    try {
      // Fetch session details
      const sessionResponse = await getSessionById(sessionId);
      setSession(sessionResponse.data);
      
      // Fetch attendance for this session
      const attendanceResponse = await getAttendanceBySession(sessionId);
      setAttendanceList(attendanceResponse.data);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching session data:', err);
      setError('Failed to load session data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = (attendance) => {
    setSelectedAttendance(attendance);
    setUpdatedStatus(attendance.status);
    setUpdateComment(attendance.teacherComment || '');
    setShowUpdateModal(true);
  };

  const saveAttendanceUpdate = async () => {
    if (!selectedAttendance) return;
    
    setLoading(true);
    try {
      await updateAttendanceStatus(
        selectedAttendance.attendanceId, 
        { status: updatedStatus, teacherComment: updateComment }
      );
      
      // Close modal and refresh data
      setShowUpdateModal(false);
      setSuccessMessage('Attendance updated successfully');
      
      // Update the local state without refetching
      setAttendanceList(prevList => 
        prevList.map(item => 
          item.attendanceId === selectedAttendance.attendanceId 
            ? { ...item, status: updatedStatus, teacherComment: updateComment }
            : item
        )
      );
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError('Failed to update attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAll = async () => {
    setLoading(true);
    try {
      await verifyAllAttendance(sessionId);
      setSuccessMessage('All attendance records verified successfully');
      
      // Update local state to mark all as Present
      setAttendanceList(prevList => 
        prevList.map(item => 
          item.status === 'Pending' ? { ...item, status: 'Present' } : item
        )
      );
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error verifying all attendance:', err);
      setError('Failed to verify all attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Present': return 'status-present';
      case 'Absent': return 'status-absent';
      case 'Pending': return 'status-pending';
      case 'Late': return 'status-late';
      default: return '';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="attendance-view-container">
      <Header title="Session Attendance" />
      
      <div className="attendance-content">
        <div className="navigation-buttons">
          <Button variant="outline-secondary" onClick={() => navigate('/teacher-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
        
        {loading && (
          <div className="loading-spinner">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}
        
        {error && <Alert variant="danger">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        
        {session && (
          <div className="session-details">
            <h2>Session Details</h2>
            <div className="session-info">
              <p><strong>Subject:</strong> {session.Subject?.subjectName || 'N/A'}</p>
              <p><strong>Batch:</strong> {session.Batch?.name || 'N/A'}</p>
              <p><strong>Time:</strong> {formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}</p>
              <p><strong>Location:</strong> {session.UniversityLocation?.campusName || 'N/A'}</p>
              <p><strong>Status:</strong> <span className={`session-status ${session.status.toLowerCase()}`}>{session.status}</span></p>
            </div>
          </div>
        )}
        
        <div className="attendance-list-section">
          <div className="header-with-actions">
            <h2>Student Attendance</h2>
            {attendanceList.some(a => a.status === 'Pending') && (
              <Button 
                variant="success" 
                onClick={handleVerifyAll}
                disabled={loading}
              >
                Verify All Pending
              </Button>
            )}
          </div>
          
          {attendanceList.length === 0 ? (
            <div className="no-records">
              <p>No attendance records found for this session.</p>
            </div>
          ) : (
            <div className="attendance-table-wrapper">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll Number</th>
                    <th>Marked At</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Comment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.map((attendance) => (
                    <tr key={attendance.attendanceId}>
                      <td>{attendance.student?.name || 'Unknown'}</td>
                      <td>{attendance.student?.rollNumber || 'N/A'}</td>
                      <td>{formatDateTime(attendance.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(attendance.status)}`}>
                          {attendance.status}
                        </span>
                      </td>
                      <td>
                        {attendance.latitude && attendance.longitude ? (
                          <span className="location-coords">
                            {parseFloat(attendance.latitude).toFixed(4)}, 
                            {parseFloat(attendance.longitude).toFixed(4)}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td>{attendance.teacherComment || '-'}</td>
                      <td>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handleUpdateAttendance(attendance)}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Attendance Update Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAttendance && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Student</Form.Label>
                <Form.Control 
                  type="text" 
                  value={selectedAttendance.student?.name || 'Unknown'} 
                  disabled 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  value={updatedStatus} 
                  onChange={(e) => setUpdatedStatus(e.target.value)}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Pending">Pending</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Teacher Comment</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={updateComment} 
                  onChange={(e) => setUpdateComment(e.target.value)} 
                  placeholder="Add a comment (optional)"
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={saveAttendanceUpdate}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SessionAttendanceView; 