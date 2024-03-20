const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Please provide the product rating"],
      min: [1, "Product rating should be >=1"],
      max: [5, "Product rating should be <=5"],
    },
    title: {
      type: String,
      required: [true, "Please provide the review title"],
      maxlength: [100, "Review title can't exceed 100 characters"],
      trim: true,
    },
    comment: {
      type: String,
      required: [true, "Please provide the review comment"],
      maxlength: [1000, "Review comment can't exceed 1000 characters"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User details not available"],
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: [true, "Product details not available"],
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

ReviewSchema.statics.findAvgRatingAndNumOfReviews = async function (productId) {
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  await this.model("Product").findByIdAndUpdate(productId, {
    averageRating: Math.ceil(result[0]?.averageRating || 0),
    numOfReviews: result[0]?.numOfReviews || 0,
  });
};

ReviewSchema.post("save", async function () {
  await this.constructor.findAvgRatingAndNumOfReviews(this.product);
});

ReviewSchema.post("deleteOne", { document: true }, async function () {
  await this.constructor.findAvgRatingAndNumOfReviews(this.product);
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
