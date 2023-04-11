const express = require("express");
const router = express.Router();
const {registerUser, loginUser, logout, forgetPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUser, getSingleUser, updateUserRole, deleteProfile, createProductReview, getProductReviews, deleteProductReviews  } = require("../controllers/userController");
const { isAuthenticatedUser,authorizeRoles} = require("../middleware/auth");

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgetPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);

router.route("/admin/users")
.get(isAuthenticatedUser, authorizeRoles('admin'),getAllUser);

router.route("/admin/user/:id")
.get(isAuthenticatedUser, authorizeRoles('admin'),getSingleUser)
.put(isAuthenticatedUser, authorizeRoles('admin'),updateUserRole)
.delete(isAuthenticatedUser, authorizeRoles('admin'),deleteProfile);


router.route("/review").put(isAuthenticatedUser, createProductReview);

router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser,deleteProductReviews);



module.exports = router