require("dotenv").config();
const jwt = require("jsonwebtoken");

const createJWTPayload = (user) => {
  return { name: user.name, userId: user._id, role: user.role };
};

const createJWT = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};

const isJWTValid = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// const attachSingleCookieToResponse = (res, payload) => {
//   const oneDay = 1000 * 60 * 60 * 24;
//   res.cookie("token", createJWT(payload), {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay),
//     secure: process.env.NODE_ENV === "production",
//     signed: true,
//   });
// };

const attachCookiesToResponse = (res, payload, refreshToken) => {
  const accessTokenJWT = createJWT(payload);
  const refreshTokenJWT = createJWT({ payload, refreshToken });
  const oneDay = 1000 * 60 * 60 * 24;
  const oneMonth = oneDay * 30;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });
  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneMonth),
  });
};

const attachExpiredCookiesToResponse = (res) => {
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
  res.cookie("refreshToken", "logout", {
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
