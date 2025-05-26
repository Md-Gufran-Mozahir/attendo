const { Subject } = require('../models');

// Retrieve all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll();
    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Retrieve a subject by ID
exports.getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }
    res.status(200).json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Create a new subject
exports.createSubject = async (req, res) => {
  try {
    const { name, code, programId } = req.body;

    const newSubject = await Subject.create({
      name,
      code,
      programId,
    });

    res.status(201).json({ message: 'Subject created successfully.', subject: newSubject });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update a subject by ID
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, programId } = req.body;

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    subject.name = name || subject.name;
    subject.code = code || subject.code;
    subject.programId = programId || subject.programId;

    await subject.save();
    res.status(200).json({ message: 'Subject updated successfully.', subject });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete a subject by ID
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    await subject.destroy();
    res.status(200).json({ message: 'Subject deleted successfully.' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
