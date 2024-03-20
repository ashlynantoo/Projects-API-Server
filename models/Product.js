const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide the product name"],
      maxlength: [100, "Product name can't exceed 100 characters"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide the product price"],
    },
    description: {
      type: String,
      required: [true, "Please provide the product description"],
      maxlength: [1000, "Product description can't exceed 1000 characters"],
    },
    image: {
      type: String,
      required: true,
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      required: [true, "Please provide the product category"],
      enum: {
        values: ["office", "kitchen", "bedroom"],
        message: "Product category '{VALUE}' is not supported",
      },
    },
    company: {
      type: String,
      required: [true, "Please provide the product company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "Product company '{VALUE}' is not supported",
      },
    },
    colors: {
      type: [String],
      required: [true, "Please provide the product colors"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    createdOrUpdatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User details not available"],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
  // match: { rating: 5 },
});

ProductSchema.pre("deleteOne", { document: true }, async function () {
  await this.model("Review").deleteMany({ product: this._id });
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
