// Users must be able to browse posts created by other users with an option to sort and filter them

import { useState, useEffect } from "react";
import { getPosts } from "../services/post.service";
import { Link } from "react-router-dom";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts()
      .then((result) => setPosts(result))
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function renderPosts(posts) {
    return posts.map((p) => (
      <div key={p.id}>
        <p>
          <Link to={`/posts/${p.id}`}>{p.title}</Link> by {p.author.username}{" "}
          {new Date(p.created_at).toLocaleDateString()}{" "}
        </p>
        <p>{p.content.slice(0, 32)}</p>
      </div>
    ));
  }

  return (
    <div>
      <h1>Posts</h1>
      {loading ? <p>Loading</p> : error ? <p>{error}</p> : renderPosts(posts)}
    </div>
  );
}

export default Feed;
