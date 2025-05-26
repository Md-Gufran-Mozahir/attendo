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

import { getAllSubjects } from '../../services/subjectService';
import { getAllStudents } from '../../services/studentService';
import { 
  getStudentsBySubject, 
  enrollStudentInSubject, 
  removeStudentFromSubject 
} from '../../services/studentSubjectService';

const StudentSubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Fetch subjects and students on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subjectsResponse, studentsResponse] = await Promise.all([
          getAllSubjects(),
          getAllStudents()
        ]);
        
        setSubjects(subjectsResponse.data);
        setStudents(studentsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({
          text: 'Failed to load subjects and students. Please try again.',
          type: 'danger'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch enrolled students when subject is selected
  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      if (!selectedSubject) {
        setEnrolledStudents([]);
        return;
      }

      try {
        setLoading(true);
        const response = await getStudentsBySubject(selectedSubject);
        setEnrolledStudents(response.data);
      } catch (error) {
        console.error('Error fetching enrolled students:', error);
        setMessage({
          text: 'Failed to load enrolled students. Please try again.',
          type: 'danger'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledStudents();
  }, [selectedSubject]);

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    
    if (!selectedSubject || !selectedStudent) {
      setMessage({
        text: 'Please select both a subject and a student.',
        type: 'warning'
      });
      return;
    }

    // Check if student is already enrolled
    const isAlreadyEnrolled = enrolledStudents.some(
      student => student.userId === selectedStudent
    );

    if (isAlreadyEnrolled) {
      setMessage({
        text: 'This student is already enrolled in this subject.',
        type: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      await enrollStudentInSubject(selectedSubject, selectedStudent);
      
      // Refresh the enrolled students list
      const response = await getStudentsBySubject(selectedSubject);
      setEnrolledStudents(response.data);
      
      setMessage({
        text: 'Student enrolled successfully!',
        type: 'success'
      });
      
      // Clear selected student after enrollment
      setSelectedStudent('');
    } catch (error) {
      console.error('Error enrolling student:', error);
      setMessage({
        text: error.response?.data?.message || 'Failed to enroll student. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      setLoading(true);
      await removeStudentFromSubject(selectedSubject, studentId);
      
      // Refresh the enrolled students list
      const response = await getStudentsBySubject(selectedSubject);
      setEnrolledStudents(response.data);
      
      setMessage({
        text: 'Student removed from subject successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error removing student:', error);
      setMessage({
        text: error.response?.data?.message || 'Failed to remove student. Please try again.',
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
      <h4 className="mb-4 text-primary text-center">Student-Subject Management</h4>
      
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
              <Card.Title className="text-center mb-4">Assign Students to Subjects</Card.Title>
              <Form onSubmit={handleEnrollStudent}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Subject</Form.Label>
                  <Form.Select 
                    value={selectedSubject}
                    onChange={handleSubjectChange}
                    required
                    className="form-control"
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map(subject => (
                      <option key={subject._id || subject.subjectId} value={subject._id || subject.subjectId}>
                        {subject.name || subject.subjectName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Select Student</Form.Label>
                  <Form.Select 
                    value={selectedStudent}
                    onChange={handleStudentChange}
                    required
                    disabled={!selectedSubject}
                    className="form-control"
                  >
                    <option value="">-- Select Student --</option>
                    {students.map(student => (
                      <option key={student.userId} value={student.userId}>
                        {student.User ? `${student.User.name} (${student.enrollment})` : '(Unknown Student)'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <div className="d-flex justify-content-center mt-4">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={!selectedSubject || !selectedStudent || loading}
                    className="px-4 py-2"
                    style={{ 
                      boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Processing...' : 'Enroll Student'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {selectedSubject && (
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Card.Title className="text-center mb-4">
                  Enrolled Students
                </Card.Title>
                
                {enrolledStudents.length === 0 ? (
                  <p className="text-center text-muted my-4">
                    No students enrolled in this subject.
                  </p>
                ) : (
                  <Table striped hover responsive>
                    <thead className="bg-light">
                      <tr>
                        <th>Name</th>
                        <th>Roll Number</th>
                        <th>Email</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrolledStudents.map(student => (
                        <tr key={student.userId}>
                          <td>{student.name}</td>
                          <td>{student.rollNumber}</td>
                          <td>{student.email}</td>
                          <td className="text-center">
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleRemoveStudent(student.userId)}
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

export default StudentSubjectManagement; 