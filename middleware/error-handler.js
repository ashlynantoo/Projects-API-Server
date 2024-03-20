const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (error, req, res, next) => {
  let customError = {
    // default
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: error.message || "Something went wrong. Try again later.",
  };

  if (error.name === "ValidationError") {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = Object.values(error.errors)
      .map((item) => {
        return item.message;
      })
      .join(", ");
  }

  if (error.code && error.code === 11000) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = `The value entered for ${Object.keys(
      error.keyValue
    )} already exists. Please enter another value.`;
  }

  if (error.name === "CastError") {
    customError.statusCode = StatusCodes.NOT_FOUND;
    customError.msg = `No item found with id: ${error.value}`;
  }

  return res
    .status(customError.statusCode)
    .json({ status: "error", msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
