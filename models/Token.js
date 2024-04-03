const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
  {
    refreshToken: {
      type: String,
      required: [true, "Please provide the refresh token"],
    },
    ip: {
      //ip address of user
      type: String,
      required: [true, "Please provide the ip address"],
    },
    userAgent: {
      //device used by user
      type: String,
      required: [true, "Please provide the user agent"],
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User details not available"],
    },
  },
  { timestamps: true }
);

const Token = mongoose.model("Token", TokenSchema);

module.exports = Token;
