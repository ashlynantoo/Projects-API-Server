const express = require("express");
const router = express.Router();
const {
  addProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  upLoadProductImage,
} = require("../controllers/productController");
const { getSingleProductReviews } = require("../controllers/reviewController");
const {
  authenticateUser,
  restrictUserAccess,
} = require("../middleware/authentication");

router
  .route("/")
  .get(getAllProducts)
  .post(authenticateUser, restrictUserAccess("admin"), addProduct);
router
  .route("/uploadImage")
  .post(authenticateUser, restrictUserAccess("admin"), upLoadProductImage);
router
  .route("/:id")
  .get(getProduct)
  .patch(authenticateUser, restrictUserAccess("admin"), updateProduct)
  .delete(authenticateUser, restrictUserAccess("admin"), deleteProduct);
router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;
