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
      console.log("response:", user.email);
      //user.password = "*****";
      res.status(200).json(user);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.patch("/profile/:userId/edit", withAuth, (req, res, next) => {
  let defaultPic;
  let { email, username } = req.body;

  User.findById(req.params.userId)
    .then((user) => {
        console.log('la imagen que subo', req.body.imageUrl);
        console.log('la imagen actual:', user.imageUrl)
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

router.delete("/books/:userId/pull/:name/:bookId", (req, res, next) => {
  //const { id } = req.body;
  const { name, bookId } = req.params;
  console.log(req.params.bookId, ": book Id");
  User.findByIdAndUpdate(
    req.params.userId,
    { $pull: { [name]: { id: bookId } } },
    { new: true }
  )
    .then((theResponse) => {
      console.log("the Response from delete from list", theResponse);
      res.json(theResponse);
    })
    .catch((err) => {
      res.json(err);
    });
});

//LISTS
router.get("/user/info/:userId", withAuth, (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((data) => {
      console.log(data);
      res.json(data).status(200);
    })
    .catch((err) => {
      console.error(err);
      res.status(500);
    });
});

//Create a route to move books form one list to another

module.exports = router;
