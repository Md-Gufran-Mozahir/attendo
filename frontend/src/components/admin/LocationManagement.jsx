import React, { useState, useEffect } from 'react';
// Import individual components
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';

import { 
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation
} from '../../services/locationService';

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    campusName: '',
    centerLatitude: '',
    centerLongitude: '',
    radius: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

  // Fetch all locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await getAllLocations();
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setMessage({
        text: 'Failed to load locations. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      campusName: '',
      centerLatitude: '',
      centerLongitude: '',
      radius: ''
    });
    setEditingLocation(null);
  };

  const handleAddNewClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (location) => {
    setFormData({
      campusName: location.campusName,
      centerLatitude: parseFloat(location.centerLatitude),
      centerLongitude: parseFloat(location.centerLongitude),
      radius: location.radius
    });
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleDeleteClick = (location) => {
    setLocationToDelete(location);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;
    
    try {
      setLoading(true);
      await deleteLocation(locationToDelete.locationId);
      
      setMessage({
        text: 'Location deleted successfully!',
        type: 'success'
      });
      
      await fetchLocations();
      setShowDeleteModal(false);
      setLocationToDelete(null);
    } catch (error) {
      console.error('Error deleting location:', error);
      setMessage({
        text: error.response?.data?.message || 'Failed to delete location. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.campusName || !formData.centerLatitude || !formData.centerLongitude || !formData.radius) {
      setMessage({
        text: 'All fields are required',
        type: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      
      const locationData = {
        campusName: formData.campusName,
        centerLatitude: parseFloat(formData.centerLatitude),
        centerLongitude: parseFloat(formData.centerLongitude),
        radius: parseInt(formData.radius)
      };
      
      if (editingLocation) {
        // Update existing location
        await updateLocation(editingLocation.locationId, locationData);
        setMessage({
          text: 'Location updated successfully!',
          type: 'success'
        });
      } else {
        // Create new location
        await createLocation(locationData);
        setMessage({
          text: 'New location created successfully!',
          type: 'success'
        });
      }
      
      // Refresh locations list
      await fetchLocations();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving location:', error);
      setMessage({
        text: error.response?.data?.message || 'Failed to save location. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <Container className="mt-4">
      <h2 className="mb-4">University Locations Management</h2>
      
      {message.text && (
        <Alert 
          variant={message.type} 
          dismissible 
          onClose={() => setMessage({ text: '', type: '' })}
        >
          {message.text}
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col>
          {showForm ? (
            <Card>
              <Card.Body>
                <Card.Title>{editingLocation ? 'Edit Location' : 'Add New Location'}</Card.Title>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Campus Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="campusName"
                      value={formData.campusName}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Center Latitude</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.000001"
                      name="centerLatitude"
                      value={formData.centerLatitude}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Center Longitude</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.000001"
                      name="centerLongitude"
                      value={formData.centerLongitude}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Radius (meters)</Form.Label>
                    <Form.Control
                      type="number"
                      name="radius"
                      value={formData.radius}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  
                  <div className="d-flex gap-2">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Location'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleAddNewClick}
              className="mb-3"
            >
              Add New Location
            </Button>
          )}
        </Col>
      </Row>
      
      <Row>
        <Col>
          <h4>Locations</h4>
          {locations.length === 0 ? (
            <p>No locations found. Add a new location to get started.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Campus Name</th>
                  <th>Center Latitude</th>
                  <th>Center Longitude</th>
                  <th>Radius (m)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map(location => (
                  <tr key={location.locationId}>
                    <td>{location.campusName}</td>
                    <td>{parseFloat(location.centerLatitude).toFixed(6)}</td>
                    <td>{parseFloat(location.centerLongitude).toFixed(6)}</td>
                    <td>{location.radius}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="info" 
                          size="sm"
                          onClick={() => handleEditClick(location)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeleteClick(location)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the location "{locationToDelete?.campusName}"? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LocationManagement; 