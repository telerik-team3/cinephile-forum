// Users must be able to view a single post

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deletePost, getPostById, updatePost } from "../services/post.service";
import CommentThread from "../components/CommentThread";
import { AppContext } from "../state/app.context";
import VoteControl from "../components/VoteControl";

function SinglePost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, userData } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    let active = true;

    getPostById(id)
      .then((result) => {
        if (active) {
          setPost(result);
        }
      })
      .catch((e) => {
        // 22P02 is Postgres rejecting a malformed id, e.g. /posts/abc.
        // Treat it like any other missing post.
        if (active && e.code !== "22P02") {
          setError(e.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <p>Loading</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!post) {
    return <p>Post not found.</p>;
  }

  function handleDelete() {
    const postDeletion = window.confirm(
      "Are you sure you want to delete this post ?",
    );

    if (!postDeletion) {
      return;
    }
    deletePost(id)
      .then(() => navigate(`/feed`))
      .catch((error) => alert(error.message));
  }

  function handleEdit() {
    setTitle(post.title);
    setContent(post.content);
    setIsEditing(true);
  }

  function savePost(e) {
    e.preventDefault();
    if (title.length < 16 || title.length > 64) {
      alert("Title must be between 16 and 64 characters");
      return;
    }
    if (content.length < 32 || content.length > 8192) {
      alert("Your post should be between 32 and 8192 characters");
      return;
    }
    updatePost(id, title, content)
      .then((result) => {
        setPost(result);
        setIsEditing(false);
      })
      .catch((error) => alert(error.message));
  }

  return (
    <div>
      {isEditing ? (
        <form onSubmit={savePost}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          {title.length}/64
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {content.length}/8192
          <button> Save </button>
          <button type="button" onClick={() => setIsEditing(false)}>
            {" "}
            Cancel{" "}
          </button>
        </form>
      ) : (
        <div>
          <article>
            <h1>{post.title}</h1>
            <small>
              by {post.author.username} on{" "}
              {new Date(post.created_at).toLocaleDateString()}
              {post.updated_at !== post.created_at && " (edited)"}
            </small>
            <VoteControl postId={post.id}/>
            <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
            {((post.author_id === user.id && !userData?.is_blocked)|| userData?.is_admin) && (
              <button onClick={handleDelete}> Delete post </button>
            )}{" "}
            {(post.author_id === user.id && !userData?.is_blocked) && (
              <button onClick={handleEdit}> Edit post </button>
            )}
          </article>
          <CommentThread key={post.id} postId={post.id} />{" "}
        </div>
      )}
    </div>
  );
}

export default SinglePost;
