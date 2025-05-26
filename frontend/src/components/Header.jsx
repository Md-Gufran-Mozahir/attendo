import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import '../styles/Header.css';

const Header = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <h1>{title || 'Attendo'}</h1>
        <div className="user-info">
          {user && (
            <>
              <span className="user-name">
                {user.name}
                <span className="user-role">{user.type}</span>
              </span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 