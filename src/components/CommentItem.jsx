// One comment in the thread, with an edit mode for its author.

import { useState, useContext } from "react";
import { AppContext } from "../state/app.context";
import { updateComment } from "../services/comment.service";

const MAX_LENGTH = 8192;
const BLOCKED_MESSAGE = "Your account is blocked, so you cannot edit comments.";

function CommentItem({ comment, onUpdated }) {
  const { user, userData } = useContext(AppContext);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const canEdit = comment.author_id === user.id && !userData?.is_blocked;

  function startEditing() {
    setDraft(comment.content);
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setError(null);
  }

  function handleSave(e) {
    e.preventDefault();
    const text = draft.trim();

    if (text.length < 1 || text.length > MAX_LENGTH) {
      setError(`A comment must be between 1 and ${MAX_LENGTH} characters`);
      return;
    }

    // Nothing changed, so skip the request and keep the comment unmarked.
    if (text === comment.content) {
      setEditing(false);
      return;
    }

    setError(null);
    setSaving(true);

    updateComment(comment.id, text)
      .then((updated) => {
        onUpdated(updated);
        setEditing(false);
      })
      .catch((err) => {
        // 42501 is the database refusing the update, which for the author
        // means they were blocked after the page loaded.
        setError(err.code === "42501" ? BLOCKED_MESSAGE : err.message);
      })
      .finally(() => {
        setSaving(false);
      });
  }

  return (
    <div>
      <p>
        {comment.author.username} on {new Date(comment.created_at).toLocaleString()}
        {comment.updated_at !== comment.created_at && " (edited)"}
      </p>
      {editing ? (
        <form onSubmit={handleSave}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={saving}
          />
          {draft.length}/{MAX_LENGTH}
          {error && <p>{error}</p>}
          <button disabled={saving}>{saving ? "Saving" : "Save"}</button>
          <button type="button" onClick={cancelEditing} disabled={saving}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <p style={{ whiteSpace: "pre-wrap" }}>{comment.content}</p>
          {canEdit && <button onClick={startEditing}>Edit</button>}
        </>
      )}
    </div>
  );
}

export default CommentItem;
