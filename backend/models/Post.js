const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  username: {
    type: String
  },
  text: {
    type: String
  },
  image: {
    type: String   // base64 image
  },
  likes: [
    {
      type: String   // store usernames
    }
  ],
  comments: [
    {
      username: String,
      text: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);