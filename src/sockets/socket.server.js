const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const aiService = require('../services/ai.service');
const messageModel = require('../models/message.model');
const {createMemory, queryMemory} = require('../services/vector.service');
const { chat } = require("@pinecone-database/pinecone/dist/assistant/data/chat");

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

      const createdMessage = await messageModel.create({
        chat: message.chat,
        user: socket.user._id,
        content: message.content,
        role: 'user'
      });

      const vectors = await aiService.generateVector(message.content);
      console.log(vectors);

      await createMemory({
        vectors,
        messageId: createdMessage._id,
        metaData: {
          chat: message.chat,
          user: socket.user._id,
          text: message.content
        }
      })

      const memory = await queryMemory({
        queryVector: vectors,
        limit: 3,
        metaData:{
          user: socket.user._id,
        }
      })

      console.log(memory);

      const chatHistory = await messageModel.find({
        chat: message.chat
      }).sort({ createdAt: 1 }).limit(20).lean().reverse();

      console.log(`Chat History`);

      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{text: item.content}]
        };
      });

      const ltm = [
        {
          role: 'user',
          parts: [
            {text: `
              these are the previous messages in this chat:
              ${memory.map(item => `- ${item.content}`).join('\n')}
            `}
          ]
        }
      ]

      console.log(`LTM`, ltm);
      console.log(`STM`, stm);

      // Handle the AI message here
      const response = await aiService.generateResponse([...ltm, ...stm]);

      const responseMessage = await messageModel.create({
        chat: message.chat,
        user: socket.user._id,
        content: response,
        role: 'model'
      });

      const responseVectors = await aiService.generateVector(response);

      await createMemory({
        vectors: responseVectors,
        messageId: responseMessage._id,
        metaData: {
          chat: message.chat,
          user: socket.user._id,
          text: response
        }
      });

      socket.emit('ai-response', {
        content: response,
        chat: message.chat
      });
    })
  });
}

module.exports = initSocketServer;