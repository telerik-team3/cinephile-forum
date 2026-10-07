// Lets administrators browse, search, sort and delete any post.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPosts, searchPosts, deletePost } from "../services/post.service";
import { getRating, sortPosts } from "../lib/posts.lib";

function PostModeration() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("newest");
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Only newest/oldest changes the database query. The other two sorts are
  // done in the browser, so switching between them does not reload posts.
  const oldest = sort === "oldest";

  useEffect(() => {
    let active = true;

    const request = searchTerm ? searchPosts(searchTerm, oldest) : getPosts(oldest);

    request
      .then((result) => {
        if (active) {
          setPosts(result);
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
  }, [searchTerm, oldest]);

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

  function handleDelete(post) {
    if (!window.confirm(`Delete "${post.title}"? Its comments and votes will be deleted too.`)) {
      return;
    }

    setDeleteError(null);

    deletePost(post.id)
      .then(() => {
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
      })
      .catch((e) => {
        setDeleteError(e.message);
      });
  }

  function renderPosts() {
    if (loading) {
      return <p>Loading posts</p>;
    }

    if (error) {
      return <p>{error}</p>;
    }

    if (posts.length === 0) {
      return <p>No posts found.</p>;
    }

    return (
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Created</th>
            <th>Comments</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortPosts(posts, sort).map((p) => (
            <tr key={p.id}>
              <td>
                <Link to={`/posts/${p.id}`}>{p.title}</Link>
              </td>
              <td>{p.author?.username ?? "-"}</td>
              <td>{new Date(p.created_at).toLocaleDateString()}</td>
              <td>{p.comments[0].count}</td>
              <td>{getRating(p)}</td>
              <td>
                <button onClick={() => handleDelete(p)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <section>
      <h2>Posts</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title or content"
        />
        <button type="submit">Search</button>
      </form>
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="most-comments">Most comments</option>
        <option value="most-liked">Most liked</option>
      </select>
      {deleteError && <p>{deleteError}</p>}
      {renderPosts()}
    </section>
  );
}

export default PostModeration;
