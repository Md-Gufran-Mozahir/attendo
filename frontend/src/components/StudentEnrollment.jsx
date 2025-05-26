import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { createStudent } from '../services/studentService';
import { getAllUsers } from '../services/userService';
import { getAllBatches } from '../services/batchService';

const StudentEnrollment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  
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

  useEffect(() => {
    // Fetch all non-enrolled student users
    fetchStudentUsers();
    // Fetch all batches
    fetchBatches();
  }, []);

  const fetchStudentUsers = async () => {
    try {
      const userData = await getAllUsers();
      // Filter for student type users
      const studentUsers = userData.filter(user => user.type === 'student');
      setUsers(studentUsers);
    } catch (error) {
      console.error('Error fetching student users:', error);
      setError('Failed to load student users. Please try again.');
    }
  };

  const fetchBatches = async () => {
    try {
      const batchData = await getAllBatches();
      setBatches(batchData);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setError('Failed to load batches. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.userId || !formData.enrollment || !formData.guardianName || 
        !formData.guardianEmail || !formData.guardianRelation) {
      setError('Please fill all required fields');
      return;
    }
    
    if (!/^[a-zA-Z0-9-]+$/.test(formData.enrollment)) {
      setError('Enrollment ID can only contain letters, numbers, and hyphens');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.guardianEmail)) {
      setError('Guardian email is invalid');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await createStudent(formData);
      setSuccess('Student enrolled successfully!');
      
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
      
      // Refresh student list
      fetchStudentUsers();
    } catch (error) {
      console.error('Error enrolling student:', error);
      setError(error.response?.data?.message || 'Failed to enroll student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Student Enrollment
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="student-user-label">Student User</InputLabel>
                <Select
                  labelId="student-user-label"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  label="Student User"
                >
                  <MenuItem value="">Select a student user</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.userId} value={user.userId}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Enrollment ID"
                name="enrollment"
                value={formData.enrollment}
                onChange={handleInputChange}
                placeholder="e.g., 2023CS12345"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="batch-label">Batch</InputLabel>
                <Select
                  labelId="batch-label"
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleInputChange}
                  label="Batch"
                >
                  <MenuItem value="">None</MenuItem>
                  {batches.map((batch) => (
                    <MenuItem key={batch.batchId} value={batch.batchId}>
                      {batch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Current Semester"
                name="currentSemester"
                value={formData.currentSemester}
                onChange={handleInputChange}
                inputProps={{ min: 1, max: 8 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Photo URL"
                name="photoUrl"
                value={formData.photoUrl}
                onChange={handleInputChange}
                placeholder="e.g., https://example.com/photo.jpg"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Guardian Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Guardian Name"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Guardian Email"
                name="guardianEmail"
                value={formData.guardianEmail}
                onChange={handleInputChange}
                type="email"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Guardian Relation"
                name="guardianRelation"
                value={formData.guardianRelation}
                onChange={handleInputChange}
                placeholder="e.g., Father, Mother, Uncle"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Enroll Student'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default StudentEnrollment; 