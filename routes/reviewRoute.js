const express = require("express");
const router = express.Router();
const {
  addReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const {
  authenticateUser,
  restrictUserAccess,
} = require("../middleware/authentication");

router
  .route("/")
  .get(getAllReviews)
  .post(authenticateUser, restrictUserAccess("user"), addReview);
router
  .route("/:id")
  .get(getReview)
  .patch(authenticateUser, restrictUserAccess("user"), updateReview)
  .delete(authenticateUser, restrictUserAccess("user"), deleteReview);

module.exports = router;
