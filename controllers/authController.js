const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const CustomError = require("../errors");

const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new CustomError.BadRequestError(
      "Please enter the username, email ID and password"
    );
  }

  //email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new CustomError.BadRequestError(`Email ID ${email} already exists.`);
  }

  const user = await User.create(req.body);

  res.status(StatusCodes.CREATED).json({
    jwt: user.createJWT(),
    user: {
      username: user.username,
      email: user.email,
    },
  });
};

const login = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new CustomError.BadRequestError(
      "Please enter the email ID and password"
    );
  }

  const user = await User.findOne({ email: identifier });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }

  res.status(StatusCodes.OK).json({
    jwt: user.createJWT(),
    user: {
      username: user.username,
      email: user.email,
    },
  });
};

module.exports = {
  register,
  login,
};
