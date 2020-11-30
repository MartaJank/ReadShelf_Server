const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const User = require("../models/User");

const withAuth = require("../helpers/middleware");

/* GET '/home' */
router.get("/home", withAuth, function (req, res, next) {
  res.json("Protected route");
});

//  POST '/signup'
router.post("/signup", async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const emailExists = await User.findOne({ email }, "email");

    if (emailExists) {
      return res.status(400).json({ errorMessage: "Email already exists!" });
    } else {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashPass = bcrypt.hashSync(password, salt);
      const newUser = await User.create({
        username,
        email,
        password: hashPass,
      });

      const payload = { email };
      const token = jwt.sign(payload, process.env.SECRET_SESSION, {
        expiresIn: "1h",
      });
      res.cookie("token", token, { httpOnly: true }).sendStatus(200);
    }
  } catch (error) {
    next(error);
  }
});

//  POST '/login'
router.post("/login", async function (req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ errorMessage: "User does not exist!" });
    } else if (bcrypt.compareSync(password, user.password)) {
      const payload = { email };
      const token = jwt.sign(payload, process.env.SECRET_SESSION, {
        expiresIn: "1h",
      });
      res.cookie("token", token, { httpOnly: true }).sendStatus(200);
    } else {
      return res.status(401).json({ errorMessage: "Password does not match!" });
    }
  } catch (error) {
    next(error);
  }
});

//  GET '/logout'
router.get("/logout", withAuth, function (req, res) {
  res.cookie("token", "deleted", { httpOnly: true }).sendStatus(204);
});

// GET '/me'
router.get("/me", withAuth, async function (req, res) {
  try {
    const user = await User.findOne({ email: req.email }).select("-password");
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
