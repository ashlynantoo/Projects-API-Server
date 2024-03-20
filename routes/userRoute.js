const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUser,
  getCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");
const { restrictUserAccess } = require("../middleware/authentication");

router.route("/").get(restrictUserAccess("admin"), getAllUsers);
router.route("/showMe").get(getCurrentUser);
router.route("/updateUser").patch(updateUser);
router.route("/updateUserPassword").patch(updateUserPassword);
router.route("/:id").get(getUser);

module.exports = router;
