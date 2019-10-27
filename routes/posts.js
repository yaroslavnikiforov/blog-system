const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "./uploads" });
const db = require("monk")("localhost/nodeblog");

router.get("/add", function(req, res, next) {
  const categories = db.get("categories");

  categories.find({}, {}, function(err, categories) {
    res.render("addpost", { title: "Add post", categories });
  });
});

router.post("/add", upload.single("mainimage"), function(req, res, next) {
  const title = req.body.title;
  const category = req.body.category;
  const body = req.body.body;
  const author = req.body.author;
  const date = new Date();
  let mainimage = "noimage.jpg";

  // check image upload
  if (req.file) {
    mainimage = req.file.filename;
  }

  // form validation
  req.checkBody("title", "Title field is required").notEmpty();
  req.checkBody("body", "Body field is required").notEmpty();

  // check errors
  const errors = req.validationErrors();

  if (errors) {
    res.render("addpost", { errors });
  } else {
    const posts = db.get("posts");

    posts.insert(
      {
        title,
        body,
        category,
        author,
        mainimage,
        date
      },
      function(err, post) {
        if (err) {
          res.send(err);
        } else {
          req.flash("success", "Post added");
          res.location("/");
          res.redirect("/");
        }
      }
    );
  }
});

module.exports = router;
