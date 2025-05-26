import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { 
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../services/departmentService';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState({
    departmentName: '',
    description: '',
    facultyCode: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await getAllDepartments();
      const data = response?.data || response;
      setDepartments(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to fetch departments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (department = null) => {
    if (department) {
      setCurrentDepartment({
        departmentId: department.departmentId,
        departmentName: department.departmentName,
        description: department.description || '',
        facultyCode: department.facultyCode || ''
      });
      setIsEditing(true);
    } else {
      setCurrentDepartment({
        departmentName: '',
        description: '',
        facultyCode: ''
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
    setCurrentDepartment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!currentDepartment.departmentName.trim()) {
      setError('Department name is required');
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
        await updateDepartment(
          currentDepartment.departmentId,
          currentDepartment
        );
        setSuccess('Department updated successfully');
      } else {
        await createDepartment(currentDepartment);
        setSuccess('Department created successfully');
      }
      fetchDepartments();
      handleCloseDialog();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving department:', err);
      setError(err.response?.data?.message || 'Failed to save department. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    
    setLoading(true);
    try {
      await deleteDepartment(departmentId);
      setSuccess('Department deleted successfully');
      fetchDepartments();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting department:', err);
      setError(err.response?.data?.message || 'Failed to delete department. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Department Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Department
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
                <TableCell>Name</TableCell>
                <TableCell>Faculty Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length > 0 ? (
                departments.map((department) => (
                  <TableRow key={department.departmentId}>
                    <TableCell>{department.departmentName}</TableCell>
                    <TableCell>{department.facultyCode || '-'}</TableCell>
                    <TableCell>{department.description || '-'}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(department)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteDepartment(department.departmentId)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No departments found. Click "Add Department" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Department' : 'Add New Department'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                autoFocus
                name="departmentName"
                label="Department Name"
                type="text"
                fullWidth
                variant="outlined"
                value={currentDepartment.departmentName}
                onChange={handleInputChange}
                required
                placeholder="e.g., Computer Science, Electrical Engineering"
              />
              
              <TextField
                name="facultyCode"
                label="Faculty Code"
                type="text"
                fullWidth
                variant="outlined"
                value={currentDepartment.facultyCode}
                onChange={handleInputChange}
                placeholder="e.g., CS, EE"
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
              value={currentDepartment.description}
              onChange={handleInputChange}
              placeholder="Department description"
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

export default DepartmentManagement; 