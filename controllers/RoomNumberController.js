const RoomNo = require('../models/RoomNo');

module.exports.CreateRoomNo = async (req, res) => {
  try {
    const newBlock = await RoomNo.create(req.body);
    res.status(201).json(newBlock); // 201 = Created
  } catch (error) {
    res.status(400).json({ error: error.message }); // 400 = Bad Request
  }
};

module.exports.GetRoomNo = async (req, res) => {
  try {
    const Room_No = await RoomNo.find(); // Fetch all documents
    res.status(200).json(Room_No); // 200 = OK
  } catch (error) {
    res.status(500).json({ error: error.message }); // 500 = Internal Server Error
  }
};
