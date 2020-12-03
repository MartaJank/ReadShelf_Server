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
/* router.get("/profile/:userId", withAuth, (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      console.log("response:", user.email);
      //user.password = "*****";
      res.status(200).json(user);
    })
    .catch((err) => {
      res.json(err);
    });
}); */

router.patch("/profile/:userId/edit", withAuth, (req, res, next) => {
  let defaultPic;
  let { email, username, imageUrl } = req.body;

  User.findById(req.params.userId)
    .then((user) => {
      req.body.imageUrl
        ? (defaultPic = req.body.imageUrl)
        : (defaultPic = user.imageUrl);

      const updatedUser = { email, username, imageUrl: defaultPic };

      const pr = User.update({ _id: req.params.userId }, updatedUser, {
        new: true,
      });
      return pr;
    })
    .then(() => {
      res.json({
        message: `User with ${req.params.userId} is updated successfully.`,
      });
    })
    .catch((err) => {
      res.json(err);
    });
});

//BOOKS
router.get("/searchBooks/books", (req, res, next) => {
  Books.find()
    .then((data) => {
      console.log(data);
      res.json(data).status(200);
    })
    .catch((err) => {
      console.error(err);
      res.status(500);
    });
});

router.post("/books/:userId/push/:name", withAuth, (req, res, next) => {
  console.log("holaaaa", req.body.volumeInfo);
  const { name } = req.params;
  const { id } = req.body;
  const {
    title,
    authors,
    publisher,
    publishedDate,
    description,
    industryIdentifiers,
    readingModes,
    pageCount,
    printedPageCount,
    dimensions,
    printType,
    categories,
    averageRating,
    ratingsCount,
    maturityRating,
    allowAnonLogging,
    contentVersion,
    panelizationSummary,
    imageLinks,
    language,
    previewLink,
    infoLink,
    canonicalVolumeLink,
  } = req.body.volumeInfo;

  Books.create({
    id,
    title,
    authors,
    publisher,
    publishedDate,
    description,
    industryIdentifiers,
    readingModes,
    pageCount,
    printedPageCount,
    dimensions,
    printType,
    categories,
    averageRating,
    ratingsCount,
    maturityRating,
    allowAnonLogging,
    contentVersion,
    panelizationSummary,
    imageLinks,
    language,
    previewLink,
    infoLink,
    canonicalVolumeLink,
  })

    .then((data) => {
      User.findByIdAndUpdate(
        req.params.userId,
        { $push: { [name]: req.body } },
        { new: true }
      )
        .then((theResponse) => {
          res.json(theResponse).status(200);
        })
        .catch((err) => {
          res.json(err).status(500);
        });
      res.json(data).status(200);
    })
    .catch((err) => {
      console.error(err);
      res.status(500);
    });
});

module.exports = router;
