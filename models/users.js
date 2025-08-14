module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define("users", {
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    password: DataTypes.STRING,
    gender: {
      type: DataTypes.ENUM("M", "F", "O"),
    },
  });
  return Users;
};
