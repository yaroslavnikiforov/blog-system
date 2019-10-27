const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const multer = require("multer");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const messages = require("express-messages");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

const db = require("monk")("localhost/nodeblog");
const upload = multer({ dest: "./uploads" });

app.locals.moment = require("moment");

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
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
