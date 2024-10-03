require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://admin:aKSHw2njjioupAYz@cluster0.bxkhk0r.mongodb.net/")
  .then(() => console.log("connected to MongoDB...."))
  .catch((err) => console.log("Couldn't connect to MongoDB!!"));

app.use(express.json());
