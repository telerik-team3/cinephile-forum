// Lets administrators find users by username, email or name.

import { useState, useEffect, useContext } from "react";
import { AppContext } from "../state/app.context";
import { searchUsers } from "../services/profile.service";
import UserRow from "./UserRow";

function UserSearch() {
  const { user } = useContext(AppContext);
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

  function handleUpdated(updated) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <UserRow
              key={u.id}
              profile={u}
              isSelf={u.id === user.id}
              onUpdated={handleUpdated}
            />
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
