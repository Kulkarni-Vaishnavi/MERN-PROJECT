const express = require("express");
//telling that use the controller from controller section
const { getAllProducts,createProduct, updateProduct, deleteProduct, getProductDetails } = require("../controllers/productController");
const { isAuthenticatedUser,authorizeRoles} = require("../middleware/auth");

const router = express.Router();

//in the route of products we dedicate that to get req of getAllProducts of cntrler
router.route("/products").get(getAllProducts);

//route function for the creating the new product
router.route("/product/new").post(isAuthenticatedUser,authorizeRoles("admin"), createProduct);

//route function for updating the product and deleting 
//as same url route so you can do this
router.route("/product/:id")
    .put(isAuthenticatedUser,authorizeRoles("admin"), updateProduct)
    .delete(isAuthenticatedUser,authorizeRoles("admin"), deleteProduct)
    .get(getProductDetails);

module.exports = router