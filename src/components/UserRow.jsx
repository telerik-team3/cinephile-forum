// One user in the admin search results, with block and admin controls.

import { useState } from "react";
import { setUserBlocked, setUserAdmin } from "../services/profile.service";

const REFUSED_MESSAGE = "The change was refused. You may no longer be an administrator.";

function UserRow({ profile, isSelf, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const label = profile.username ?? profile.email;

  function runChange(question, change) {
    if (!window.confirm(question)) {
      return;
    }

    setError(null);
    setSaving(true);

    change()
      .then((updated) => {
        onUpdated(updated);
      })
      .catch((err) => {
        // PGRST116 means no row was changed: RLS refused the update, so this
        // account most likely lost its admin rights after the page loaded.
        setError(err.code === "PGRST116" ? REFUSED_MESSAGE : err.message);
      })
      .finally(() => {
        setSaving(false);
      });
  }

  function handleBlock() {
    const blocked = !profile.is_blocked;

    runChange(
      blocked ? `Block ${label}? They will not be able to post, comment or vote.` : `Unblock ${label}?`,
      () => setUserBlocked(profile.id, blocked)
    );
  }

  function handleAdmin() {
    const admin = !profile.is_admin;

    runChange(
      admin ? `Make ${label} an administrator?` : `Remove administrator rights from ${label}?`,
      () => setUserAdmin(profile.id, admin)
    );
  }

  return (
    <tr>
      <td>{profile.username ?? "-"}</td>
      <td>{[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "-"}</td>
      <td>{profile.email}</td>
      <td>{profile.is_admin ? "Admin" : "User"}</td>
      <td>{profile.is_blocked ? "Blocked" : "Active"}</td>
      <td>
        {isSelf ? (
          "You"
        ) : (
          <>
            <button onClick={handleBlock} disabled={saving}>
              {profile.is_blocked ? "Unblock" : "Block"}
            </button>
            <button onClick={handleAdmin} disabled={saving}>
              {profile.is_admin ? "Remove admin" : "Make admin"}
            </button>
          </>
        )}
        {error && <p>{error}</p>}
      </td>
    </tr>
  );
}

export default UserRow;
