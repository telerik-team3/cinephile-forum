import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../state/app.context";
import { getUserCount } from "../services/profile.service";
import { getPostCount } from "../services/post.service";
import { getNewestPosts } from "../services/post.service";
import { getMostCommentedPosts } from "../services/post.service";

function Home() {
  const { user } = useContext(AppContext);
  const [userCount, setUserCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [newestPosts, setNewestPosts] = useState([]);
  const [mostCommentedPosts, setMostCommentedPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getUserCount()
        .then((count) => {
          if (active) setUserCount(count);
        })
        .catch((e) => {
          if (active) setError(e.message);
        }),

      getPostCount()
        .then((count) => {
          if (active) setPostCount(count);
        })
        .catch((e) => {
          if (active) setError(e.message);
        }),

      getNewestPosts()
        .then((posts) => {
          if (active) setNewestPosts(posts);
        })
        .catch((e) => {
          if (active) setError(e.message);
        }),

      getMostCommentedPosts()
        .then((posts) => {
          if (active) setMostCommentedPosts(posts);
        })
        .catch((e) => {
          if (active) setError(e.message);
        }),
    ]).then(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

   if (loading) {
    return <p>Loading</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Cinephile Forum</h1>
      <p>
        A forum for movie lovers. Write posts, comment, vote for your favourite
        topics and follow what other viewers are talking about.
      </p>

      <ul>
        <li>Publish your own posts about films</li>
        <li>Comment on and vote for other people's posts</li>
        <li>Follow the newest and most commented topics</li>
      </ul>

      <p>
        {userCount} users · {postCount} posts
      </p>

      <h2>Newest posts</h2>
      <ul>
        {newestPosts.map((post) => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>

      <h2>Most commented posts</h2>
      <ul>
        {mostCommentedPosts.map((post) => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`}>{post.title}</Link> (
            {post.comments[0].count} comments)
          </li>
        ))}
      </ul>

      {/* role="button" makes Pico draw these links as buttons. */}
      <p>
        {user ? (
          <Link to="/feed" role="button">
            Go to the forum
          </Link>
        ) : (
          <>
            <Link to="/login" role="button">
              Log in
            </Link>
            <Link to="/register" role="button">
              Register
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

export default Home;
