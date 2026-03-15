const Role = require('../models/Role');

module.exports.CreateRole = async (req, res) => {
  try {
    const newBlock = await Role.create(req.body);
    res.status(201).json(newBlock); // 201 = Created
  } catch (error) {
    res.status(400).json({ error: error.message }); // 400 = Bad Request
  }
};

module.exports.GetRole = async (req, res) => {
  try {
    const Roles = await Role.find(); // Fetch all documents
    res.status(200).json(Roles); // 200 = OK
  } catch (error) {
    res.status(500).json({ error: error.message }); // 500 = Internal Server Error
  }
};
