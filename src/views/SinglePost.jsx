// Users must be able to view a single post

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPostById } from "../services/post.service";
import CommentThread from "../components/CommentThread";

function SinglePost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h1>{post.title}</h1>
      <p>
        by {post.author.username} on{" "}
        {new Date(post.created_at).toLocaleDateString()}
        {post.updated_at !== post.created_at && " (edited)"}
      </p>
      <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
      <CommentThread key={post.id} postId={post.id} />
    </div>
  );
}

export default SinglePost;
