import React, { useState, useEffect } from 'react';
import {
  getOverallAttendanceReport,
  sendAttendanceReports
} from '../services/attendanceService';
import { getAllPrograms } from '../services/programService';
import { getAllBatches } from '../services/batchService';

const AttendanceReports = () => {
  const [reportData, setReportData] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filters, setFilters] = useState({
    programId: '',
    batchId: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPrograms();
    fetchBatches();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await getAllPrograms();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setPrograms([]);
    }
  };

  const fetchBatches = async () => {
    try {
      const data = await getAllBatches();
      setBatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    
    if (!filters.programId && !filters.batchId) {
      setError('Please select either a Program or a Batch');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage('');
      
      const data = await getOverallAttendanceReport(
        filters.programId || null,
        filters.batchId || null,
        filters.startDate || null,
        filters.endDate || null
      );
      
      setReportData(Array.isArray(data) ? data : []);
      
      if (Array.isArray(data) && data.length === 0) {
        setSuccessMessage('No attendance data found for the selected criteria.');
      }
    } catch (error) {
      console.error('Error generating attendance report:', error);
      setReportData([]);
      setError(error.response?.data?.message || 'Failed to generate attendance report');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReports = async (batchId) => {
    if (!batchId) {
      setError('Please select a batch to send reports to');
      return;
    }
    
    if (window.confirm('Are you sure you want to send attendance reports to guardians?')) {
      try {
        setLoading(true);
        setError(null);
        setSuccessMessage('');
        
        const result = await sendAttendanceReports(batchId);
        
        setSuccessMessage(`Successfully sent reports to ${result.count} guardians.`);
      } catch (error) {
        console.error('Error sending attendance reports:', error);
        setError(error.response?.data?.message || 'Failed to send attendance reports');
      } finally {
        setLoading(false);
      }
    }
  };

  // Calculate average attendance for a subject
  const calculateAverageAttendance = (data) => {
    if (!data || data.length === 0) return 0;
    
    const totalAttendance = data.reduce((sum, record) => {
      return sum + (record.attendancePercentage || 0);
    }, 0);
    
    return Math.round(totalAttendance / data.length);
  };

  return (
    <div className="attendance-reports">
      <div className="reports-form-section">
        <h3>Generate Attendance Report</h3>
        <form onSubmit={handleGenerateReport} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="programId">Program</label>
              <select 
                id="programId"
                name="programId"
                value={filters.programId}
                onChange={handleInputChange}
              >
                <option value="">All Programs</option>
                {programs.map(program => (
                  <option key={program.programId} value={program.programId}>
                    {program.programName} ({program.programCode})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="batchId">Batch</label>
              <select 
                id="batchId"
                name="batchId"
                value={filters.batchId}
                onChange={handleInputChange}
              >
                <option value="">All Batches</option>
                {batches.map(batch => (
                  <option key={batch.batchId} value={batch.batchId}>
                    {batch.batchName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="button-group">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            
            <button 
              type="button" 
              className="action-btn"
              disabled={!filters.batchId || loading}
              onClick={() => handleSendReports(filters.batchId)}
            >
              Send Reports to Guardians
            </button>
          </div>
        </form>
      </div>
      
      {loading && <p className="loading">Loading attendance data...</p>}
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      
      {!loading && !error && reportData.length > 0 && (
        <div className="reports-content">
          <h3>Attendance Report</h3>
          
          <div className="report-summary">
            <div className="summary-card">
              <h4>Overall Attendance</h4>
              <div className="percentage">
                {calculateAverageAttendance(reportData)}%
              </div>
            </div>
            
            <div className="summary-card">
              <h4>Total Students</h4>
              <div className="count">
                {new Set(reportData.map(item => item.userId)).size}
              </div>
            </div>
            
            <div className="summary-card">
              <h4>Total Subjects</h4>
              <div className="count">
                {new Set(reportData.map(item => item.subjectId)).size}
              </div>
            </div>
          </div>
          
          <div className="report-table">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Present</th>
                  <th>Total</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((record, index) => (
                  <tr key={index}>
                    <td>{record.name}</td>
                    <td>{record.email}</td>
                    <td>{record.subjectName}</td>
                    <td>{record.presentCount}</td>
                    <td>{record.totalSessions}</td>
                    <td>
                      <div className="attendance-percentage">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${record.attendancePercentage}%` }}
                        >
                          <span>{record.attendancePercentage}%</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReports; 