import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/authContext';
import { 
  markAttendance, 
  getStudentAttendanceHistory, 
  getStudentAttendanceStats 
} from '../services/attendanceService';
import { getActiveSessionsForStudent } from '../services/sessionService';
import { getCurrentStudentSubjects } from '../services/studentService';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active-sessions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [userSubjects, setUserSubjects] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [markingSessionId, setMarkingSessionId] = useState(null);
  const [markingStatus, setMarkingStatus] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // No need to check token here since RoleBasedRoute already handles authentication

    if (activeTab === 'active-sessions') {
      fetchActiveSessions();
    } else if (activeTab === 'attendance-history') {
      fetchAttendanceHistory();
    } else if (activeTab === 'my-subjects') {
      fetchUserSubjects();
    }
  }, [activeTab]);

  const fetchActiveSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get active sessions
      const response = await getActiveSessionsForStudent();
      console.log('Active sessions data:', response.data);
      
      // Check if sessions are empty
      if (!response.data || response.data.length === 0) {
        console.log('No active sessions found');
        setActiveSessions([]);
        setLoading(false);
        return;
      }
      
      // Process each session to ensure it has the expected structure
      const processedSessions = response.data.map(session => {
        // Extract UniversityLocation data
        const locationName = session.UniversityLocation 
          ? session.UniversityLocation.campusName 
          : 'Unknown Location';
          
        // Fix any subject data issues
        const subjectInfo = session.Subject
          ? {
              name: session.Subject.subjectName || 'Unknown Subject',
              code: session.Subject.subjectCode || '',
              id: session.Subject.subjectId
            }
          : { name: 'Unknown Subject', code: '', id: null };
          
        // Fix any teacher data issues
        const teacherInfo = session.teacher
          ? {
              name: session.teacher.name || 'Not assigned',
              email: session.teacher.email || '',
              id: session.teacher.userId
            }
          : { name: 'Not assigned', email: '', id: null };
          
        // Return a well-structured session object
        return {
          ...session,
          subject: subjectInfo,
          teacher: teacherInfo,
          location: locationName,
          formattedStartTime: formatDate(session.startTime)
        };
      });
      
      console.log('Processed sessions:', processedSessions);
      
      // Get attendance history to check which sessions already have attendance
      const attendanceResponse = await getStudentAttendanceHistory();
      const markedSessionIds = attendanceResponse.data.map(record => record.sessionId);
      
      // Mark sessions that already have attendance
      const sessionsWithAttendanceStatus = processedSessions.map(session => ({
        ...session,
        alreadyMarked: markedSessionIds.includes(session.sessionId)
      }));
      
      setActiveSessions(sessionsWithAttendanceStatus);
    } catch (err) {
      console.error('Error fetching active sessions:', err);
      setError('Failed to load active sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStudentAttendanceHistory();
      setAttendanceHistory(response.data);
      
      // Get attendance statistics
      const statsResponse = await getStudentAttendanceStats();
      setAttendanceStats(statsResponse.data);
    } catch (err) {
      console.error('Error fetching attendance history:', err);
      setError('Failed to load attendance history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCurrentStudentSubjects();
      setUserSubjects(response.data);
    } catch (err) {
      console.error('Error fetching user subjects:', err);
      setError('Failed to load subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = (sessionId) => {
    setMarkingSessionId(sessionId);
    setMarkingStatus('getting-location');
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          submitAttendance(sessionId, latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setMarkingStatus('');
          
          // Handle specific geolocation error codes
          switch(error.code) {
            case error.PERMISSION_DENIED:
              setError('Location permission denied. Please enable location services in your browser settings and try again.');
              break;
            case error.POSITION_UNAVAILABLE:
              setError('Location information is unavailable. Please try again or check your device settings.');
              break;
            case error.TIMEOUT:
              setError('Location request timed out. Please try again.');
              break;
            default:
              setError('Failed to get your location. Please enable location services and try again.');
          }
          
          setTimeout(() => {
            setMarkingSessionId(null);
          }, 2000);
        },
        // Add geolocation options
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setMarkingStatus('');
      setError('Geolocation is not supported by this browser.');
      setTimeout(() => {
        setMarkingSessionId(null);
      }, 2000);
    }
  };

  const submitAttendance = async (sessionId, latitude, longitude) => {
    setMarkingStatus('submitting');
    try {
      const response = await markAttendance(sessionId, { latitude, longitude });
      
      const status = response.data.attendance.status;
      let message = 'Attendance marked successfully!';
      
      // If status is 'Pending', show a different message
      if (status === 'Pending') {
        message = 'Marked as pending, waiting for teacher approval.';
      }
      
      setSuccessMessage(message);
      setMarkingStatus('success');
      setError(null);
      
      setTimeout(() => {
        setMarkingStatus('');
        setMarkingSessionId(null);
        setSuccessMessage('');
        
        // Refresh the sessions
        fetchActiveSessions();
      }, 2000);
    } catch (err) {
      console.error('Error marking attendance:', err);
      setMarkingStatus('error');
      setError(err.response?.data?.message || 'Failed to mark attendance. Please try again.');
      setTimeout(() => {
        setMarkingStatus('');
        setMarkingSessionId(null);
      }, 2000);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const calculateAttendancePercentage = (present, total) => {
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return '#4CAF50';  // Green
    if (percentage >= 60) return '#FF9800';  // Orange
    return '#F44336';  // Red
  };

  return (
    <div className="dashboard-container">
      <Header title="Student Dashboard" />
      
      <div className="student-dashboard">
        <div className="dashboard-welcome">
          <h2>Welcome, {user ? user.name : 'Student'}</h2>
          <p className="dashboard-subtitle">Track your attendance and view your subjects</p>
        </div>
        
        <div className="dashboard-stats">
          {Object.keys(attendanceStats).length > 0 && (
            <div className="overall-stats">
              <div className="stat-card overall">
                <h3>Overall Attendance</h3>
                <div className="percentage-badge" 
                  style={{ 
                    backgroundColor: getAttendanceColor(
                      calculateAttendancePercentage(
                        Object.values(attendanceStats).reduce((total, subject) => total + subject.present, 0),
                        Object.values(attendanceStats).reduce((total, subject) => total + subject.total, 0)
                      )
                    )
                  }}>
                  {calculateAttendancePercentage(
                    Object.values(attendanceStats).reduce((total, subject) => total + subject.present, 0),
                    Object.values(attendanceStats).reduce((total, subject) => total + subject.total, 0)
                  )}%
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="tabs">
          <button
            className={activeTab === 'active-sessions' ? 'active' : ''}
            onClick={() => setActiveTab('active-sessions')}
          >
            Active Sessions
          </button>
          <button
            className={activeTab === 'attendance-history' ? 'active' : ''}
            onClick={() => setActiveTab('attendance-history')}
          >
            Attendance History
          </button>
          <button
            className={activeTab === 'my-subjects' ? 'active' : ''}
            onClick={() => setActiveTab('my-subjects')}
          >
            My Subjects
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {activeTab === 'active-sessions' && (
          <div className="tab-content">
            <h2>Active Sessions</h2>
            
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading sessions...</p>
              </div>
            ) : activeSessions.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-calendar-times empty-icon"></i>
                <p>No active sessions found at the moment.</p>
                <p className="empty-state-subtitle">Check back later for upcoming sessions.</p>
              </div>
            ) : (
              <div className="sessions-list">
                <div className="session-cards">
                  {activeSessions.map((session) => (
                    <div className="session-card" key={session.sessionId}>
                      <div className="session-header">
                        <h3>{session.subject?.name || 'Unknown Subject'}</h3>
                        <span className="session-time">{session.formattedStartTime || formatDate(session.startTime)}</span>
                      </div>
                      <div className="session-details">
                        <div className="session-detail">
                          <span className="detail-label">Subject Code:</span>
                          <span className="detail-value">{session.subject?.code || 'N/A'}</span>
                        </div>
                        <div className="session-detail">
                          <span className="detail-label">Teacher:</span>
                          <span className="detail-value">{session.teacher?.name || 'Not assigned'}</span>
                        </div>
                        <div className="session-detail">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">{session.location || session.UniversityLocation?.campusName || 'Unknown Location'}</span>
                        </div>
                        <div className="session-detail">
                          <span className="detail-label">Status:</span>
                          <span className="detail-value session-status">{session.status}</span>
                        </div>
                      </div>
                      <div className="session-actions">
                        {markingSessionId === session.sessionId ? (
                          <div className="attendance-status">
                            {markingStatus === 'getting-location' && (
                              <div className="loading-status">
                                <div className="spinner-small"></div>
                                <span>Getting location...</span>
                              </div>
                            )}
                            {markingStatus === 'submitting' && (
                              <div className="loading-status">
                                <div className="spinner-small"></div>
                                <span>Submitting...</span>
                              </div>
                            )}
                            {markingStatus === 'success' && <span className="success">{successMessage}</span>}
                            {markingStatus === 'error' && (
                              <div className="error-status">
                                <span className="error">Failed to mark!</span>
                                <button 
                                  onClick={() => handleMarkAttendance(session.sessionId)} 
                                  className="retry-btn"
                                >
                                  Retry
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleMarkAttendance(session.sessionId)}
                            className="mark-btn"
                            disabled={session.alreadyMarked}
                          >
                            {session.alreadyMarked ? 'Already Marked' : 'Mark Present'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance-history' && (
          <div className="tab-content">
            <h2>Attendance History</h2>
            
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading attendance history...</p>
              </div>
            ) : (
              <>
                {Object.keys(attendanceStats).length > 0 && (
                  <div className="attendance-stats">
                    <h3>Attendance Percentage by Subject</h3>
                    <div className="stats-container">
                      {Object.keys(attendanceStats).map(subject => {
                        const percentage = calculateAttendancePercentage(
                          attendanceStats[subject].present,
                          attendanceStats[subject].total
                        );
                        return (
                          <div className="stat-card" key={subject}>
                            <h4>{subject}</h4>
                            <div className="percentage-circle" style={{ 
                              background: `conic-gradient(${getAttendanceColor(percentage)} ${percentage * 3.6}deg, #f0f0f0 0deg)`
                            }}>
                              <span>{percentage}%</span>
                            </div>
                            <p>Present: {attendanceStats[subject].present}/{attendanceStats[subject].total}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {attendanceHistory.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-history empty-icon"></i>
                    <p>No attendance records found.</p>
                    <p className="empty-state-subtitle">Your attendance history will appear here once you start attending sessions.</p>
                  </div>
                ) : (
                  <div className="attendance-history">
                    <h3>Detailed History</h3>
                    <div className="attendance-filters">
                      <div className="filter-group">
                        <label>Show:</label>
                        <select className="filter-select">
                          <option value="all">All Records</option>
                          <option value="present">Present Only</option>
                          <option value="absent">Absent Only</option>
                        </select>
                      </div>
                      <div className="filter-group">
                        <label>Subject:</label>
                        <select className="filter-select">
                          <option value="all">All Subjects</option>
                          {[...new Set(attendanceHistory.map(record => record.subject))].map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="attendance-table-container">
                      <table className="attendance-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Subject</th>
                            <th>Teacher</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceHistory.map((record) => (
                            <tr key={record.attendanceId}>
                              <td>{formatDate(record.date)}</td>
                              <td>{record.subject}</td>
                              <td>{record.teacher}</td>
                              <td>
                                <span className={`status-badge ${record.status.toLowerCase()}`}>
                                  {record.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'my-subjects' && (
          <div className="tab-content">
            <h2>My Enrolled Subjects</h2>
            
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading subjects...</p>
              </div>
            ) : userSubjects.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-book empty-icon"></i>
                <p>No subjects found.</p>
                <p className="empty-state-subtitle">Please contact your administrator if you believe this is an error.</p>
              </div>
            ) : (
              <div className="subjects-container">
                {userSubjects.map((subject) => (
                  <div className="subject-card" key={subject.subjectId}>
                    <div className="subject-code">{subject.subjectCode}</div>
                    <h3 className="subject-name">{subject.subjectName}</h3>
                    <div className="subject-details">
                      <div className="subject-detail">
                        <span className="detail-label">Teacher:</span>
                        <span className="detail-value">{subject.teacher ? subject.teacher.name : 'Not assigned'}</span>
                      </div>
                      <div className="subject-detail">
                        <span className="detail-label">Semester:</span>
                        <span className="detail-value">{subject.semester}</span>
                      </div>
                      {attendanceStats[subject.subjectName] && (
                        <div className="subject-detail">
                          <span className="detail-label">Attendance:</span>
                          <span className="detail-value">
                            <span className="attendance-badge" style={{
                              backgroundColor: getAttendanceColor(
                                calculateAttendancePercentage(
                                  attendanceStats[subject.subjectName].present,
                                  attendanceStats[subject.subjectName].total
                                )
                              )
                            }}>
                              {calculateAttendancePercentage(
                                attendanceStats[subject.subjectName].present,
                                attendanceStats[subject.subjectName].total
                              )}%
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;