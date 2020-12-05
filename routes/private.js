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
      console.log("la imagen que subo", req.body.imageUrl);
      console.log("la imagen actual:", user.imageUrl);
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
router.get("/user/info/:userId", (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((data) => {
      console.log(data);
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500);
    });
});

//Create a route to move books form one list to another

//CLUBS
router.get("/book-clubs", (req, res, next) => {
  Club.find()
    .then((allClubs) => {
      res.json(allClubs);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/book-clubs/:userId/joined", withAuth, (req, res, next) => {
  User.findById(req.params.userId)
    .populate("joinedBookClubs")
    .then((user) => {
      res.json(user.joinedBookClubs);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/book-clubs/:userId/created", withAuth, (req, res, next) => {
  User.findById(req.params.userId)
    .populate("createdBookClubs")
    .then((user) => {
      res.json(user.createdBookClubs);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/book-clubs/:clubId", withAuth, (req, res, next) => {
  Club.findById(req.params.clubId)
    .then((theClub) => {
      res.json(theClub);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.get("/book-clubs/created/one/:clubId", withAuth, (req, res, next) => {
  Club.findById(req.params.clubId)
    .then((response) => {
      res.json(response);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/book-clubs/:userId/add", withAuth, (req, res, next) => {
  console.log(req.body.title);
  Club.create({
    title: req.body.title,
    description: req.body.description,
    currentBookTitle: req.body.currentBookTitle,
    meetingDate: req.body.meetingDate,
    meetingHour: req.body.meetingHour,
    meetingLink: req.body.meetingLink,
    creator: req.params.userId,
  })
    .then((response) => {
      console.log("response", response);
      User.findByIdAndUpdate(
        req.params.userId,
        {
          $push: { createdBookClubs: response._id },
          $set: { isClubCreator: true },
        },
        { new: true }
      )
        .then((theResponse) => {
          req.params.userId = theResponse;
          res.json(theResponse);
        })
        .catch((err) => {
          res.json(err);
        });
    })
    .catch((err) => {
      res.json(err);
    });
});

router.patch("/book-clubs/:userId/edit/:clubId", withAuth, (req, res, next) => {
  let defaultPic;
  let {
    title,
    description,
    currentBookTitle,
    meetingDate,
    meetingHour,
    meetingLink,
  } = req.body;
  User.findById(req.params.userId).then(async (user) => {
    const userClubs = user.createdBookClubs;
    if (!userClubs.includes(req.params.clubId)) {
      next(createError(401));
    } else {
      return Club.findById(req.params.clubId)
        .then((club) => {
          console.log("la imagen que subo", req.body.imageUrl);
          console.log("la imagen actual:", club.imageUrl);
          req.body.imageUrl
            ? (defaultPic = req.body.imageUrl)
            : (defaultPic = club.imageUrl);

          const updatedClub = {
            title,
            description,
            currentBookTitle,
            meetingDate,
            meetingHour,
            meetingLink,
            imageUrl: defaultPic,
          };

          const pr = Club.update({ _id: req.params.clubId }, updatedClub, {
            new: true,
          });
          return pr;
        })

        .then(() => {
          res.json({
            message: `Club with ${req.params.clubId} is updated successfully.`,
          });
        })
        .catch((err) => {
          res.json(err);
        });
    }
  });
});

module.exports = router;
