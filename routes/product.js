const express = require("express");
const router = express();
const { createProduct, getAllProducts, getProductById, rateProduct, addToCart, fetchCartData, updateCartItem, removeCartItem } = require("../controllers/productController.js");
const { authenticateUser } = require("../middlewares/authMiddleware.js");



router.post("/create", createProduct);

router.get("/list/all", getAllProducts);

router.get("/info/:id", getProductById);

router.post("/ratings",authenticateUser, rateProduct);

router.post("/add/cart",authenticateUser,addToCart);

router.get("/cart/data",authenticateUser,fetchCartData);

router.patch("/cart/update", authenticateUser, updateCartItem);

router.get("/cart", (req, res) => {
    res.render("cart");
})

router.delete("/cart/remove/:id", authenticateUser, removeCartItem);

router.get("/checkout",(req,res)=>{
    res.render("checkout");
})

module.exports = router;
