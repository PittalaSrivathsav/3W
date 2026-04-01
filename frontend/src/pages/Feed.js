import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles.css";

// Helper: get initials from username
function getInitials(name = "") {
  return name.slice(0, 2).toUpperCase() || "?";
}

// Helper: format relative time (simple)
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Feed() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [commentText, setCommentText] = useState({});
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const fetchPosts = async () => {
    const res = await axios.get("https://threew-backend-fhns.onrender.com/api/posts/all");
    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImage(reader.result);
      setPreviewKey((k) => k + 1);
    };
  };

  const handlePost = async () => {
    if (!text.trim() && !image) {
      alert("Post cannot be empty");
      return;
    }
    await axios.post("https://threew-backend-fhns.onrender.com/api/posts/create", {
      userId: user._id,
      username: user.username,
      text,
      image,
    });
    setText("");
    setImage("");
    fetchPosts();
  };

  const handleLike = async (postId) => {
    await axios.put(`https://threew-backend-fhns.onrender.com/api/posts/like/${postId}`, {
      username: user.username,
    });
    fetchPosts();
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    await axios.delete(`https://threew-backend-fhns.onrender.com/api/posts/${postId}`, {
      data: { username: user.username },
    });
    fetchPosts();
  };

  const handleComment = async (postId) => {
    const ct = commentText[postId] || "";
    if (!ct.trim()) {
      alert("Comment cannot be empty");
      return;
    }
    await axios.put(`https://threew-backend-fhns.onrender.com/api/posts/comment/${postId}`, {
      username: user.username,
      text: ct,
    });
    setCommentText((prev) => ({ ...prev, [postId]: "" }));
    fetchPosts();
  };

  const handleDeleteComment = async (postId, commentId) => {
    await axios.delete(
      `https://threew-backend-fhns.onrender.com/api/posts/comment/${postId}/${commentId}`,
      { data: { username: user.username } }
    );
    fetchPosts();
  };

  return (
    <>
      {/* Sticky Navbar */}
      <nav className="navbar">
        <span className="navbar-brand">✦ 3W</span>
        <div className="navbar-user">
          <div className="avatar">{getInitials(user?.username)}</div>
          <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {user?.username}
          </span>
          <button className="logout-btn" onClick={handleLogout} title="Log out">
            ⎋ Logout
          </button>
        </div>
      </nav>

      <div className="container">
        {/* Create Post */}
        <div className="card create-post-card">
          <div className="create-post-top">
            <div className="avatar">{getInitials(user?.username)}</div>
            <textarea
              placeholder={`What's on your mind, ${user?.username?.split(" ")[0] || "friend"}?`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) handlePost();
              }}
            />
          </div>

          {/* Preview */}
          {image && (
            <img
              key={previewKey}
              src={image}
              alt="preview"
              className="preview-img"
            />
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <label className="upload-btn">
              📸 Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
            </label>

            <button className="post-btn" style={{ width: "auto" }} onClick={handlePost}>
              Share Post
            </button>
          </div>
        </div>

        {/* Feed Heading */}
        <div className="feed-heading">Recent Posts</div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => {
            const isLiked = post.likes.includes(user.username);
            const commentOpen = activeCommentPost === post._id;

            return (
              <div key={post._id} className="card">
                {/* Post Header */}
                <div className="post-header">
                  <div className="avatar">{getInitials(post.username)}</div>
                  <div className="post-meta">
                    <span className="post-username">{post.username}</span>
                    {post.createdAt && (
                      <span className="post-time">{timeAgo(post.createdAt)}</span>
                    )}
                  </div>
                  {post.username === user.username && (
                    <button
                      className="delete-post-btn"
                      onClick={() => handleDeletePost(post._id)}
                      title="Delete post"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                {/* Post Text */}
                {post.text && <p className="post-text">{post.text}</p>}

                {/* Post Image */}
                {post.image && (
                  <img src={post.image} alt="" className="post-image" />
                )}

                {/* Divider */}
                <div className="post-divider" />

                {/* Actions */}
                <div className="actions">
                  <button
                    className={`action-btn ${isLiked ? "liked" : ""}`}
                    onClick={() => handleLike(post._id)}
                  >
                    <span className="emoji">{isLiked ? "❤️" : "🤍"}</span>
                    <span className="action-count">{post.likes.length}</span>
                    <span style={{ color: "inherit" }}>
                      {post.likes.length === 1 ? "Like" : "Likes"}
                    </span>
                  </button>

                  <button
                    className={`action-btn ${commentOpen ? "comment-active" : ""}`}
                    onClick={() =>
                      setActiveCommentPost(commentOpen ? null : post._id)
                    }
                  >
                    <span className="emoji">💬</span>
                    <span className="action-count">{post.comments.length}</span>
                    <span style={{ color: "inherit" }}>
                      {post.comments.length === 1 ? "Comment" : "Comments"}
                    </span>
                  </button>
                </div>

                {/* Comment Box */}
                {commentOpen && (
                  <div className="comment-section">
                    <div className="comment-input-row">
                      <div className="avatar">{getInitials(user?.username)}</div>
                      <input
                        placeholder="Write a comment..."
                        value={commentText[post._id] || ""}
                        onChange={(e) =>
                          setCommentText((prev) => ({
                            ...prev,
                            [post._id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleComment(post._id);
                        }}
                      />
                      <button
                        className="comment-btn"
                        onClick={() => handleComment(post._id)}
                      >
                        Send
                      </button>
                    </div>

                    {/* Comments List */}
                    {post.comments.length > 0 && (
                      <div className="comments-list">
                        {post.comments.map((c) => (
                          <div key={c._id} className="comment-item">
                            <div className="avatar">{getInitials(c.username)}</div>
                            <div className="comment-content">
                              <span className="comment-author">{c.username}</span>
                              <p className="comment-text">{c.text}</p>
                            </div>
                            {c.username === user.username && (
                              <button
                                className="delete-comment-btn"
                                onClick={() =>
                                  handleDeleteComment(post._id, c._id)
                                }
                                title="Delete comment"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default Feed;
