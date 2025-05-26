const { Batch, Program } = require('../models');

// Retrieve all batches
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.findAll({
      include: [{ model: Program }],
    });
    res.status(200).json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Retrieve a batch by ID
exports.getBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findByPk(id, {
      include: [{ model: Program }],
    });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found.' });
    }
    res.status(200).json(batch);
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Create a new batch
exports.createBatch = async (req, res) => {
  try {
    const { name, startDate, endDate, programId } = req.body;

    const newBatch = await Batch.create({
      name,
      startDate,
      endDate,
      programId,
    });

    res.status(201).json({ message: 'Batch created successfully.', batch: newBatch });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update a batch by ID
exports.updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, programId } = req.body;

    const batch = await Batch.findByPk(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found.' });
    }

    batch.name = name || batch.name;
    batch.startDate = startDate || batch.startDate;
    batch.endDate = endDate || batch.endDate;
    batch.programId = programId || batch.programId;

    await batch.save();
    res.status(200).json({ message: 'Batch updated successfully.', batch });
  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete a batch by ID
exports.deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findByPk(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found.' });
    }

    await batch.destroy();
    res.status(200).json({ message: 'Batch deleted successfully.' });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
