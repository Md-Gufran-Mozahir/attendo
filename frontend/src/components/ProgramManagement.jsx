import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, IconButton, FormControl,
  InputLabel, Select, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { 
  getAllPrograms, 
  createProgram, 
  updateProgram, 
  deleteProgram 
} from '../services/programService';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProgram, setCurrentProgram] = useState({
    programName: '',
    programCode: '',
    description: '',
    duration: 4,
    type: 'UG'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await getAllPrograms();
      const data = response?.data || response;
      setPrograms(Array.isArray(data) ? data : []);
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
      setCurrentProgram({
        programName: program.programName,
        programCode: program.programCode || '',
        description: program.description || '',
        duration: program.duration || 4,
        type: program.type || 'UG'
      });
      setIsEditing(true);
    } else {
      setCurrentProgram({
        programName: '',
        programCode: '',
        description: '',
        duration: 4,
        type: 'UG'
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
    if (!currentProgram.programCode.trim()) {
      setError('Program code is required');
      return false;
    }
    if (!currentProgram.duration || currentProgram.duration < 1) {
      setError('Duration must be at least 1 year');
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
        await updateProgram(
          currentProgram.programId,
          currentProgram
        );
        setSuccess('Program updated successfully');
      } else {
        await createProgram(currentProgram);
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
      await deleteProgram(programId);
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
        <Typography variant="h6">Program Management</Typography>
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
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programs.length > 0 ? (
                programs.map((program) => (
                  <TableRow key={program.programId}>
                    <TableCell>{program.programCode}</TableCell>
                    <TableCell>{program.programName}</TableCell>
                    <TableCell>{program.type}</TableCell>
                    <TableCell>{program.duration} years</TableCell>
                    <TableCell>{program.description || '-'}</TableCell>
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
                  <TableCell colSpan={6} align="center">
                    No programs found. Click "Add Program" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Program' : 'Add New Program'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="programCode"
                label="Program Code"
                type="text"
                fullWidth
                variant="outlined"
                value={currentProgram.programCode}
                onChange={handleInputChange}
                required
                placeholder="e.g., BTech, MTech, PhD"
              />
              
              <TextField
                autoFocus
                name="programName"
                label="Program Name"
                type="text"
                fullWidth
                variant="outlined"
                value={currentProgram.programName}
                onChange={handleInputChange}
                required
                placeholder="e.g., Bachelor of Technology"
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel id="type-label">Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={currentProgram.type}
                  label="Type"
                  onChange={handleInputChange}
                >
                  <MenuItem value="UG">Undergraduate (UG)</MenuItem>
                  <MenuItem value="PG">Postgraduate (PG)</MenuItem>
                  <MenuItem value="PhD">Doctorate (PhD)</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                name="duration"
                label="Duration (years)"
                type="number"
                fullWidth
                variant="outlined"
                value={currentProgram.duration}
                onChange={handleInputChange}
                required
                inputProps={{ min: "1", max: "6" }}
              />
            </Box>
            
            <TextField
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={currentProgram.description}
              onChange={handleInputChange}
              placeholder="Program description"
            />
          </Box>
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

export default ProgramManagement; 