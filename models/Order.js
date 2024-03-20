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
    orderItems: {
      type: [CartSchema],
      required: [true, "Please provide the order items"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "failed", "paid", "delivered", "cancelled"],
        message: "Order status '{VALUE}' is not supported",
      },
      default: "pending",
    },
    orderedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User details not available"],
    },
    clientSecret: {
      type: String,
      required: [true, "Please provide the stripe client secret"],
    },
    paymentIntentId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
