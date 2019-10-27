const express = require("express");
const router = express.Router();

const mongo = require("mongodb");
const db = require("monk")("localhost/nodeblog");

/* GET home page. */
router.get("/", function(req, res, next) {
  const db = req.db;
  const posts = db.get("posts");

  posts.find({}, {}, function(err, posts) {
    res.render("index", { posts });
  });
});

module.exports = router;
