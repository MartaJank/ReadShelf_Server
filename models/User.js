const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    imageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/martajank/image/upload/v1597920242/avatar_go6uwv.png",
    },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isClubCreator: { type: Boolean, default: false },
    paperBooksAPI: [],
    eBooksAPI: [],
    audiobooksAPI: [],
    pendingBooksAPI: [],
    progressBooksAPI: [],
    readBooksAPI: [],
    bookClubs: [{ type: Schema.Types.ObjectId, ref: "Club" }],
    createdBookClubs: [{ type: Schema.Types.ObjectId, ref: "Club" }],
    joinedBookClubs: [{ type: Schema.Types.ObjectId, ref: "Club" }],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
