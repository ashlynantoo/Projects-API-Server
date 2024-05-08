const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide the cart item name"],
  },
  image: {
    type: String,
    required: [true, "Please provide the cart item image"],
  },
  color: {
    type: String,
    required: [true, "Please provide the cart item color"],
  },
  quantity: {
    type: Number,
    required: [true, "Please provide the quantity of the cart item"],
  },
  price: {
    type: Number,
    required: [true, "Please provide the price of the cart item"],
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
    required: [true, "Product details not available"],
  },
});

const OrderSchema = new mongoose.Schema(
  {
    tax: {
      type: Number,
      required: [true, "Please provide the tax amount"],
    },
    shippingFee: {
      type: Number,
      required: [true, "Please provide the shipping amount"],
    },
    subTotal: {
      type: Number,
      required: [true, "Please provide the subTotal amount"],
    },
    total: {
      type: Number,
      required: [true, "Please provide the total amount"],
    },
    orderedItems: {
      type: [CartSchema],
      required: [true, "Please provide the ordered items"],
    },
    orderedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User details not available"],
    },
    shippingAddress: {
      type: String,
      required: [true, "Please provide the shipping address"],
    },
    clientSecret: {
      type: String,
      required: [true, "Please provide the stripe client secret"],
    },
    paymentIntentId: {
      type: String,
      required: [true, "Please provide the stripe payment intent Id"],
    },
    status: {
      type: String,
      required: [true, "Please provide the stripe payment status"],
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
