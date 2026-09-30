// Shows the comments under a post, oldest first.

import { useState, useEffect } from "react";
import { getCommentsByPostId } from "../services/comment.service";

function CommentThread({ postId }) {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getCommentsByPostId(postId)
      .then((result) => {
        if (active) {
          setComments(result);
        }
      })
      .catch((e) => {
        if (active) {
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
  }, [postId]);

  function renderComments() {
    if (loading) {
      return <p>Loading comments</p>;
    }

    if (error) {
      return <p>{error}</p>;
    }

    if (comments.length === 0) {
      return <p>No comments yet.</p>;
    }

    return comments.map((c) => (
      <div key={c.id}>
        <p>
          {c.author.username} on {new Date(c.created_at).toLocaleString()}
          {c.updated_at !== c.created_at && " (edited)"}
        </p>
        <p style={{ whiteSpace: "pre-wrap" }}>{c.content}</p>
      </div>
    ));
  }

  return (
    <section>
      <h2>Comments</h2>
      {renderComments()}
    </section>
  );
}

export default CommentThread;
