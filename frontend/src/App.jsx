import './App.css';
import './styles/Button.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Unauthorized from './pages/Unauthorized';
import SessionAttendanceView from './components/teacher/SessionAttendanceView';
import AuthContext from './context/authContext';
import RoleBasedRoute from './utils/RoleBasedRoute';

function App() {
  return (
    <AuthContext>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected admin routes */}
            <Route 
              path="/admin-dashboard" 
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              } 
            />
            
            {/* Protected teacher routes */}
            <Route 
              path="/teacher-dashboard" 
              element={
                <RoleBasedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherDashboard />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/sessions/:sessionId/attendance" 
              element={
                <RoleBasedRoute allowedRoles={['teacher', 'admin']}>
                  <SessionAttendanceView />
                </RoleBasedRoute>
              } 
            />
            
            {/* Protected student routes */}
            <Route 
              path="/student-dashboard" 
              element={
                <RoleBasedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </RoleBasedRoute>
              } 
            />
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </AuthContext>
  );
}

export default App;
