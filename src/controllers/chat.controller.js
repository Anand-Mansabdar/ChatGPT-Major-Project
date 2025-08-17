const chatModel = require('../models/chat.model');


const createChat = async (req, res) => {
  const {title} = req.body;
  const user = req.user;

  try{
    const chat = await chatModel.create({
      user: user._id,
      title
    });

    return res.status(201).json({
    message: "Chat created successfully",
    chat:{
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user
    }
  });
  } catch(error){
    return res.status(500).json({
      message: error.message
    });
  }

  
}

module.exports = {
  createChat
};