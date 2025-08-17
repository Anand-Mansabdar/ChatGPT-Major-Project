const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerUser = async (req, res) => {
  const {fullName: {firstName, lastName}, email, password} = req.body;

  const userExists = await userModel.findOne({email});

  if(userExists){
    res.status(400).json({
      message: "User exists"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    fullName: {
      firstName, lastName
    },
    email, 
    hashedPassword
  });

  const token = jwt.sign({id:user._id}, process.env.JWT_SECRET);

  res.cookie('token', token);

  res.status(201).json({
    message: "User registered successfully!",
    user:{
      email: user.email,
      fullName: user.fullName,
      _id : user._id
    }
  })
}

const loginUser = async (req, res) => {
  const {email, password} = req.body;

  const user = await userModel.findOne({
    email
  })

  if(!user){
    res.status(401).json({
      message: "Invalid email or password"
    });
  }

  const decoded = await bcrypt.compare(password, user.hashedPassword);

  if(!decoded){
    res.status(401).json({
      message: "Invalid password"
    });
  }

  const token = await jwt.sign({id: user._id}, process.env.JWT_SECRET);

  res.cookie('token', token);

  res.status(200).json({
    message: "User logged in successfully!",
    user: {
      email: user.email,
      fullName: user.fullName,
      _id: user._id
    }
  });
}

module.exports = {registerUser, loginUser};