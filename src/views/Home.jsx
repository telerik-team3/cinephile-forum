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

  useEffect(() => {
    getUserCount().then((count) => setUserCount(count));
    getPostCount().then((count) => setPostCount(count));
    getNewestPosts().then((posts) => setNewestPosts(posts));
    getMostCommentedPosts().then((posts) => setMostCommentedPosts(posts));
    }, []);      
    
  return (
    <div>
      <h1>Cinephile Forum</h1>
      <p>
        Форум за филми. Пишете постове, коментирайте, гласувайте за любимите
        си теми и следете какво обсъждат други зрители.
      </p>

      <ul>
        <li>Публикувайте собствени постове за филми</li>
        <li>Коментирайте и гласувайте за чужди постове</li>
        <li>Следете най- новите и най- коментираните теми</li>
      </ul>

      <p>
        {userCount} потребители · {postCount} постове
      </p>


      <h2>Най- нови постове</h2>
      <ul>
        {newestPosts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>


      <h2>Най- коментирани постове</h2>
      <ul>
        {mostCommentedPosts.map((post) => (
          <li key={post.id}>
            {post.title} ({post.comments[0].count} коментара)
          </li>
        ))}
      </ul>


      {user ? (
        <Link to="/feed">Към форума</Link>
      ) : (
        <>
          <Link to="/login">Вход</Link>
          <Link to="/register">Регистрация</Link>
        </>
      )}
    </div>
  );
}

export default Home;