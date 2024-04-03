const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide the name"],
    minlength: [3, "Name should be at least 3 characters"],
    maxlength: [50, "Name should not exceed 50 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide the email ID"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email ID",
    },
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide the password"],
    minlength: [6, "Password should be at least 6 characters"],
  },
  role: {
    type: String,
    enum: {
      values: ["admin", "user"],
      message: "Role '{VALUE}' is not supported",
    },
    default: "user",
  },
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedOn: Date,
  passwordToken: String,
  passwordTokenExpiresOn: Date,
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (userPassword) {
  const isMatching = await bcrypt.compare(userPassword, this.password);
  return isMatching;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
