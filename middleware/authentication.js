require("dotenv").config();
const jwt = require("jsonwebtoken");
const CustomError = require("../errors");

const authenticateUser = async (req, res, next) => {
  let token = null;

  //check header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  //check cookies
  else if (req.signedCookies.token) {
    token = req.signedCookies.token;
  }

  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication failed!");
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication failed!");
  }
};

module.exports = authenticateUser;
