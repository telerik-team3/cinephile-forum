// Form for writing a new comment under a post.

import { useState, useContext } from "react";
import { AppContext } from "../state/app.context";
import { createComment } from "../services/comment.service";

const MAX_LENGTH = 8192;
const BLOCKED_MESSAGE = "Your account is blocked, so you cannot comment.";

function CommentForm({ postId, onCreated }) {
  const { user, userData } = useContext(AppContext);
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (userData?.is_blocked) {
    return <p>{BLOCKED_MESSAGE}</p>;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const text = content.trim();

    if (text.length < 1 || text.length > MAX_LENGTH) {
      setError(`A comment must be between 1 and ${MAX_LENGTH} characters`);
      return;
    }

    setError(null);
    setSubmitting(true);

    createComment(postId, user.id, text)
      .then((comment) => {
        setContent("");
        onCreated(comment);
      })
      .catch((err) => {
        // 42501 is the database refusing the insert, which for a signed-in
        // user means they were blocked after the page loaded.
        setError(err.code === "42501" ? BLOCKED_MESSAGE : err.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Add a comment
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={submitting}
        />
        {content.length}/{MAX_LENGTH}
      </label>
      {error && <p>{error}</p>}
      <button disabled={submitting}>
        {submitting ? "Posting" : "Post comment"}
      </button>
    </form>
  );
}

export default CommentForm;
