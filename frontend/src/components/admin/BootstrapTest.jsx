import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const BootstrapTest = () => {
  return (
    <Container>
      <Row>
        <Col>
          <Button variant="primary">Test Button</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default BootstrapTest; 