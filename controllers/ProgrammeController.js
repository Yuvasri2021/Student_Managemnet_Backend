const Programme = require('../models/Programme');

module.exports.CreateProgramme = async (req, res) => {
  try {
    const newProgramme = await Programme.create(req.body);
    res.status(201).json(newProgramme); // 201 = Created
  } catch (error) {
    res.status(400).json({ error: error.message }); // 400 = Bad Request
  }
};

module.exports.GetProgramme = async (req, res) => {
  try {
    const Programmes = await Programme.find(); // Fetch all documents
    res.status(200).json(Programmes); // 200 = OK
  } catch (error) {
    res.status(500).json({ error: error.message }); // 500 = Internal Server Error
  }
};
