const Dept = require('../models/Dept');

module.exports.CreateDepartment = async (req, res) => {
  try {
    const newDept = await Dept.create(req.body);
    res.status(201).json(newDept); // 201 = Created
  } catch (error) {
    res.status(400).json({ error: error.message }); // 400 = Bad Request
  }
};

module.exports.GetDepartment = async (req, res) => {
  try {
    const departments = await Dept.find(); // Fetch all documents
    res.status(200).json(departments); // 200 = OK
  } catch (error) {
    res.status(500).json({ error: error.message }); // 500 = Internal Server Error
  }
};
