const CustomError = require("../errors");
const { isJWTValid } = require("../utils");

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
    const payload = isJWTValid(token);
    const { name, userId, role } = payload;
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication failed!");
  }
};

const restrictUserAccess = (...roles) => {
  return async (req, res, next) => {
    const { role } = req.user;
    if (!roles.includes(role)) {
      throw new CustomError.ForbiddenError("Access denied!");
    }
    next();
  };
};

module.exports = { authenticateUser, restrictUserAccess };
