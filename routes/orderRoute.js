const express = require("express");
const router = express.Router();
const {
  addOrder,
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  updateOrder,
} = require("../controllers/orderController");
const { restrictUserAccess } = require("../middleware/authentication");

router.route("/").get(restrictUserAccess("admin"), getAllOrders).post(addOrder);
router.route("/showAllMyOrders").get(getCurrentUserOrders);
router.route("/:id").get(getSingleOrder).patch(updateOrder);

module.exports = router;
