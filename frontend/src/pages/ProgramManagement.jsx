import React, { useState, useEffect } from 'react';
import { getAllPrograms, createProgram, updateProgram, deleteProgram } from '../services/programService';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [formData, setFormData] = useState({ programName: '', description: '' });
  const [editingProgramId, setEditingProgramId] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      const token = localStorage.getItem('token');
      try {
        const data = await getAllPrograms(token);
        setPrograms(data);
      } catch (error) {
        console.error('Error fetching programs:', error);
        alert('An error occurred while fetching programs.');
      }
    };
    fetchPrograms();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editingProgramId) {
        await updateProgram(editingProgramId, formData, token);
      } else {
        await createProgram(formData, token);
      }
      setFormData({ programName: '', description: '' });
      setEditingProgramId(null);
      const data = await getAllPrograms(token);
      setPrograms(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form.');
    }
  };

  const handleEdit = (program) => {
    setFormData({ programName: program.programName, description: program.description });
    setEditingProgramId(program.programId);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await deleteProgram(id, token);
      const data = await getAllPrograms(token);
      setPrograms(data);
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('An error occurred while deleting the program.');
    }
  };

  return (
    <div>
      <h1>Program Management</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="programName"
          placeholder="Program Name"
          value={formData.programName}
          onChange={handleInputChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleInputChange}
        ></textarea>
        <button type="submit">{editingProgramId ? 'Update Program' : 'Add Program'}</button>
      </form>
      <ul>
        {programs.map((program) => (
          <li key={program.programId}>
            <strong>{program.programName}</strong>: {program.description}
            <button onClick={() => handleEdit(program)}>Edit</button>
            <button onClick={() => handleDelete(program.programId)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgramManagement;