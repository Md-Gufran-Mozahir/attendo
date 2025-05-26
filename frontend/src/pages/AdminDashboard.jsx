import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import Header from '../components/Header';
import UserManagement from '../components/UserManagement';
import StudentDetailsForm from '../components/StudentDetailsForm';
import BatchManagement from '../components/BatchManagement';
import SubjectManagement from '../components/SubjectManagement';
import StudentSubjectManagement from '../components/admin/StudentSubjectManagement';
import TeacherProgramManagement from '../components/admin/TeacherProgramManagement';
import LocationManagement from '../components/admin/LocationManagement';
import SessionManagement from '../components/admin/SessionManagement';
import { Tabs, Tab, Box, Container, Paper } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import BookIcon from '@mui/icons-material/Book';
import LinkIcon from '@mui/icons-material/Link';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventNoteIcon from '@mui/icons-material/EventNote';
import '../styles/AdminDashboard.css';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for tab parameter in URL
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'student-details') {
      setTabValue(1);
    } else if (tabParam === 'batches') {
      setTabValue(2);
    } else if (tabParam === 'subjects') {
      setTabValue(3);
    } else if (tabParam === 'student-subjects') {
      setTabValue(4);
    } else if (tabParam === 'teacher-programs') {
      setTabValue(5);
    } else if (tabParam === 'locations') {
      setTabValue(6);
    } else if (tabParam === 'sessions') {
      setTabValue(7);
    } else {
      setTabValue(0);
    }
  }, [location]);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
    // Update URL query parameter based on selected tab
    const params = new URLSearchParams();
    if (newValue === 1) {
      params.set('tab', 'student-details');
    } else if (newValue === 2) {
      params.set('tab', 'batches');
    } else if (newValue === 3) {
      params.set('tab', 'subjects');
    } else if (newValue === 4) {
      params.set('tab', 'student-subjects');
    } else if (newValue === 5) {
      params.set('tab', 'teacher-programs');
    } else if (newValue === 6) {
      params.set('tab', 'locations');
    } else if (newValue === 7) {
      params.set('tab', 'sessions');
    }
    navigate({ search: params.toString() });
  };

  if (!user || user.type !== 'admin') {
    navigate('/login');
    return null;
  }

  return (
    <div className="dashboard-container">
      <Header title="Admin Dashboard" />
      
      <div className="admin-content">
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ borderRadius: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleChange} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  py: 2
                }
              }}
            >
              <Tab icon={<PeopleIcon />} label="User Management" />
              <Tab icon={<SchoolIcon />} label="Student Details" />
              <Tab icon={<ClassIcon />} label="Batch Management" />
              <Tab icon={<BookIcon />} label="Subject Management" />
              <Tab icon={<LinkIcon />} label="Student-Subject" />
              <Tab icon={<AssignmentIndIcon />} label="Teacher-Program" />
              <Tab icon={<LocationOnIcon />} label="Campus Locations" />
              <Tab icon={<EventNoteIcon />} label="Session Management" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <UserManagement />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <StudentDetailsForm />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <BatchManagement />
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <SubjectManagement />
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <StudentSubjectManagement />
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
              <TeacherProgramManagement />
            </TabPanel>

            <TabPanel value={tabValue} index={6}>
              <LocationManagement />
            </TabPanel>

            <TabPanel value={tabValue} index={7}>
              <SessionManagement />
            </TabPanel>
          </Paper>
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;