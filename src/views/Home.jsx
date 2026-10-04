import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../state/app.context";
import { getUserCount } from "../services/profile.service";
import { getPostCount } from "../services/post.service";

function Home() {
  const { user } = useContext(AppContext);
  const [userCount, setUserCount] = useState(0);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    getUserCount().then((count) => setUserCount(count));
    getPostCount().then((count) => setPostCount(count));
  }, []);

  return (
    <div>
      <h1>Cinephile Forum</h1>
      <p>
        Форум за филми — пишете постове, коментирайте, гласувайте за любимите
        си теми и следете какво обсъждат други зрители.
      </p>

      <ul>
        <li>Публикувайте собствени постове за филми</li>
        <li>Коментирайте и гласувайте за чужди постове</li>
        <li>Следете най-новите и най-коментираните теми</li>
      </ul>

      <p>
        {userCount} потребители · {postCount} постове
      </p>

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