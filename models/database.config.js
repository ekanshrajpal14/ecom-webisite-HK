const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("ecom", "root", "Ekansh123@", {
  host: "localhost",
  dialect: "mysql",
  pool: { max: 5, min: 0, idle: 10000 },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.sequelize.sync({ force: false }).then(() => {
  console.log("Database & tables created!");
});
db.users = require("./users.js")(sequelize, DataTypes);
db.products = require("./products.js")(sequelize, DataTypes);
db.ratings = require("./rating.js")(sequelize, DataTypes);
db.cart = require("./cart.js")(sequelize, DataTypes);

// db.users.hasMany(db.cart,{foreignKey: "user_email"});
db.cart.belongsTo(db.users, {
  foreignKey: "user_email",
  targetKey: "email", // because we’re linking by email
});

db.cart.belongsTo(db.products, {
  foreignKey: "product_id",
  targetKey: "id", // because we’re linking by id
});

db.ratings.belongsTo(db.products, {
  foreignKey: "product_id",
  targetKey: "id", // because we’re linking by id
});
db.ratings.belongsTo(db.users, {
  foreignKey: "user_email",
  targetKey: "email",
});
db.products.hasMany(db.ratings, {
  foreignKey: "product_id",
  as: "ratings",
});

module.exports = db;
