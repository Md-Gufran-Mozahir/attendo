import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

/**
 * Component for protecting routes based on user role
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles that can access this route
 * @param {string} props.redirectPath - Path to redirect unauthorized users to
 */
const RoleBasedRoute = ({
  children,
  allowedRoles,
  redirectPath = '/unauthorized'
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (!allowedRoles.includes(user.type)) {
    return <Navigate to={redirectPath} replace />;
  }

  // Render the protected component
  return children;
};

export default RoleBasedRoute; 