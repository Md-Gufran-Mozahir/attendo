import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import '../styles/Unauthorized.css';

const Unauthorized = () => {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.type) {
      case 'admin': return '/admin-dashboard';
      case 'teacher': return '/teacher-dashboard';
      case 'student': return '/student-dashboard';
      default: return '/login';
    }
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <h1>401</h1>
        <h2>Unauthorized Access</h2>
        <p>
          You don't have permission to access this page. 
          This area is restricted to users with specific roles.
        </p>
        <div className="action-buttons">
          <Link to={getDashboardLink()} className="dashboard-link">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 