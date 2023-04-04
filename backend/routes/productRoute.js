const express = require("express");

// the below one is imported automatically after creating route
const { getAllProducts, createProduct, updateProduct,deleteProduct,getProductDetails} = require("../controllers/productcontroller"); 

const router = express.Router();

// creating route
router.route("/products").get(getAllProducts);
router.route("/product/new").post(createProduct);
router.route("/product/:id").put(updateProduct);
router.route("/product/:id").delete(deleteProduct).get(getProductDetails);


module.exports = router