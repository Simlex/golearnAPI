var createError = require("http-errors");
var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { format } = require("date-fns");
require("dotenv").config();
const cookieparser = require("cookie-parser");
const errorHandler = require("./src/middleware/errorHandler");
const courseRouter = require("./src/routers/courseRouter");
const authRouter = require("./src/routers/authroute");
const reviewRouter = require("./src/routers/reviewRoute");
const cartRouter = require("./src/routers/cartRoute");
const oredrRouter = require("./src/routers/orderRouter");
const CourseStats = require("./src/models/courseStats");
const Course = require("./src/models/courseModel");
const User = require("./src/models/UserModel");
const userRouter = require("./src/routers/userRoute");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

const initializeCourseStats = async () => {
  try {
    const courseStats = await Course.aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: "$numberOfStudents" },
        },
      },
    ]);

    if (courseStats.length > 0) {
      const totalStudents = courseStats[0].totalStudents;
      await CourseStats.create({ totalStudents });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call the initializeCourseStats function to initialize the CourseStats collection
initializeCourseStats();

// set rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per `window` (here, per 15 minutes)
});

// Apply the rate limiting middleware to all requests

// 1st party dependencies
var configData = require("./config/connection");

async function getApp() {
  // Database
  var connectionInfo = await configData.getConnectionInfo();
  mongoose.connect(connectionInfo.DATABASE_URL);

  var app = express();
  app.use(limiter);

  var port = normalizePort(process.env.PORT || "3000");
  app.set("port", port);

  // view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "pug");

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  // sanitize data
  app.use(mongoSanitize());
  // set security headers
  app.use(helmet());
  // prevent xss attack
  app.use(xss());
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "https://go-learn.online",
        "https://go-learn.netlify.app",
      ],
      credentials: true,
    })
  );

  app.use(hpp());
  app.use(express.static(path.join(__dirname, "public")));

  app.locals.format = format;

  app.get("/", async (req, res) => {
    res.json({ message: "Please visit /api/v1/user to view all the users" });
  });
  app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js")); // redirect bootstrap JS
  app.use(
    "/css",
    express.static(__dirname + "/node_modules/bootstrap/dist/css")
  ); // redirect CSS bootstrap

  app.use("/api/v1/course", courseRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/reviews", reviewRouter);
  app.use("/api/v1/cart", cartRouter);
  app.use("/api/v1/order", oredrRouter);
  app.use("/api/v1/user", userRouter);

  app.use(errorHandler);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

  return app;
}
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
module.exports = {
  getApp,
};
