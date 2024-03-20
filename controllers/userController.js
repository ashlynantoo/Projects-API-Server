const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const CustomError = require("../errors");
const {
  createJWTPayload,
  attachCookiesToResponse,
  verifyPermission,
} = require("../utils");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");

  res.status(StatusCodes.OK).json({ users });
};

const getUser = async (req, res) => {
  const { id: requestedUserId } = req.params;
  const hasPermission = verifyPermission(req.user, requestedUserId);
  if (!hasPermission) {
    throw new CustomError.ForbiddenError("Access denied!");
  }
  const user = await User.findById(requestedUserId).select("-password");

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${requestedUserId}!`);
  }

  res.status(StatusCodes.OK).json({ user });
};

const getCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  const { userId } = req.user;

  if (!name || !email) {
    throw new CustomError.BadRequestError("Please provide all details");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { name, email },
    {
      new: true,
      runValidators: true,
    }
  );

  const payload = createJWTPayload(user);
  attachCookiesToResponse(res, payload);
  res.status(StatusCodes.OK).json({ user: payload });
};

const updateUserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req.user;

  if (!currentPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "Please provide current password and new password"
    );
  }

  const user = await User.findById(userId);

  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new CustomError.UnauthenticatedError("Incorrect current password");
  }

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password updated successfully!" });
};

module.exports = {
  getAllUsers,
  getUser,
  getCurrentUser,
  updateUser,
  updateUserPassword,
};
