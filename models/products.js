const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const Products = sequelize.define(
    "products",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { isFloat: true, min: 0 },
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isUrl: true },
      },
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0 },
      },
      rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
        validate: { min: 0, max: 5 },
      },
    },
    {
      timestamps: true,
    }
  );




  return Products;
};
