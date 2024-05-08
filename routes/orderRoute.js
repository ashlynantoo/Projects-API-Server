const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  addOrder,
  getCurrentUserOrders,
} = require("../controllers/orderController");

router.route("/").post(addOrder);
router.route("/createPaymentIntent").post(createPaymentIntent);
router.route("/showAllMyOrders").get(getCurrentUserOrders);

module.exports = router;
