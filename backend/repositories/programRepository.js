const { Program } = require('../models');

// Retrieve all programs
exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.findAll();
    res.status(200).json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Retrieve a program by ID
exports.getProgramById = async (req, res) => {
  try {
    const { id } = req.params;
    const program = await Program.findByPk(id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found.' });
    }
    res.status(200).json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Create a new program
exports.createProgram = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newProgram = await Program.create({ name, description });
    res.status(201).json({ message: 'Program created successfully.', program: newProgram });
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update a program by ID
exports.updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const program = await Program.findByPk(id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found.' });
    }

    program.name = name || program.name;
    program.description = description || program.description;

    await program.save();
    res.status(200).json({ message: 'Program updated successfully.', program });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete a program by ID
exports.deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findByPk(id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found.' });
    }

    await program.destroy();
    res.status(200).json({ message: 'Program deleted successfully.' });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
