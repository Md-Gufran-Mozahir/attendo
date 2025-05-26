import React, { useState, useEffect } from 'react';
import { 
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

// Configure axios base URL to point to your backend
axios.defaults.baseURL = 'http://localhost:3000'; // Backend is running on port 3000

// No need to add interceptors here as they are global and already added in StudentDetailsForm.jsx

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
        <Box sx={{ pt: 2 }}>
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

const BatchAndProgramManagement = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);
  
  const [batchFormData, setBatchFormData] = useState({
    name: '',
    startDate: null,
    endDate: null
  });

  const [programDialog, setProgramDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  
  const [programFormData, setProgramFormData] = useState({
    programType: 'UG',
    programName: '',
    description: ''
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Fetch batches and programs on component mount
  useEffect(() => {
    if (tabIndex === 0) {
    fetchBatches();
    } else {
    fetchPrograms();
    }
  }, [tabIndex]);

  const fetchBatches = async () => {
    setFetchingData(true);
    setError('');
    
    try {
      const response = await axios.get('/api/batches');
      console.log('API Response for batches:', response.data);
      
      // Map the received data to ensure consistent property names
      const formattedBatches = Array.isArray(response.data) 
        ? response.data.map(batch => ({
            id: batch.batchId || batch.id,
            name: batch.batchName || batch.name,
            startDate: batch.startDate,
            endDate: batch.endDate
          }))
        : [];
      
      setBatches(formattedBatches);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setError('Failed to load batches from server');
      setBatches([]);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchPrograms = async () => {
    setFetchingData(true);
    setError('');
    
    try {
      const response = await axios.get('/api/programs');
      console.log('API Response for programs:', response.data);
      
      // Map the received data to ensure consistent property names
      const formattedPrograms = Array.isArray(response.data) 
        ? response.data.map(program => ({
            id: program.programId,
            type: program.programType,
            name: program.programName,
            description: program.description
          }))
        : [];
      
      setPrograms(formattedPrograms);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError('Failed to load programs from server');
      setPrograms([]);
    } finally {
      setFetchingData(false);
    }
  };

  // Batch form handlers
  const handleBatchChange = (e) => {
    const { name, value } = e.target;
    setBatchFormData({
      ...batchFormData,
      [name]: value
    });
  };

  const handleDateChange = (name, date) => {
    setBatchFormData({
      ...batchFormData,
      [name]: date
    });
  };

  const resetBatchForm = () => {
    setBatchFormData({
      name: '',
      startDate: null,
      endDate: null
    });
    setIsEditing(false);
    setCurrentBatch(null);
  };

  const handleOpenDialog = (batch = null) => {
    if (batch) {
      setIsEditing(true);
      setCurrentBatch(batch);
      setBatchFormData({
        name: batch.name,
        startDate: batch.startDate ? new Date(batch.startDate) : null,
        endDate: batch.endDate ? new Date(batch.endDate) : null
      });
    } else {
      resetBatchForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetBatchForm();
  };

  const validateBatchForm = () => {
    if (!batchFormData.name || !batchFormData.startDate || !batchFormData.endDate) {
      setError('All fields are required');
      return false;
    }
    
    // Check if end date is after start date
    const startDate = new Date(batchFormData.startDate);
    const endDate = new Date(batchFormData.endDate);
    
    if (endDate <= startDate) {
      setError('End date must be after start date');
      return false;
    }
    
    return true;
  };

  const handleSubmitBatch = async () => {
    setError('');
    setSuccess('');
    
    if (!validateBatchForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const formattedStartDate = batchFormData.startDate ? batchFormData.startDate.toISOString().split('T')[0] : '';
      const formattedEndDate = batchFormData.endDate ? batchFormData.endDate.toISOString().split('T')[0] : '';
      
      const payload = {
        name: batchFormData.name,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      };
      
      let response;
      if (isEditing && currentBatch) {
        response = await axios.put(`/api/batches/${currentBatch.id}`, payload);
        setSuccess('Batch updated successfully');
      } else {
        response = await axios.post('/api/batches', payload);
        setSuccess('Batch created successfully');
      }
      
      // Refresh batch list
      fetchBatches();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving batch:', error);
      setError(error.response?.data?.message || 'Failed to save batch. Please check if your backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async (batch) => {
    if (window.confirm(`Are you sure you want to delete batch: ${batch.name}?`)) {
    setLoading(true);
    try {
        await axios.delete(`/api/batches/${batch.id}`);
      setSuccess('Batch deleted successfully');
      fetchBatches();
      } catch (error) {
        console.error('Error deleting batch:', error);
        setError(error.response?.data?.message || 'Failed to delete batch');
    } finally {
      setLoading(false);
    }
    }
  };

  // Program form handlers
  const handleProgramChange = (e) => {
    const { name, value } = e.target;
    setProgramFormData({
      ...programFormData,
      [name]: value
    });
  };

  const resetProgramForm = () => {
    setProgramFormData({
      programType: 'UG',
      programName: '',
      description: ''
    });
    setEditingProgram(false);
    setCurrentProgram(null);
  };

  const handleOpenProgramDialog = (program = null) => {
    if (program) {
      setEditingProgram(true);
      setCurrentProgram(program);
      setProgramFormData({
        programType: program.type,
        programName: program.name,
        description: program.description || ''
      });
    } else {
      resetProgramForm();
    }
    setProgramDialog(true);
  };

  const handleCloseProgramDialog = () => {
    setProgramDialog(false);
    resetProgramForm();
  };

  const validateProgramForm = () => {
    if (!programFormData.programType || !programFormData.programName) {
      setError('Program type and name are required');
      return false;
    }
    return true;
  };

  const handleSubmitProgram = async () => {
    setError('');
    setSuccess('');
    
    if (!validateProgramForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        programType: programFormData.programType,
        programName: programFormData.programName,
        description: programFormData.description
      };
      
      let response;
      if (editingProgram && currentProgram) {
        response = await axios.put(`/api/programs/${currentProgram.id}`, payload);
        setSuccess('Program updated successfully');
      } else {
        response = await axios.post('/api/programs', payload);
        setSuccess('Program created successfully');
      }
      
      // Refresh program list
      fetchPrograms();
      handleCloseProgramDialog();
    } catch (error) {
      console.error('Error saving program:', error);
      setError(error.response?.data?.message || 'Failed to save program. Please check if your backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async (program) => {
    if (window.confirm(`Are you sure you want to delete program: ${program.name}?`)) {
      setLoading(true);
      try {
        await axios.delete(`/api/programs/${program.id}`);
        setSuccess('Program deleted successfully');
        fetchPrograms();
      } catch (error) {
        console.error('Error deleting program:', error);
        setError(error.response?.data?.message || 'Failed to delete program');
    } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabIndex} onChange={handleTabChange} aria-label="batch and program tabs">
              <Tab label="Batches" {...a11yProps(0)} />
              <Tab label="Programs" {...a11yProps(1)} />
      </Tabs>
          </Box>

          {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ my: 2 }}>{success}</Alert>}

          <TabPanel value={tabIndex} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Batch Details</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Batch
          </Button>
        </Box>

            {fetchingData ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
            ) : batches.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">No batches found. Create your first batch.</Typography>
              </Paper>
        ) : (
              <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                      <TableCell>Name</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                    {batches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell>{batch.name}</TableCell>
                        <TableCell>{formatDate(batch.startDate)}</TableCell>
                        <TableCell>{formatDate(batch.endDate)}</TableCell>
                        <TableCell align="right">
                          <IconButton color="primary" onClick={() => handleOpenDialog(batch)}>
                          <EditIcon />
                        </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteBatch(batch)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

          <TabPanel value={tabIndex} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Program Details</Typography>
                <Button
                  variant="contained"
                  color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenProgramDialog()}
                >
                Add Program
                </Button>
            </Box>

            {fetchingData ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : programs.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">No programs found. Create your first program.</Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {programs.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell>{program.type}</TableCell>
                        <TableCell>{program.name}</TableCell>
                        <TableCell>{program.description || "-"}</TableCell>
                        <TableCell align="right">
                          <IconButton color="primary" onClick={() => handleOpenProgramDialog(program)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteProgram(program)}>
                              <DeleteIcon />
                            </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
        )}
      </TabPanel>
        </Box>

        {/* Add/Edit Batch Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
        <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
          <TextField
                  name="name"
            label="Batch Name"
            fullWidth
            required
                  value={batchFormData.name}
                  onChange={handleBatchChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
            label="Start Date"
                  value={batchFormData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
            label="End Date"
                  value={batchFormData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
              onClick={handleSubmitBatch} 
            variant="contained" 
            color="primary" 
            disabled={loading}
          >
              {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

        {/* Add/Edit Program Dialog */}
        <Dialog open={programDialog} onClose={handleCloseProgramDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingProgram ? 'Edit Program' : 'Add New Program'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  name="programType"
                  label="Program Type"
        fullWidth
                  required
                  value={programFormData.programType}
                  onChange={handleProgramChange}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="UG">Undergraduate (UG)</option>
                  <option value="PG">Postgraduate (PG)</option>
                  <option value="PhD">Doctorate (PhD)</option>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="programName"
                  label="Program Name"
                  fullWidth
                  required
                  value={programFormData.programName}
                  onChange={handleProgramChange}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={programFormData.description}
                  onChange={handleProgramChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseProgramDialog}>Cancel</Button>
              <Button 
              onClick={handleSubmitProgram} 
                variant="contained" 
                color="primary" 
              disabled={loading}
              >
              {loading ? 'Saving...' : 'Save'}
              </Button>
        </DialogActions>
      </Dialog>
      </div>
    </LocalizationProvider>
  );
};

export default BatchAndProgramManagement; 
