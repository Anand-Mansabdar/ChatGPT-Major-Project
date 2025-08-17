const chatModel = require('../models/chat.model');


const createChat = async (req, res) => {
  const {title} = req.body;
  const user = req.user;

  try{
    const chat = await chatModel.create({
      user: user._id,
      title
    })
  } catch(error){
    res.status(500).json({
      message: error.message
    });
  }

  res.status(201).json({
    message: "Chat created successfully",
    chat:{
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user
    }
  });
}

module.exports = {
  createChat
};