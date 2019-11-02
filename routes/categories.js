const express = require("express");
const router = express.Router();
const db = require("monk")("localhost/nodeblog");

router.get("/show/:category", function(req, res, next) {
  const posts = db.get("posts");
  const category = req.params.category;

  posts.find({ category }, {}, function(err, posts) {
    res.render("index", { title: category, posts });
  });
});

router.get("/add", function(req, res, next) {
  res.render("addcategory", { title: "Add Category" });
});

router.post("/add", function(req, res, next) {
  const name = req.body.name;

  // form validation
  req.checkBody("name", "Name field is required").notEmpty();

  // check errors
  const errors = req.validationErrors();

  if (errors) {
    res.render("addcategory", { errors });
  } else {
    const categories = db.get("categories");

    categories.insert({ name }, function(err, post) {
      if (err) {
        res.send(err);
      } else {
        req.flash("success", "Category added");
        res.location("/");
        res.redirect("/");
      }
    });
  }
});

module.exports = router;
