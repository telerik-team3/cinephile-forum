// Users must be able to browse posts created by other users with an option to sort and filter them

import { useState, useEffect } from "react";
import { getPosts, searchPosts } from "../services/post.service";
import { Link } from "react-router-dom";
import { getRating, sortPosts } from "../lib/posts.lib";



 

function Feed() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState("newest");

  

  useEffect(() => {
    let active = true;
    if (searchTerm) {
      searchPosts(searchTerm, sort === "oldest")
      .then((res) => {
        if (active) {
          setPosts(res)
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message)
        };
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        };
      });

    } else {
      getPosts(sort === "oldest")
      .then((result) => {
        if (active) {
          setPosts(result)
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message)
        };
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        };
      });
    }
    return () => active = false;
  }, [searchTerm, sort]);

 

  function renderPosts(posts) {
    return posts.map((p) => (
      <div key={p.id}>
        <p>
          <Link to={`/posts/${p.id}`}>{p.title}</Link> by {p.author.username}{" "}
          {new Date(p.created_at).toLocaleDateString()}{" "}
          {p.comments[0].count} comment(s) {" "}
          Rating {getRating(p)} 
        </p>
        <p>{p.content.slice(0, 32)}</p>
      </div>
    ));
  }


  function handleSearch(e) {
    e.preventDefault();

    searchPosts(searchTerm, sort === "oldest")
    .then((res) => setPosts(res))
    .catch((e) => alert(e.message));
  }

  return (
    <div>
      <h1>Posts</h1>
      <form onSubmit={handleSearch}>
        <input type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search posts"/>
      </form>
      <select value={sort} onChange={e => setSort(e.target.value)}>
        <option value={"newest"}>Newest</option>
        <option value={"oldest"}>Oldest</option>
        <option value={"most-comments"}>Most comments</option>
        <option value={"most-liked"}>Most liked</option>
      </select>
      {loading ? <p>Loading</p> : error ? <p>{error}</p> : posts.length > 0 ? renderPosts(sortPosts(posts, sort)) : <p>No posts found</p>}
    </div>
  );
}

export default Feed;


