const db = require("../models/database.config.js");
const Products = db.products;
const Sequelize = db.Sequelize;
const ErrorHandler = require("../utlis/ErrorHandler");
const { v4: uuidv4 } = require("uuid");
const { Op, where } = require("sequelize");
const Ratings = db.ratings;
const Cart = db.cart;

const createProduct = async (req, res, next) => {
  try {
    // const resp = await fetch("https://api.escuelajs.co/api/v1/products?offset=0&limit=30");
    // const data = await resp.json();
    // const products = [];
    // data.forEach(async (product) => {
    //   const { title, price, description, category, image, rating } = product;
    //   const newProduct = await Products.create({
    //     id: uuidv4(),
    //     title,
    //     price,
    //     description,
    //     category:category.name,
    //     image:product.images[0],
    //     rating: 0,
    //     stock: Math.floor(Math.random() * 100), // Random stock quantity
    //   });
    //   await newProduct.save();
    //   products.push(newProduct);
    // });
    const { title, price, description, category } = req.body;
    const products = await Products.create({
      id: uuidv4(),
      title,
      price,
      description,
      category,
      stock: Math.floor(Math.random() * 100), // Random stock quantity
    });
    res.status(201).json({
      message: "Product created successfully",
      products,
    });
    // res.redirect("/product/list/all");
  } catch (error) {
    next(new ErrorHandler(error.message, 500, "Product creation failed", error));
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const categoryFilter = req.query.category || "";

    // Get distinct categories for dropdown
    const categories = await Products.findAll({
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("category")), "category"]],
    });

    // Where condition for search + category filter
    let whereCondition = {};
    if (search) {
      whereCondition[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { category: { [Op.like]: `%${search}%` } }];
    }
    if (categoryFilter) {
      whereCondition.category = categoryFilter;
    }

    const { count, rows: products } = await Products.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.render("products", {
      message: "Products retrieved successfully",
      products,
      currentPage: page,
      totalPages,
      totalProducts: count,
      search,
      categories: categories.map((c) => c.category),
      selectedCategory: categoryFilter,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500, "Failed to retrieve products", error));
  }
};

const getProductById = async (req, res, next) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return next(new ErrorHandler("Product ID is required", 400, "Invalid request"));
    }
    const productInfo = await Products.findOne({
      where: { id: productId },
    });
    if (!productInfo) {
      return next(new ErrorHandler("Product not found", 404, "Product retrieval failed"));
    }
    res.render("prodInfo", {
      message: "Product information retrieved successfully",
      title: "Product Details",
      product: productInfo,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500, "Failed to retrieve product info", error));
  }
};

const rateProduct = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;
    console.log("Rating request body:", req.user, rating, comment, productId);

    if (!productId || !rating) {
      return next(new ErrorHandler("Product ID and rating are required", 400, "Invalid request"));
    }

    const existingRating = await Ratings.findOne({
      where: {
        user_email: req.user.email,
        product_id: productId,
      },
    });
    if (existingRating) {
      return next(new ErrorHandler("You have already rated this product", 400, "Duplicate rating"));
    }
    const newRating = await Ratings.create({
      id: uuidv4(),
      review: comment || null,
      rating: parseFloat(rating),
      user_email: req.user.email,
      product_id: productId,
    });

    // const product = await Products.update(
    //   {
    //     rating: Sequelize.literal(`
    //   CASE
    //     WHEN rating = 0 THEN ${rating}
    //     ELSE (rating + ${rating}) / 2
    //   END
    // `),
    //   },
    //   {
    //     where: { id: productId },
    //     returning: true, // returns the updated row if DB supports it
    //   }
    // );

    res.status(200).json({
      message: "Rating submitted successfully",
      newRating,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500, "Failed to submit rating", error));
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return next(new ErrorHandler("Product ID is required", 400, "Invalid request"));
    }
    const existingCartItem = await Cart.findOne({
      where: {
        user_email: req.user.email,
        product_id: productId,
      },
    });
    if (existingCartItem) {
      const updateCartItem = await Cart.update(
        {
          quantity: existingCartItem.quantity + 1,
        },
        {
          where: {
            user_email: req.user.email,
            product_id: productId,
          },
        }
      );
    } else {
      const newCartItem = await Cart.create({
        user_email: req.user.email,
        product_id: productId,
        quantity: 1,
      });
    }
    res.status(200).json({
      message: "Product added to cart successfully",
      success: true,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500, "Failed to add product to cart", error));
  }
};

const fetchCartData = async (req, res, next) => {
  try {
    const cartItems = await Cart.findAll({
      where: {
        user_email: req.user.email,
      },
      include: [
        {
          model: db.users,
          as: "user", // alias from association
          attributes: ["name", "email"], // select only needed columns
        },
        {
          model: Products,
          as: "product",
        },
      ],
    });
    if (cartItems.length === 0) {
      return res.status(200).json({
        message: "No items found in cart",
        cartItems: [],
        success: true,
      });
    }
    res.status(200).json({
      message: "Cart data retrieved successfully",
      cartItems,
      success: true,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500, "Failed to fetch cart data", error));
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const user = req.user;
    const { productId, isIncrement } = req.body;
    const cartItem = await Cart.findOne({
      where: {
        user_email: user.email,
        product_id: productId,
      },
    });
    if (isIncrement) {
      await Cart.increment("quantity", {
        by: 1,
        where: {
          user_email: user.email,
          product_id: productId,
        },
      });
    } else {
      if (cartItem.quantity <= 1) {
        await Cart.destroy({
          where: {
            user_email: user.email,
            product_id: productId,
          },
        });
      } else {
        await Cart.decrement("quantity", {
          by: 1,
          where: {
            user_email: user.email,
            product_id: productId,
          },
        });
      }
    }
    res.status(200).json({
      message: "Cart item updated successfully",
      success: true,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500, "Failed to update cart item", error));
  }
};


const removeCartItem = async (req,res,next)=>{
  try {
    
    const productId = req.params.id;
    const user = req.user;
    if (!productId) {
      return next(new ErrorHandler("Product ID is required", 400, "Invalid request"));
    } 
    
    await Cart.destroy({
      where: {
        user_email: user.email,
        product_id: productId,
      },
    });

    res.status(200).json({
      message: "Cart item removed successfully",
      success: true,
    });

  } catch (error) {
    next(new ErrorHandler(error.message, 500, "Failed to remove cart item", error));
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  rateProduct,
  addToCart,
  fetchCartData,
  updateCartItem,
  removeCartItem,
};
