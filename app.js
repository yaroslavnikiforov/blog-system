const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const messages = require("express-messages");
const indexRouter = require("./routes/index");
const posts = require("./routes/posts");
const categories = require("./routes/categories");
const app = express();
const mongo = require("mongodb");
const db = require("monk")("localhost/nodeblog");

app.locals.moment = require("moment");

app.locals.trancateText = function(text, length) {
  return `${text.slice(0, length)}...`;
};

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// handle sessions
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
  })
);

// validator
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      const namespace = param.split(".");
      const root = namespace.shift();
      const formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }

      return {
        param: formParam,
        msg,
        value
      };
    }
  })
);

app.use(flash());
app.use(function(req, res, next) {
  res.locals.messages = messages(req, res);

  next();
});

app.use(function(req, res, next) {
  req.db = db;

  next();
});

app.use("/", indexRouter);
app.use("/posts", posts);
app.use("/categories", categories);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error("Not Found");

  err.status = 404;

  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
