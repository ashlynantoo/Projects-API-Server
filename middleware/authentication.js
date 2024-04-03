const CustomError = require("../errors");
const { isJWTValid, attachCookiesToResponse } = require("../utils");
const Token = require("../models/Token");

const authenticateUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = isJWTValid(accessToken);
      req.user = payload;
    } else {
      const data = isJWTValid(refreshToken);
      const { userId } = data.payload;
      const token = await Token.findOne({
        user: userId,
        refreshToken: data.refreshToken,
      });
      if (!token || token?.isValid === false) {
        throw new CustomError.UnauthenticatedError("Authentication failed!");
      }
      attachCookiesToResponse(res, data.payload, token.refreshToken);
      req.user = data.payload;
    }
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
