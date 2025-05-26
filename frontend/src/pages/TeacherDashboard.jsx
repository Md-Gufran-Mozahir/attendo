import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Spinner } from 'react-bootstrap';
import Header from '../components/Header';
import SessionForm from '../components/teacher/SessionForm';
import { useAuth } from '../context/authContext';
import { getTeacherSessions, closeSession, deleteSession, updateSession } from '../services/sessionService';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sessions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSessions, setCurrentSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  useEffect(() => {
    // Fetch teacher sessions based on activeTab
    if (activeTab === 'sessions' || activeTab === 'past-sessions') {
      fetchSessions();
    } else if (activeTab === 'attendance') {
      fetchAttendanceRecords();
    }
  }, [activeTab]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      // Get sessions for the current teacher
      const response = await getTeacherSessions();
      
      // Process sessions to ensure proper data structure
      const processedSessions = (response.data || []).map(session => {
        // Extract subject name from various possible locations in the data structure
        let subjectName = 'Unknown Subject';
        if (session.Subject && session.Subject.name) {
          subjectName = session.Subject.name;
        } else if (session.Subject && session.Subject.subjectName) {
          subjectName = session.Subject.subjectName;
        } else if (session.subject && session.subject.name) {
          subjectName = session.subject.name;
        } else if (session.subjectName) {
          subjectName = session.subjectName;
        }
        
        return {
          ...session,
          subject: { 
            ...(session.Subject || {}), 
            name: subjectName,
            subjectId: session.subjectId
          },
          program: session.Program || { programName: 'Unknown Program' },
          batch: session.Batch || { name: session.batchName || 'Unknown Batch' },
          location: session.UniversityLocation || { campusName: 'Unknown Location' },
          attendanceCount: session.attendanceCount || 0,
          totalStudents: session.totalStudents || 0
        };
      });
      
      // Split sessions into current and past based on status
      setCurrentSessions(processedSessions.filter(session => session.status === 'Open'));
      setPastSessions(processedSessions.filter(session => session.status === 'Closed'));
      
      setError(null);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    // Implementation for fetching attendance records
    // Similar to fetchSessions
  };

  const startNewSession = () => {
    setEditingSession(null);
    setShowSessionForm(true);
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setShowSessionForm(true);
  };

  const handleDeleteSession = (session) => {
    setSessionToDelete(session);
    setShowDeleteModal(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    
    try {
      setLoading(true);
      await deleteSession(sessionToDelete.sessionId);
      
      // Remove the deleted session from the list
      if (sessionToDelete.status === 'Open') {
        setCurrentSessions(prevSessions => 
          prevSessions.filter(session => session.sessionId !== sessionToDelete.sessionId)
        );
      } else {
        setPastSessions(prevSessions => 
          prevSessions.filter(session => session.sessionId !== sessionToDelete.sessionId)
        );
      }
      
      // Close the modal
      setShowDeleteModal(false);
      setSessionToDelete(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Failed to delete session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCreated = (session) => {
    // Debug log to inspect the session data
    console.log("New session created:", session);
    
    // Add the new session to current sessions list
    setCurrentSessions(prevSessions => [session, ...prevSessions]);
  };

  const handleSessionUpdated = (updatedSession) => {
    console.log("Session updated:", updatedSession);
    
    // Update the session in the current sessions list
    setCurrentSessions(prevSessions => 
      prevSessions.map(session => 
        session.sessionId === updatedSession.sessionId ? updatedSession : session
      )
    );
  };

  const handleCloseSession = async (sessionId) => {
    try {
      setLoading(true);
      await closeSession(sessionId);
      
      // Refresh sessions list
      fetchSessions();
      
    } catch (error) {
      console.error('Error closing session:', error);
      setError('Failed to close session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewAttendance = (sessionId) => {
    // Navigate to session attendance page
    navigate(`/sessions/${sessionId}/attendance`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="dashboard-container">
      <Header title="Teacher Dashboard" />
      
      <div className="teacher-dashboard">
        <div className="dashboard-welcome">
          <h2>Welcome, {user ? user.name : 'Teacher'}</h2>
        </div>
        
        <div className="tabs">
          <button
            className={activeTab === 'sessions' ? 'active' : ''}
            onClick={() => setActiveTab('sessions')}
          >
            Current Sessions
          </button>
          <button
            className={activeTab === 'past-sessions' ? 'active' : ''}
            onClick={() => setActiveTab('past-sessions')}
          >
            Past Sessions
          </button>
          <button
            className={activeTab === 'attendance' ? 'active' : ''}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance Records
          </button>
          <button
            className={activeTab === 'reports' ? 'active' : ''}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </div>

        {activeTab === 'sessions' && (
          <div className="tab-content">
            <div className="header-with-action">
              <h2>Current Sessions</h2>
              <button onClick={startNewSession} className="action-btn primary-btn">
                <i className="fas fa-plus-circle"></i> Start New Session
              </button>
            </div>
            
            {loading && <p className="loading">Loading sessions...</p>}
            {error && <p className="error-message">{error}</p>}
            
            {!loading && !error && currentSessions.length === 0 && (
              <p>No active sessions found. Start a new session!</p>
            )}
            
            {!loading && !error && currentSessions.length > 0 && (
              <div className="sessions-list">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Program</th>
                      <th>Batch</th>
                      <th>Start Time</th>
                      <th>Attendance</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSessions.map((session) => (
                      <tr key={session.sessionId}>
                        <td>
                          {/* Directly access the name from subject object with multiple fallbacks */}
                          {session.subject?.name || 
                           session.Subject?.name || 
                           session.Subject?.subjectName || 
                           session.subjectName || 
                           'Unknown Subject'}
                        </td>
                        <td>{session.program?.programName || 'Unknown Program'}</td>
                        <td>{session.batch?.name || session.batch?.batchName || 'Unknown Batch'}</td>
                        <td>{formatDate(session.startTime)}</td>
                        <td>{session.attendanceCount || 0}/{session.totalStudents || 0}</td>
                        <td>
                          <span className={`status-badge ${session.status.toLowerCase()}`}>
                            {session.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => viewAttendance(session.sessionId)}
                              className="view-btn btn-sm"
                              title="View Attendance"
                            >
                              <i className="fas fa-eye"></i> View
                            </button>
                            <button
                              onClick={() => handleEditSession(session)}
                              className="edit-btn btn-sm"
                              title="Edit Session"
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button
                              onClick={() => handleCloseSession(session.sessionId)}
                              title="Close Session"
                              className="session-close-button"
                            >
                              <i className="fas fa-lock"></i> Close
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'past-sessions' && (
          <div className="tab-content">
            <h2>Past Sessions</h2>
            
            {loading && <p className="loading">Loading sessions...</p>}
            {error && <p className="error-message">{error}</p>}
            
            {!loading && !error && pastSessions.length === 0 && (
              <p>No past sessions found.</p>
            )}
            
            {!loading && !error && pastSessions.length > 0 && (
              <div className="sessions-list">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Program</th>
                      <th>Batch</th>
                      <th>Time</th>
                      <th>Attendance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastSessions.map((session) => (
                      <tr key={session.sessionId}>
                        <td>
                          {/* Directly access the name from subject object with multiple fallbacks */}
                          {session.subject?.name || 
                           session.Subject?.name || 
                           session.Subject?.subjectName || 
                           session.subjectName || 
                           'Unknown Subject'}
                        </td>
                        <td>{session.program?.programName || 'Unknown Program'}</td>
                        <td>{session.batch?.name || session.batch?.batchName || 'Unknown Batch'}</td>
                        <td>
                          {formatDate(session.startTime)}
                          {session.endTime ? ` - ${formatDate(session.endTime)}` : ''}
                        </td>
                        <td>{session.attendanceCount || 0}/{session.totalStudents || 0}</td>
                        <td className="action-buttons">
                          <button
                            onClick={() => viewAttendance(session.sessionId)}
                            className="view-btn btn-sm"
                            title="View Attendance"
                          >
                            <i className="fas fa-eye"></i> View
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session)}
                            className="delete-btn btn-sm"
                            title="Delete Session"
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="tab-content">
            <h2>Attendance Records</h2>
            <p>This feature is coming soon...</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="tab-content">
            <h2>Reports</h2>
            <p>This feature is coming soon...</p>
          </div>
        )}
      </div>
      
      {/* Session Form Modal */}
      <SessionForm 
        show={showSessionForm}
        onHide={() => {
          setShowSessionForm(false);
          setEditingSession(null);
        }}
        onSessionCreated={handleSessionCreated}
        onSessionUpdated={handleSessionUpdated}
        sessionToEdit={editingSession}
      />
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this session? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={loading} className="btn-modern">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteSession} disabled={loading} className="btn-modern">
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <i className="fas fa-trash"></i> Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TeacherDashboard;