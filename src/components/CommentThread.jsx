// Shows the comments under a post, oldest first.

import { useState, useEffect } from "react";
import { getCommentsByPostId } from "../services/comment.service";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

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

  function handleCreated(comment) {
    setComments((prev) => [...prev, comment]);
  }

  function handleUpdated(updated) {
    setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleDeleted(id) {
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

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
      <CommentItem
        key={c.id}
        comment={c}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    ));
  }

  return (
    <section>
      <h2>Comments</h2>
      {renderComments()}
      <CommentForm postId={postId} onCreated={handleCreated} />
    </section>
  );
}

export default CommentThread;
