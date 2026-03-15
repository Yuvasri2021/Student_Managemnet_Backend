const Block = require('../models/Block');

module.exports.CreateBlock = async (req, res) => {
  try {
    const newBlock = await Block.create(req.body);
    res.status(201).json(newBlock); // 201 = Created
  } catch (error) {
    res.status(400).json({ error: error.message }); // 400 = Bad Request
  }
};

module.exports.GetBlock = async (req, res) => {
  try {
    const Blocks = await Block.find(); // Fetch all documents
    res.status(200).json(Blocks); // 200 = OK
  } catch (error) {
    res.status(500).json({ error: error.message }); // 500 = Internal Server Error
  }
};
