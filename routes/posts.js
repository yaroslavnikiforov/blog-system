const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "./public/images" });
const db = require("monk")("localhost/nodeblog");

router.get("/show/:id", function(req, res, next) {
  const posts = db.get("posts");

  posts.findOne({ _id: req.params.id }, function(err, post) {
    res.render("show", { post });
  });
});

router.get("/add", function(req, res, next) {
  const categories = db.get("categories");

  categories.find({}, {}, function(err, categories) {
    res.render("addpost", { title: "Add Post", categories });
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

router.post("/addcomment", function(req, res, next) {
  const name = req.body.name;
  const email = req.body.email;
  const body = req.body.body;
  const postId = req.body.postid;
  const commentDate = new Date();

  // Form Validation
  req.checkBody("name", "Name field is required").notEmpty();
  req
    .checkBody("email", "Email field is required but never displayed")
    .notEmpty();
  req.checkBody("email", "Email is not formatted properly").isEmail();
  req.checkBody("body", "Body field is required").notEmpty();

  // Check Errors
  const errors = req.validationErrors();

  if (errors) {
    const posts = db.get("posts");

    posts.findOne({ _id: postId }, function(err, post) {
      res.render("show", {
        errors: errors,
        post: post
      });
    });
  } else {
    const comment = {
      name,
      email,
      body,
      commentDate
    };

    const posts = db.get("posts");

    posts.update(
      {
        _id: postId
      },
      {
        $push: {
          comments: comment
        }
      },
      function(err, doc) {
        if (err) {
          throw err;
        } else {
          req.flash("success", "Comment Added");
          res.location("/posts/show/" + postId);
          res.redirect("/posts/show/" + postId);
        }
      }
    );
  }
});

module.exports = router;
