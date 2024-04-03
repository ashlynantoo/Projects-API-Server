const {
  createJWTPayload,
  createJWT,
  isJWTValid,
  attachCookiesToResponse,
  attachExpiredCookiesToResponse,
} = require("./jwt");
const verifyPermission = require("./verifyPermission");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("./sendEmail");
const createHash = require("./createHash");

module.exports = {
  createJWTPayload,
  createJWT,
  isJWTValid,
  attachCookiesToResponse,
  attachExpiredCookiesToResponse,
  verifyPermission,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
};
