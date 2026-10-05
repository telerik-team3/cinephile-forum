// Lets administrators find users by username, email or name.

import { useState, useEffect } from "react";
import { searchUsers } from "../services/profile.service";

function UserSearch() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    searchUsers(searchTerm)
      .then((result) => {
        if (active) {
          setUsers(result);
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
  }, [searchTerm]);

  function handleSubmit(e) {
    e.preventDefault();

    const term = query.trim();

    // The same term would not rerun the effect, so loading would never turn off.
    if (term === searchTerm) {
      return;
    }

    setLoading(true);
    setError(null);
    setSearchTerm(term);
  }

  function renderUsers() {
    if (loading) {
      return <p>Loading users</p>;
    }

    if (error) {
      return <p>{error}</p>;
    }

    if (users.length === 0) {
      return <p>No users found.</p>;
    }

    return (
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username ?? "-"}</td>
              <td>{[u.first_name, u.last_name].filter(Boolean).join(" ") || "-"}</td>
              <td>{u.email}</td>
              <td>{u.is_admin ? "Admin" : "User"}</td>
              <td>{u.is_blocked ? "Blocked" : "Active"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <section>
      <h2>Users</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Username, email or name"
        />
        <button type="submit">Search</button>
      </form>
      {renderUsers()}
    </section>
  );
}

export default UserSearch;
