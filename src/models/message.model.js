const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  chat:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chat',
    required: true
  },
  content:{
    type: String,
    required: true
  },
  createdAt:{
    type: Date,
    default: Date.now
  },
  role :{
    type:String,
    default: 'user',
    enum: ['user', 'model', 'system']
  }
})

const messageModel = mongoose.model('message', messageSchema);

module.exports = messageModel;
