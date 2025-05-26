import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_BASE_URL as API_URL } from '../config';

// Add interceptor for authentication
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

const SubjectManagement = () => {
  console.log("SubjectManagement component is rendering"); // Debug log
  
  // State management
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Form state
  const [subjectForm, setSubjectForm] = useState({
    subjectCode: '',
    subjectName: '',
    semester: '',
    programId: '',
    teacherId: ''
  });

  // Initialize by fetching subjects, programs, and teachers
  useEffect(() => {
    fetchSubjects();
    fetchPrograms();
    fetchTeachers();
  }, []);

  // Helper function to get auth header
  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  // Fetch subjects from the backend
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/subjects`, getAuthHeader());
      setSubjects(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load subjects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch programs for dropdown
  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/programs`, getAuthHeader());
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError('Failed to load programs. Please try again later.');
    }
  };

  // Fetch teachers for dropdown
  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users?type=teacher`, getAuthHeader());
      // Ensure we're only using users with type 'teacher'
      const teacherUsers = Array.isArray(response.data) 
        ? response.data.filter(user => user.type === 'teacher') 
        : [];
      
      console.log('Filtered teachers:', teacherUsers);
      setTeachers(teacherUsers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to load teachers. Please try again later.');
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSubjectForm({
      ...subjectForm,
      [name]: value
    });
    
    // Clear validation error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Validate the form
  const validateForm = () => {
    const errors = {};
    
    if (!subjectForm.subjectCode.trim()) {
      errors.subjectCode = 'Subject code is required';
    }
    
    if (!subjectForm.subjectName.trim()) {
      errors.subjectName = 'Subject name is required';
    }
    
    if (!subjectForm.semester) {
      errors.semester = 'Semester is required';
    } else if (subjectForm.semester < 1 || subjectForm.semester > 10) {
      errors.semester = 'Semester must be between 1 and 10';
    }
    
    if (!subjectForm.programId) {
      errors.programId = 'Program is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const data = {
        subjectCode: subjectForm.subjectCode,
        subjectName: subjectForm.subjectName,
        semester: Number(subjectForm.semester),
        programId: Number(subjectForm.programId),
        teacherId: subjectForm.teacherId ? Number(subjectForm.teacherId) : null
      };
      
      let response;
      
      if (selectedSubject) {
        // Update existing subject
        response = await axios.put(`${API_URL}/api/subjects/${selectedSubject.subjectId}`, data, getAuthHeader());
        setSuccessMessage('Subject updated successfully');
      } else {
        // Create new subject
        response = await axios.post(`${API_URL}/api/subjects`, data, getAuthHeader());
        setSuccessMessage('Subject created successfully');
      }
      
      // Close dialog and refresh subjects
      setOpenDialog(false);
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to save subject. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setSubjectForm({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      semester: subject.semester,
      programId: subject.programId,
      teacherId: subject.teacherId || ''
    });
    setOpenDialog(true);
  };

  // Handle delete button click
  const handleDeleteClick = (subject) => {
    setSelectedSubject(subject);
    setOpenDeleteDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/api/subjects/${selectedSubject.subjectId}`, getAuthHeader());
      setSuccessMessage('Subject deleted successfully');
      setOpenDeleteDialog(false);
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      setError('Failed to delete subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog open for adding a new subject
  const handleAddSubject = () => {
    setSelectedSubject(null);
    setSubjectForm({
      subjectCode: '',
      subjectName: '',
      semester: '',
      programId: '',
      teacherId: ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormErrors({});
  };

  // Reset error/success messages
  const handleCloseAlert = () => {
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2">
          Subject Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddSubject}
        >
          Add Subject
        </Button>
      </Box>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error display */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success message */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Subject table */}
      {!loading && subjects.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject Code</TableCell>
                <TableCell>Subject Name</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Program</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.subjectId}>
                  <TableCell>{subject.subjectCode}</TableCell>
                  <TableCell>{subject.subjectName}</TableCell>
                  <TableCell>{subject.semester}</TableCell>
                  <TableCell>{subject.Program?.programName || 'N/A'}</TableCell>
                  <TableCell>{subject.teacher?.name || 'Not Assigned'}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      size="small" 
                      onClick={() => handleEdit(subject)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      size="small" 
                      onClick={() => handleDeleteClick(subject)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Empty state */}
      {!loading && subjects.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography variant="body1">No subjects found. Add a subject to get started.</Typography>
        </Box>
      )}

      {/* Add/Edit subject dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSubject ? 'Edit Subject' : 'Add New Subject'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid sx={{ width: { xs: '100%', sm: '100%', md: '50%', lg: '50%' } }}>
              <TextField
                name="subjectCode"
                label="Subject Code"
                value={subjectForm.subjectCode}
                onChange={handleFormChange}
                fullWidth
                required
                error={!!formErrors.subjectCode}
                helperText={formErrors.subjectCode}
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '100%', md: '50%', lg: '50%' } }}>
              <TextField
                name="subjectName"
                label="Subject Name"
                value={subjectForm.subjectName}
                onChange={handleFormChange}
                fullWidth
                required
                error={!!formErrors.subjectName}
                helperText={formErrors.subjectName}
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '100%', md: '50%', lg: '50%' } }}>
              <TextField
                name="semester"
                label="Semester"
                type="number"
                value={subjectForm.semester}
                onChange={handleFormChange}
                fullWidth
                required
                InputProps={{ inputProps: { min: 1, max: 10 } }}
                error={!!formErrors.semester}
                helperText={formErrors.semester}
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '100%', md: '50%', lg: '50%' } }}>
              <FormControl fullWidth required error={!!formErrors.programId}>
                <InputLabel id="program-select-label">Program</InputLabel>
                <Select
                  labelId="program-select-label"
                  name="programId"
                  value={subjectForm.programId}
                  onChange={handleFormChange}
                  label="Program"
                >
                  {programs.map((program) => (
                    <MenuItem key={program.programId} value={program.programId}>
                      {program.programName}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.programId && (
                  <Typography variant="caption" color="error">
                    {formErrors.programId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <FormControl fullWidth>
                <InputLabel id="teacher-select-label">Teacher (Optional)</InputLabel>
                <Select
                  labelId="teacher-select-label"
                  name="teacherId"
                  value={subjectForm.teacherId}
                  onChange={handleFormChange}
                  label="Teacher (Optional)"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.userId} value={teacher.userId}>
                      <Box component="span" sx={{ fontWeight: 'bold' }}>
                        {teacher.name}
                      </Box>
                      {teacher.email && (
                        <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                          ({teacher.email})
                        </Box>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {selectedSubject ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete subject <strong>{selectedSubject?.subjectName}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectManagement; 