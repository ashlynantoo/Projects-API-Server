const { StatusCodes } = require("http-status-codes");
const Order = require("../models/Order");
const Product = require("../models/Product");
const CustomError = require("../errors");
const { verifyPermission } = require("../utils");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const addOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length === 0) {
    throw new CustomError.BadRequestError("No items in the cart");
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      "Please provide tax and shipping fee"
    );
  }

  let orderItems = [];
  let subTotal = 0;

  for (const item of cartItems) {
    const { product, color, quantity } = item;
    const dbProduct = await Product.findById(product);
    if (!dbProduct) {
      throw new CustomError.NotFoundError(`No product with Id: ${product}`);
    }
    const { name, price, image } = dbProduct;
    const orderItem = {
      name,
      image,
      color,
      quantity,
      price,
      product,
    };
    subTotal += price * quantity;
    orderItems = [...orderItems, orderItem];
  }
  const total = subTotal + tax + shippingFee;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    payment_method_configuration: "pmc_1OHvkhC5ZuH6uB0XqKYDaOFP",
  });
  const clientSecret = paymentIntent.client_secret;

  const orderRequest = {
    tax,
    shippingFee,
    subTotal,
    total,
    orderItems,
    orderedBy: req.user.userId,
    clientSecret,
  };

  const order = await Order.create(orderRequest);

  res.status(StatusCodes.CREATED).json({ clientSecret, order });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});

  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new CustomError.NotFoundError(`No order with Id ${orderId}`);
  }

  if (!verifyPermission(req.user, String(order.orderedBy))) {
    throw new CustomError.ForbiddenError(`Access denied!`);
  }

  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ orderedBy: req.user.userId });

  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

const updateOrder = async (req, res) => {
  const { paymentIntentId } = req.body;
  const { id: orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new CustomError.NotFoundError(`No order with Id ${orderId}`);
  }

  if (!verifyPermission(req.user, String(order.orderedBy))) {
    throw new CustomError.ForbiddenError(`Access denied!`);
  }

  order.paymentIntentId = paymentIntentId;
  order.status = "paid";

  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  addOrder,
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  updateOrder,
};
