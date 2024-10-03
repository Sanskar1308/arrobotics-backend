require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectDB = require("./db");
const bcrypt = require("bcrypt");
const Admin = require("./models/admin.models");
const User = require("./models/user.model");

connectDB();

app.use(express.json());

app.get("/admin/registration", async (req, res) => {
  const { username, password, email } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const exisitingAdmin = await Admin.findOne({ email });

  if (exisitingAdmin) {
    return res.json({
      message: "Admin already exists",
    });
  }

  let admin = new Admin({
    username,
    password: hashedPassword,
    email,
  });

  admin = await admin.save();

  res.json({
    msg: "Admin created successfully",
    admin,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
