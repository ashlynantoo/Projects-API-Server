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
    images: {
      type: [],
      required: true,
    },
    category: {
      type: String,
      required: [true, "Please provide the product category"],
      enum: {
        values: [
          "office",
          "kitchen",
          "bedroom",
          "living room",
          "dining",
          "kids",
        ],
        message: "Product category '{VALUE}' is not supported",
      },
    },
    company: {
      type: String,
      required: [true, "Please provide the product company"],
      enum: {
        values: ["ikea", "liddy", "marcos", "caressa"],
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
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
