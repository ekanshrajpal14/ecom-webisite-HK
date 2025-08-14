const express = require("express");
const { logger, errorLogger } = require("./utlis/logger.js");
const path = require("path");
const fs = require("fs");
const db = require("./models/database.config.js");
const { generatedErrors } = require("./middlewares/error.js");
const app = express();
const Razorpay = require("razorpay");
const { authenticateUser } = require("./middlewares/authMiddleware.js");

var instance = new Razorpay({
  key_id: "rzp_test_R587bOR2CeeUCM",
  key_secret: "Wy8QWW3wRc83rlshRC80YLEg",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.use(express.static(path.join(__dirname, "public")));
// view ejs setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index", { title: "Home Page" });
});

app.post("/create/orderID", authenticateUser, async function (req, res, next) {
  const user = req.user;
  const cartData = await db.cart.findAll({
    where: { user_email: user.email },
    include: [{ model: db.products, as: "product" }],
  });
  if (!cartData || cartData.length === 0) {
    return res.status(400).json({ success: false, message: "No items in cart" });
  }
  let totalPrice = 0;
  cartData.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
  });
  console.log(totalPrice);

  var options = {
    amount: totalPrice * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11",
    partial_payment: false,
  };
  console.log("Creating order with options:", options);

  instance.orders.create(options, function (err, order) {
    res.send(order);
  });
});
app.post("/api/payment/verify", authenticateUser,async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }
  let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

  var crypto = require("crypto");
  var expectedSignature = crypto.createHmac("sha256", "Wy8QWW3wRc83rlshRC80YLEg").update(body.toString()).digest("hex");
  console.log("sig received ", req.body.response.razorpay_signature);
  console.log("sig generated ", expectedSignature);
  var response = { signatureIsValid: "false" };
  if (expectedSignature === req.body.response.razorpay_signature) {
    response = { signatureIsValid: "true" };
    const emptyCart = await db.cart.destroy({
      where: { user_email: user.email },
    });
    console.log(emptyCart,1234567);
    
  }

  res.send(response);
});

app.get("/paymentsuccess", function (req, res) {
  res.render("sucess");
});

app.use("/user", require("./routes/index.js"));
app.use("/product", require("./routes/product.js"));

// app.get("/error",(req,res,next)=>{
//   const err = new Error("This is a test error");
//   err.statusCode = 500;
//   next(err);
// })

app.use(generatedErrors);

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
