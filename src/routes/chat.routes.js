const express = require('express');
const router = express.Router();
const {authUser} = require('../middlewares/auth.middleware');
const {createChat} = require('../controllers/chat.controller');

// api/chat/ => check app.js
router.post('/',authUser, createChat);

module.exports = router;