// One comment in the thread, with edit and delete controls.

import { useState, useContext } from "react";
import { AppContext } from "../state/app.context";
import { updateComment, deleteComment } from "../services/comment.service";

const MAX_LENGTH = 8192;
const BLOCKED_MESSAGE = "Your account is blocked, so you cannot edit comments.";
const DELETE_REFUSED_MESSAGE = "This comment could not be deleted.";

function CommentItem({ comment, onUpdated, onDeleted }) {
  const { user, userData } = useContext(AppContext);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = comment.author_id === user.id && !userData?.is_blocked;
  const canEdit = isAuthor;
  const canDelete = isAuthor || userData?.is_admin;

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

  function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setError(null);
    setDeleting(true);

    deleteComment(comment.id)
      .then(() => {
        onDeleted(comment.id);
      })
      .catch((err) => {
        // PGRST116 means no row was deleted: RLS refused it (the user was
        // blocked after the page loaded) or the comment is already gone.
        setError(err.code === "PGRST116" ? DELETE_REFUSED_MESSAGE : err.message);
        setDeleting(false);
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
          {canEdit && (
            <button onClick={startEditing} disabled={deleting}>
              Edit
            </button>
          )}
          {canDelete && (
            <button onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting" : "Delete"}
            </button>
          )}
          {error && <p>{error}</p>}
        </>
      )}
    </div>
  );
}

export default CommentItem;
