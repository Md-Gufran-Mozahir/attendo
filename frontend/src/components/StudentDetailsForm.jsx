import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Box,
  Alert,
  CircularProgress,
  Container,
  Stack
} from '@mui/material';
import axios from 'axios';

// Configure axios base URL to point to your backend
axios.defaults.baseURL = 'http://localhost:3000'; // Backend is running on port 3000

// Add a request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const StudentDetailsForm = () => {
  const [formData, setFormData] = useState({
    userId: '',
    enrollment: '',
    batchId: '',
    currentSemester: 1,
    photoUrl: '',
    guardianName: '',
    guardianEmail: '',
    guardianRelation: ''
  });

  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    setFetchingData(true);
    setErrorMsg('');
    
    try {
      // Fetch users of type student
      const userResponse = await axios.get('/api/users', {
        params: { type: 'student' }
      });
      console.log('Student users data:', userResponse.data);
      
      // Process and filter users to ensure only students are included
      let fetchedUsers = [];
      if (Array.isArray(userResponse.data)) {
        fetchedUsers = userResponse.data.filter(user => user.type === 'student');
      } else if (userResponse.data && Array.isArray(userResponse.data.users)) {
        fetchedUsers = userResponse.data.users.filter(user => user.type === 'student');
      } else {
        console.error('Unexpected user data format:', userResponse.data);
      }
      
      console.log('Filtered student users:', fetchedUsers);
      setUsers(fetchedUsers);

      // Fetch batches
      const batchResponse = await axios.get('/api/batches');
      console.log('Batches data:', batchResponse.data);
      
      if (Array.isArray(batchResponse.data)) {
        setBatches(batchResponse.data);
      } else if (batchResponse.data && Array.isArray(batchResponse.data.batches)) {
        setBatches(batchResponse.data.batches);
      } else {
        console.error('Unexpected batch data format:', batchResponse.data);
        setBatches([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMsg('Failed to fetch necessary data. Please try again later.');
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate form data
    if (!formData.userId || !formData.enrollment || !formData.currentSemester || 
        !formData.guardianName || !formData.guardianEmail || !formData.guardianRelation) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      setLoading(false);
      return;
    }

    try {
      // Ensure currentSemester is a number
      const payload = {
        ...formData,
        currentSemester: Number(formData.currentSemester)
      };

      console.log('Submitting student details with payload:', payload);
      
      // Create student details with relationships to User and Batch
      const response = await axios.post('/api/students', payload);
      console.log('Success response:', response.data);
      setMessage({ type: 'success', text: 'Student details added successfully!' });
      
      // Reset form
      setFormData({
        userId: '',
        enrollment: '',
        batchId: '',
        currentSemester: 1,
        photoUrl: '',
        guardianName: '',
        guardianEmail: '',
        guardianRelation: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.errors ? error.response.data.errors.map(e => e.message).join(', ') : 
                          'Error saving student details. Please try again.');
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, width: '100%', borderRadius: 2, maxWidth: '500px' }}>
        <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
          Add Student Details
        </Typography>

        {message.text && (
          <Box sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: message.type === 'success' ? 'success.light' : 'error.light',
            color: message.type === 'success' ? 'success.dark' : 'error.dark',
            borderRadius: 1
          }}>
            {message.text}
          </Box>
        )}

        {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

        {fetchingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="user-select-label">Student</InputLabel>
                <Select
                  labelId="user-select-label"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  label="Student"
                  onChange={handleChange}
                  required
                >
                  {users.length > 0 ? (
                    users.map(user => (
                      <MenuItem 
                        key={user.userId || user.id} 
                        value={user.userId || user.id}
                      >
                        <Box component="span" sx={{ fontWeight: 'bold' }}>
                          {user.name}
                        </Box>
                        <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                          ({user.email})
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No student accounts available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>

              <TextField
                required
                id="enrollment"
                name="enrollment"
                label="Enrollment Number"
                fullWidth
                size="small"
                value={formData.enrollment}
                onChange={handleChange}
              />

              <FormControl fullWidth size="small">
                <InputLabel id="batch-select-label">Batch</InputLabel>
                <Select
                  labelId="batch-select-label"
                  id="batchId"
                  name="batchId"
                  value={formData.batchId}
                  label="Batch"
                  onChange={handleChange}
                >
                  {batches.length > 0 ? (
                    batches.map(batch => (
                      <MenuItem 
                        key={batch.batchId || batch.id} 
                        value={batch.batchId || batch.id}
                      >
                        {batch.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No batches available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="semester-select-label">Current Semester</InputLabel>
                <Select
                  labelId="semester-select-label"
                  id="currentSemester"
                  name="currentSemester"
                  value={formData.currentSemester}
                  label="Current Semester"
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(semester => (
                    <MenuItem key={semester} value={semester}>
                      Semester {semester}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                id="photoUrl"
                name="photoUrl"
                label="Photo URL"
                fullWidth
                size="small"
                value={formData.photoUrl}
                onChange={handleChange}
              />

              <TextField
                required
                id="guardianName"
                name="guardianName"
                label="Guardian Name"
                fullWidth
                size="small"
                value={formData.guardianName}
                onChange={handleChange}
              />

              <TextField
                required
                id="guardianEmail"
                name="guardianEmail"
                label="Guardian Email"
                fullWidth
                size="small"
                type="email"
                value={formData.guardianEmail}
                onChange={handleChange}
              />

              <TextField
                required
                id="guardianRelation"
                name="guardianRelation"
                label="Guardian Relation"
                fullWidth
                size="small"
                value={formData.guardianRelation}
                onChange={handleChange}
              />

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ 
                    minWidth: '200px',
                    py: 1,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'transform 0.3s, box-shadow 0.3s'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Student Details'}
                </Button>
              </Box>
            </Stack>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default StudentDetailsForm; 