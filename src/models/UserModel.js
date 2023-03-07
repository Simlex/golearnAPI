const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      Required: [true, "Please enter your first name"],
      trim: true,
    },
    lastName: {
      type: String,
      Required: [true, "Please enter your last name"],
      trim: true,
    },
    userName: {
      type: String,
      Required: [true, "Please enter a user name"],
      trim: true,
      Unique: true,
    },
    email: {
      type: String,
      Required: true,
      match: [
        /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
        "Please enter a valid email address",
      ],
      unique: true,
    },
    password: {
      type: String,
      Required: true,
      select: false,
    },
    role: {
      type: String,
      Required: true,
      enum: ["user", "publisher", "admin"],
      default: "user",
    },
    phoneNumber: {
      type: String,
    },
    displayPicture: {
      type: String,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    subscriptionExpires: {
      type: Date,
    },
    resetToken: String,
    resetTokenExpire: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
