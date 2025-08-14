require("dotenv").config();
const db = require("../models/database.config.js");
const Users = db.users;
const ErrorHandler = require("../utlis/ErrorHandler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (user, secret, expiresIn) => {
  return jwt.sign({ name: user.name, email: user.email }, secret, {
    expiresIn,
  });
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, gender } = req.body;
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await Users.create({
      name,
      email,
      password: hashedPassword,
      gender,
    });
    // Generate tokens
    const accessToken = generateToken(user, process.env.JWT_SECRET, process.env.JWT_EXPIRY);
    console.log(accessToken);

    res.status(201).json({
      message: "User created successfully",
      user: {
        name: user.name,
        email: user.email,
        gender: user.gender,
        accessToken,
      },
      success: true,
      status: 201,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500, "User creation failed", error));
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Email and password are required", 400, "Login failed"));
    }
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401, "Login failed"));
    }
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    const accessToken = generateToken(user, process.env.JWT_SECRET, process.env.JWT_EXPIRY);

    res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        gender: user.gender,
        accessToken,
      },
      success: true,
      status: 200,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500, "Login failed", error));
  }
};

module.exports = {
  createUser,
  loginUser,
};
