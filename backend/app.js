const express = require("express");
const app = express(); //initializing express app
const cookieParser = require("cookie-parser");

app.use(express.json());//setup
app.use(cookieParser());
const errorMiddleware = require("./middleware/error");

//Route Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");

//postman url usage
app.use("/api/v1",product);
app.use("/api/v1",user)

//Middleware for errors
app.use(errorMiddleware);

module.exports = app;