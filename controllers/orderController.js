const { StatusCodes } = require("http-status-codes");
const Order = require("../models/Order");
const Product = require("../models/Product");
const CustomError = require("../errors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
  const { cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length === 0) {
    throw new CustomError.BadRequestError("No items in the cart!");
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError("Tax and shipping fee are missing!");
  }

  let subTotal = 0;
  for (const item of cartItems) {
    const { product, quantity } = item;
    const dbProduct = await Product.findById(product);
    if (!dbProduct) {
      throw new CustomError.NotFoundError(`No product with Id: ${product}`);
    }
    const { price } = dbProduct;
    subTotal += price * quantity;
  }
  const taxRounded = Math.round(tax);
  const total = subTotal + taxRounded + shippingFee;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    payment_method_configuration: "pmc_1OHvkhC5ZuH6uB0XqKYDaOFP",
  });

  const clientSecret = paymentIntent.client_secret;

  res.status(StatusCodes.CREATED).json({ clientSecret });
};

const addOrder = async (req, res) => {
  const {
    shippingAddress,
    cartItems,
    tax,
    shippingFee,
    clientSecret,
    paymentIntentId,
    status,
  } = req.body;

  if (!cartItems || cartItems.length === 0) {
    throw new CustomError.BadRequestError("No items in the cart!");
  }

  if (!shippingAddress) {
    throw new CustomError.BadRequestError(
      "Please provide the shipping address!"
    );
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError("Tax and shipping fee are missing!");
  }

  if (!clientSecret || !paymentIntentId || !status) {
    throw new CustomError.BadRequestError("Payment details are missing!");
  }

  let orderedItems = [];
  let subTotal = 0;

  for (const item of cartItems) {
    const { product, color, quantity } = item;
    const dbProduct = await Product.findById(product);
    if (!dbProduct) {
      throw new CustomError.NotFoundError(`No product with Id: ${product}`);
    }
    const { name, price, images } = dbProduct;
    const image = images[0].url;
    const orderedItem = {
      name,
      image,
      color,
      quantity,
      price,
      product,
    };
    subTotal += price * quantity;
    orderedItems = [...orderedItems, orderedItem];
  }
  const taxRounded = Math.round(tax);
  const total = subTotal + taxRounded + shippingFee;

  const orderRequest = {
    tax: taxRounded,
    shippingFee,
    subTotal,
    total,
    orderedItems,
    orderedBy: req.user.userId,
    shippingAddress,
    clientSecret,
    paymentIntentId,
    status,
  };

  const order = await Order.create(orderRequest);

  res.status(StatusCodes.CREATED).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  let result = Order.find({ orderedBy: req.user.userId })
    .select("_id total orderedItems shippingAddress createdAt")
    .sort("-createdAt");

  const page = Number(req.query.page) || 1;
  const limit = 15;
  const skip = (page - 1) * limit;
  result = result.limit(limit).skip(skip);

  const orders = await result;

  const numOfOrders = await Order.find({
    orderedBy: req.user.userId,
  }).countDocuments();
  const pageCount = Math.ceil(numOfOrders / limit);

  res.status(StatusCodes.OK).json({
    orders,
    meta: {
      pagination: { page, pageSize: limit, pageCount, total: numOfOrders },
    },
  });
};

module.exports = {
  createPaymentIntent,
  addOrder,
  getCurrentUserOrders,
};
