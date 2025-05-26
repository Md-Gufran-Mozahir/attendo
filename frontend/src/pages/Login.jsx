import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../context/authContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin, user } = useAuth();

  useEffect(() => {
    // Check if already logged in
    if (user) {
      redirectBasedOnUserType(user.type);
    }
  }, [user]);

  const redirectBasedOnUserType = (userType) => {
    if (userType === 'admin') {
      navigate('/admin-dashboard');
    } else if (userType === 'teacher') {
      navigate('/teacher-dashboard');
    } else if (userType === 'student') {
      navigate('/student-dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await login(email, password);
      
      // Check if we have a valid user from the response
      if (response && response.user) {
        // Update auth context
        authLogin(response.user);
        
        // Redirect based on user type
        redirectBasedOnUserType(response.user.type);
      } else {
        // This shouldn't happen with the updated login function, but just in case
        setError('Authentication successful but user data is missing. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAbout = () => {
    setShowAbout(!showAbout);
  };

  // Close modal when clicking outside
  const handleModalClick = (e) => {
    if (e.target.classList.contains('about-modal')) {
      setShowAbout(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay"></div>
      
      <div className="login-left-content">
        <h1>Attendo</h1>
        <h2>Attendance Management System</h2>
        <p>
          Welcome to Attendo, the smart attendance tracking solution for educational institutions. 
          Simplify attendance taking, generate reports, and improve student engagement with our 
          comprehensive platform designed for administrators, teachers, and students.
        </p>
        <button className="about-btn" onClick={toggleAbout}>Learn More</button>
      </div>
      
      <div className="login-card">
        <h3>Login to Attendo</h3>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
      
      {/* About Modal */}
      <div 
        className={`about-modal ${showAbout ? 'active' : ''}`}
        onClick={handleModalClick}
      >
        <div className="about-content">
          <button className="close-btn" onClick={toggleAbout}>×</button>
          <h2>About Attendo</h2>
          <p>
            Attendo is a comprehensive attendance management system designed to streamline the process of 
            tracking student attendance in educational institutions. Our platform provides powerful tools for 
            administrators, teachers, and students to manage and monitor attendance efficiently.
          </p>
          
          <h3>How It Works</h3>
          <p>
            Attendo simplifies attendance tracking through these easy steps:
          </p>
          <ul>
            <li><strong>For Administrators:</strong> Set up courses, classes, and manage user accounts. Generate reports to analyze attendance patterns.</li>
            <li><strong>For Teachers:</strong> Take attendance quickly for each class session, view attendance history, and identify students with attendance issues.</li>
            <li><strong>For Students:</strong> View your attendance records, receive notifications about absences, and track your attendance performance.</li>
          </ul>
          
          <div className="feature-list">
            <div className="feature-item">
              <h3>Real-time Tracking</h3>
              <p>Take and view attendance in real-time with our intuitive interface.</p>
            </div>
            
            <div className="feature-item">
              <h3>Comprehensive Reporting</h3>
              <p>Generate detailed reports on attendance patterns and trends.</p>
            </div>
            
            <div className="feature-item">
              <h3>Role-based Access</h3>
              <p>Different interfaces and permissions for administrators, teachers, and students.</p>
            </div>
            
            <div className="feature-item">
              <h3>Secure Authentication</h3>
              <p>Robust security measures to protect user data and privacy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;