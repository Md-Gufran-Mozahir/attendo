import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaUsers, FaGraduationCap, FaLayerGroup, FaSignOutAlt, FaBook } from 'react-icons/fa';

const AdminSidebar = () => {
  return (
    <div className="bg-gray-800 text-white h-screen fixed left-0 top-0 bottom-0 space-y-2 w-64">
      <div>
        <h3>Admin Panel</h3>
      </div>
      <div>
        <NavLink to="/admin-dashboard" className="nav-link">
          <FaUsers />
          <span>User Management</span>
        </NavLink>
        <NavLink to="/admin-dashboard?tab=student-details" className="nav-link">
          <FaGraduationCap />
          <span>Student Details</span>
        </NavLink>
        <NavLink to="/admin-dashboard?tab=batches" className="nav-link">
          <FaLayerGroup />
          <span>Batch Management</span>
        </NavLink>
        <NavLink to="/admin-dashboard?tab=subjects" className="nav-link">
          <FaBook />
          <span>Subject Management</span>
        </NavLink>
        <NavLink to="/login" className="nav-link">
          <FaSignOutAlt />
          <span>Logout</span>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;