import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { isAuthenticated } from '../services/authService';
import { useLocation } from 'react-router-dom';
import StudentDetailsForm from './StudentDetailsForm';
import BatchAndProgramManagement from './BatchManagement';
import SubjectManagement from './SubjectManagement';
import Login from './Login';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tab-${index}`}
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
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tab-${index}`,
  };
}

const AdminDashboard = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated on component mount
    setIsLoggedIn(isAuthenticated());
    
    // Set active tab based on URL query parameter
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    
    console.log('URL tab parameter:', tab);
    
    if (tab === 'student-details') {
      console.log('Setting tab index to 0 (Student Details)');
      setTabIndex(0);
    } else if (tab === 'batches') {
      console.log('Setting tab index to 1 (Batch Management)');
      setTabIndex(1);
    } else if (tab === 'subjects') {
      console.log('Setting tab index to 2 (Subject Management)');
      setTabIndex(2);
    } else {
      console.log('No matching tab found, current tabIndex:', tabIndex);
    }
  }, [location]);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleChange} aria-label="admin dashboard tabs">
          <Tab label="Student Details" {...a11yProps(0)} />
          <Tab label="Batch & Program Management" {...a11yProps(1)} />
          <Tab label="Subject Management" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={tabIndex} index={0}>
        <StudentDetailsForm />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <BatchAndProgramManagement />
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
        <SubjectManagement />
      </TabPanel>
    </Box>
  );
};

export default AdminDashboard; 