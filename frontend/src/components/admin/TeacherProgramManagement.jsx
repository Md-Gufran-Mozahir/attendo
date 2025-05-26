import React, { useState, useEffect } from 'react';
// Import individual components
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';

import { getAllPrograms } from '../../services/programService';
import { getAllTeachers } from '../../services/userService';
import { 
  getTeachersByProgram, 
  assignTeacherToProgram, 
  removeTeacherFromProgram 
} from '../../services/teacherProgramService';

const TeacherProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Fetch programs and teachers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [programsResponse, teachersResponse] = await Promise.all([
          getAllPrograms(),
          getAllTeachers()
        ]);
        
        setPrograms(programsResponse.data);
        // Filter to only get teachers
        setTeachers(teachersResponse.data.filter(user => user.type === 'teacher'));
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({
          text: 'Failed to load programs and teachers. Please try again.',
          type: 'danger'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch assigned teachers when program is selected
  useEffect(() => {
    const fetchAssignedTeachers = async () => {
      if (!selectedProgram) {
        setAssignedTeachers([]);
        return;
      }

      try {
        setLoading(true);
        const response = await getTeachersByProgram(selectedProgram);
        setAssignedTeachers(response.data);
      } catch (error) {
        console.error('Error fetching assigned teachers:', error);
        setMessage({
          text: 'Failed to load assigned teachers. Please try again.',
          type: 'danger'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTeachers();
  }, [selectedProgram]);

  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value);
  };

  const handleTeacherChange = (e) => {
    setSelectedTeacher(e.target.value);
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    
    if (!selectedProgram || !selectedTeacher) {
      setMessage({
        text: 'Please select both a program and a teacher.',
        type: 'warning'
      });
      return;
    }

    // Check if teacher is already assigned
    const isAlreadyAssigned = assignedTeachers.some(
      teacher => teacher.userId === parseInt(selectedTeacher)
    );

    if (isAlreadyAssigned) {
      setMessage({
        text: 'This teacher is already assigned to this program.',
        type: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      await assignTeacherToProgram(selectedProgram, selectedTeacher);
      
      // Refresh the assigned teachers list
      const response = await getTeachersByProgram(selectedProgram);
      setAssignedTeachers(response.data);
      
      setMessage({
        text: 'Teacher assigned to program successfully!',
        type: 'success'
      });
      
      // Clear selected teacher after assignment
      setSelectedTeacher('');
    } catch (error) {
      console.error('Error assigning teacher:', error);
      setMessage({
        text: error.response?.data?.message || 'Failed to assign teacher. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    try {
      setLoading(true);
      await removeTeacherFromProgram(selectedProgram, teacherId);
      
      // Refresh the assigned teachers list
      const response = await getTeachersByProgram(selectedProgram);
      setAssignedTeachers(response.data);
      
      setMessage({
        text: 'Teacher removed from program successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error removing teacher:', error);
      setMessage({
        text: error.response?.data?.message || 'Failed to remove teacher. Please try again.',
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
    <Container fluid className="p-0">
      <h4 className="mb-4 text-primary text-center">Teacher-Program Management</h4>
      
      {message.text && (
        <Alert 
          variant={message.type} 
          dismissible 
          onClose={() => setMessage({ text: '', type: '' })}
          className="mx-auto"
          style={{ maxWidth: '700px' }}
        >
          {message.text}
        </Alert>
      )}
      
      <Row className="justify-content-center mb-4">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="text-center mb-4">Assign Teachers to Programs</Card.Title>
              <Form onSubmit={handleAssignTeacher}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Program</Form.Label>
                  <Form.Select 
                    value={selectedProgram}
                    onChange={handleProgramChange}
                    required
                    className="form-control"
                  >
                    <option value="">-- Select Program --</option>
                    {programs.map(program => (
                      <option key={program.programId} value={program.programId}>
                        {program.programName} ({program.programType})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Select Teacher</Form.Label>
                  <Form.Select 
                    value={selectedTeacher}
                    onChange={handleTeacherChange}
                    required
                    disabled={!selectedProgram}
                    className="form-control"
                  >
                    <option value="">-- Select Teacher --</option>
                    {teachers.map(teacher => (
                      <option key={teacher.userId} value={teacher.userId}>
                        {teacher.name} ({teacher.email})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <div className="d-flex justify-content-center mt-4">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={!selectedProgram || !selectedTeacher || loading}
                    className="px-4 py-2"
                    style={{ 
                      boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Processing...' : 'Assign Teacher'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {selectedProgram && (
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Card.Title className="text-center mb-4">
                  Assigned Teachers
                </Card.Title>
                
                {assignedTeachers.length === 0 ? (
                  <p className="text-center text-muted my-4">
                    No teachers assigned to this program.
                  </p>
                ) : (
                  <Table striped hover responsive>
                    <thead className="bg-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedTeachers.map(teacher => (
                        <tr key={teacher.userId}>
                          <td>{teacher.name}</td>
                          <td>{teacher.email}</td>
                          <td className="text-center">
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleRemoveTeacher(teacher.userId)}
                              disabled={loading}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default TeacherProgramManagement; 