const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  likePost,
  addComment,
  deleteComment,
  deletePost
} = require("../controllers/postController");

// routes
router.post("/create", createPost);
router.get("/all", getPosts);
router.put("/like/:postId", likePost);
router.put("/comment/:postId", addComment);
router.delete("/comment/:postId/:commentId", deleteComment);
router.delete("/:postId", deletePost);

module.exports = router;