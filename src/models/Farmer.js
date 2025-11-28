const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs");

const Farmer = sequelize.define(
  "Farmer",
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
    tableName: "farmers",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (farmer) => {
        if (farmer.password) {
          farmer.password = await bcrypt.hash(farmer.password, 10);
        }
      },
      beforeUpdate: async (farmer) => {
        if (farmer.changed("password")) {
          farmer.password = await bcrypt.hash(farmer.password, 10);
        }
      },
    },
  }
);

// Instance method to check password
Farmer.prototype.comparePassword = async function (candidatePassword) {
  if (!candidatePassword) {
    return false;
  }
  if (!this.password) {
    return false;
  }
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

module.exports = Farmer;
