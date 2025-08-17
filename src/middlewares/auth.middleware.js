const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');


const authUser = async (req, res, next) => {
  const {token} = req.cookies;
  
  if(!token){
    return res.status(401).json({message: 'Unauthorized access'});
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({message: 'Unauthorized access'});
  }
}

module.exports = {authUser};