require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectDB = require("./db");
const bcrypt = require("bcrypt");
const Admin = require("./models/admin.models");
const User = require("./models/user.model");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

connectDB();

app.use(express.json());

const registrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const middleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).send();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token: ", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed: ", err);
    return res.sendStatus(403);
  }
};

app.post("/registration", async (req, res) => {
  const validation = registrationSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: validation.error.errors[0].message,
    });
  }

  console.log(validation);

  const { username, password, email } = validation.data;

  const exisitingUser = await User.findOne({ email });
  if (exisitingUser) {
    return res.status(409).json({
      message: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let user = new User({
    username,
    password: hashedPassword,
    email,
  });

  user = await user.save();

  res.json({
    msg: "User created successfully",
    user,
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "User logged in successfully",
      token: jwtToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.post("/admin/registration", async (req, res) => {
  const validation = registrationSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: validation.error.errors[0].message,
    });
  }

  const { username, password, email } = validation.data;

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

app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const jwtToken = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Admin logged in successfully",
      token: jwtToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
