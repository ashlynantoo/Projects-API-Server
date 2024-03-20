require("dotenv").config();
const jwt = require("jsonwebtoken");

const createJWTPayload = (user) => {
  return { name: user.name, userId: user._id, role: user.role };
};

const createJWT = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

const isJWTValid = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = (res, payload) => {
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("token", createJWT(payload), {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

const attachExpiredCookiesToResponse = (res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = {
  createJWTPayload,
  createJWT,
  isJWTValid,
  attachCookiesToResponse,
  attachExpiredCookiesToResponse,
};
