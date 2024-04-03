const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const Token = require("../models/Token");
const CustomError = require("../errors");
const {
  createJWTPayload,
  attachCookiesToResponse,
  attachExpiredCookiesToResponse,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
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

  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });

  // //server web address
  // console.log(`Server: ${req.protocol}://${req.get("host")}`);
  // //frontend web address
  // console.log(
  //   `Frontend: ${req.get("x-forwarded-proto")}://${req.get("x-forwarded-host")}`
  // );
  // const origin = "http://localhost:3000"; //the frontend web address
  const origin = `${req.get("x-forwarded-proto")}://${req.get(
    "x-forwarded-host"
  )}`;

  await sendVerificationEmail(user.name, user.email, verificationToken, origin);

  res.status(StatusCodes.CREATED).json({
    msg: "Success! An email is sent to your registered email ID. Please verify the email to activate your account.",
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Verification failed!");
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError("Verification failed!");
  }

  user.isVerified = true;
  user.verifiedOn = Date.now();
  user.verificationToken = "";

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Success! Your email is verified." });
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
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError(
      "An email has been sent to your registered email ID. Please verify the email to activate your account."
    );
  }

  const payload = createJWTPayload(user);

  let refreshToken = "";

  const token = await Token.findOne({ user: user._id });
  if (token) {
    const { isValid } = token;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid credentials");
    }
    refreshToken = token.refreshToken;
  } else {
    refreshToken = crypto.randomBytes(32).toString("hex");

    await Token.create({
      refreshToken,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      user: user._id,
    });
  }

  attachCookiesToResponse(res, payload, refreshToken);

  res.status(StatusCodes.OK).json({ user: payload });
};

const logout = async (req, res) => {
  await Token.deleteOne({ user: req.user.userId });
  attachExpiredCookiesToResponse(res);
  res.status(StatusCodes.OK).send();
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError("Please provide the email ID");
  }

  const user = await User.findOne({ email });
  if (user) {
    const passwordToken = crypto.randomBytes(64).toString("hex");
    const oneDay = 1000 * 60 * 60 * 24;
    const origin = `${req.get("x-forwarded-proto")}://${req.get(
      "x-forwarded-host"
    )}`;

    await sendResetPasswordEmail(user.name, user.email, passwordToken, origin);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpiresOn = new Date(Date.now() + oneDay);

    await user.save();
  }

  res.status(StatusCodes.OK).json({
    msg: "An email is sent to your registered email ID with the reset password link.",
  });
};

const resetPassword = async (req, res) => {
  const { password, token, email } = req.body;

  if (!password) {
    throw new CustomError.BadRequestError("Please provide the new password");
  }

  if (!token || !email) {
    throw new CustomError.BadRequestError(
      "Please provide the token and email ID"
    );
  }

  const user = await User.findOne({ email });
  if (user) {
    if (
      user.passwordToken !== createHash(token) ||
      Date.now() > user.passwordTokenExpiresOn
    ) {
      throw new CustomError.UnauthenticatedError("Password reset failed!");
    }

    user.password = password;
    user.passwordToken = null;
    user.passwordTokenExpiresOn = null;

    await user.save();
  }

  res.status(StatusCodes.OK).json({ msg: "Success! Your password is reset." });
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
