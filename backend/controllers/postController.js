const Post = require("../models/Post");

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { userId, username, text, image } = req.body;

    // validation: at least text or image required
    if (!text && !image) {
      return res.status(400).json({ message: "Post cannot be empty" });
    }

    const newPost = new Post({
      userId,
      username,
      text,
      image
    });

    await newPost.save();
    res.status(201).json(newPost);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all posts (feed)
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Like or Unlike post
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { username } = req.body;

    const post = await Post.findById(postId);

    // toggle like
    if (post.likes.includes(username)) {
      post.likes = post.likes.filter(u => u !== username);
    } else {
      post.likes.push(username);
    }

    await post.save();
    res.status(200).json(post);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add comment to post
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { username, text } = req.body;

    const post = await Post.findById(postId);

    // push new comment
    post.comments.push({ username, text });

    await post.save();
    res.status(200).json(post);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { username } = req.body;

    const post = await Post.findById(postId);

    // find comment
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // allow only comment owner
    if (comment.username !== username) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // delete comment
    post.comments = post.comments.filter(
      (c) => c._id.toString() !== commentId
    );

    await post.save();

    res.status(200).json(post);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete post (owner only)
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { username } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.username !== username) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};