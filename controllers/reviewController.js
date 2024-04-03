const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const Review = require("../models/Review");
const CustomError = require("../errors");

const addReview = async (req, res) => {
  const { product: productId } = req.body;
  const { userId } = req.user;

  const isValidProduct = await Product.findById(productId);
  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product with Id ${productId}`);
  }

  const isReviewAlreadySubmitted = await Review.findOne({
    user: userId,
    product: productId,
  });
  if (isReviewAlreadySubmitted) {
    throw new CustomError.BadRequestError(
      `You have already given a review for this product!`
    );
  }

  req.body.user = userId;
  const review = await Review.create(req.body);

  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name price company",
  });

  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });

  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

const getReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new CustomError.NotFoundError(`No review with Id ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { rating, title, comment } = req.body;
  const { id: reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new CustomError.NotFoundError(`No review with Id ${reviewId}`);
  }

  if (req.user.userId !== String(review.user)) {
    throw new CustomError.ForbiddenError(`Access denied!`);
  }

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();

  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new CustomError.NotFoundError(`No review with Id ${reviewId}`);
  }

  if (req.user.userId !== String(review.user)) {
    throw new CustomError.ForbiddenError(`Access denied!`);
  }

  await review.deleteOne();

  res.status(StatusCodes.OK).json({ msg: "Review removed successfully!" });
};

module.exports = {
  addReview,
  getAllReviews,
  getSingleProductReviews,
  getReview,
  updateReview,
  deleteReview,
};
