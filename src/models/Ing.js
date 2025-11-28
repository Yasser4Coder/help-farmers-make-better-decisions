const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs");

const Ing = sequelize.define(
  "Ing",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "full_name",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "phone_number",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fcmToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "fcm_token",
      comment: "Firebase Cloud Messaging token for push notifications",
    },
  },
  {
    tableName: "ings",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (ing) => {
        if (ing.password) {
          ing.password = await bcrypt.hash(ing.password, 10);
        }
      },
      beforeUpdate: async (ing) => {
        if (ing.changed("password")) {
          ing.password = await bcrypt.hash(ing.password, 10);
        }
      },
    },
  }
);

// Instance method to check password
Ing.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = Ing;
