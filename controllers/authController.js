const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const CustomError = require("../errors");
const {
  createJWTPayload,
  createJWT,
  attachCookiesToResponse,
  attachExpiredCookiesToResponse,
} = require("../utils");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  //email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new CustomError.BadRequestError(`Email ID ${email} already exists.`);
  }

  //first user registered as admin
  const isFirstUser = (await User.countDocuments()) === 0;
  const role = isFirstUser ? "admin" : "user";

  const user = await User.create({ name, email, password, role });
  const payload = createJWTPayload(user);

  //JWT sent as response and token saved in local storage at client side
  //   res.status(StatusCodes.CREATED).json({
  //     user: payload,
  //     token: createJWT(payload),
  //   });

  //JWT sent with cookie
  attachCookiesToResponse(res, payload);
  res.status(StatusCodes.CREATED).json({ user: payload });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError(
      "Please provide email ID and password"
    );
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.NotFoundError("User does not exist");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }

  const payload = createJWTPayload(user);
  attachCookiesToResponse(res, payload);
  res.status(StatusCodes.OK).json({ user: payload });
};

const logout = async (req, res) => {
  attachExpiredCookiesToResponse(res);
  res.status(StatusCodes.OK).send();
};

module.exports = { register, login, logout };
