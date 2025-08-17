const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const aiService = require('../services/ai.services');
const messageModel = require('../models/message.model');

function initSocketServer(httpServer){
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || '');
    console.log(cookies);
    if(!cookies.token){
      return next(new Error("Authentication error"));
    }

    try {

      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error("Authentication error"));
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected', socket.user);

    socket.on('ai-message',async (message) => {
      console.log('AI message received:', message);

      await messageModel.create({
        chat: message.chat,
        user: socket.user._id,
        content: message.content,
        role: 'user'
      });

      const chatHistory = await messageModel.find({
        chat: message.chat
      })

      console.log(`Chat History`);

      // Handle the AI message here
      const response = await aiService.generateResponse(chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{text: item.content}]
        };
      }));

      await messageModel.create({
        chat: message.chat,
        user: socket.user._id,
        content: response,
        role: 'model'
      });

      socket.emit('ai-response', {
        content: response,
        chat: message.chat
      });
    })
  });
}

module.exports = initSocketServer;