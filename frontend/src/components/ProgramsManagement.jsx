import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Button, TextField, Dialog, DialogActions, 
  DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress, Alert, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ProgramsManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProgram, setCurrentProgram] = useState({
    programName: '',
    description: '',
    duration: '',
    degreeOffered: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/programs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPrograms(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to fetch programs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (program = null) => {
    if (program) {
      setCurrentProgram(program);
      setIsEditing(true);
    } else {
      setCurrentProgram({
        programName: '',
        description: '',
        duration: '',
        degreeOffered: ''
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProgram(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!currentProgram.programName.trim()) {
      setError('Program name is required');
      return false;
    }
    if (!currentProgram.duration.trim()) {
      setError('Duration is required');
      return false;
    }
    if (!currentProgram.degreeOffered.trim()) {
      setError('Degree offered is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/api/programs/${currentProgram.programId}`,
          currentProgram,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setSuccess('Program updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/api/programs`,
          currentProgram,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setSuccess('Program created successfully');
      }
      fetchPrograms();
      handleCloseDialog();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving program:', err);
      setError(err.response?.data?.message || 'Failed to save program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/programs/${programId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Program deleted successfully');
      fetchPrograms();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting program:', err);
      setError(err.response?.data?.message || 'Failed to delete program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Programs Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Program
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {loading && !openDialog ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Program Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Degree Offered</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programs.length > 0 ? (
                programs.map((program) => (
                  <TableRow key={program.programId}>
                    <TableCell>{program.programName}</TableCell>
                    <TableCell>{program.description}</TableCell>
                    <TableCell>{program.duration}</TableCell>
                    <TableCell>{program.degreeOffered}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(program)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteProgram(program.programId)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No programs found. Click "Add Program" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Program' : 'Add New Program'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="programName"
            label="Program Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentProgram.programName}
            onChange={handleInputChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={currentProgram.description}
            onChange={handleInputChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="duration"
            label="Duration (e.g., 4 years, 6 semesters)"
            type="text"
            fullWidth
            variant="outlined"
            value={currentProgram.duration}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="degreeOffered"
            label="Degree Offered"
            type="text"
            fullWidth
            variant="outlined"
            value={currentProgram.degreeOffered}
            onChange={handleInputChange}
            required
            sx={{ mb: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary" 
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProgramsManagement; 