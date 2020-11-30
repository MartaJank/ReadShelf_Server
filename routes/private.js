const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const parser = require("../config/cloudinary");

const User = require("../models/User");
const Club = require("../models/Club");
const Books = require("../models/Books");

const withAuth = require("../helpers/middleware");

//PROFILE
router.get("/profile/:userId", withAuth, (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      console.log("response:", req.user);
      //user.password = "*****";
      res.status(200).json(user);
    })
    .catch((err) => {
      res.json(err);
    });
});

module.exports = router;