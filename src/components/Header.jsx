import { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../state/app.context";
import { logoutUser } from "../services/auth.service";

function Header() {
  const { user } = useContext(AppContext);

  return (
    <header>
      <h2>Cinephile Forum</h2>
      <nav>
        <Link to="/">Начало</Link>
        {user ? (
          <button onClick={logoutUser}>Изход</button>
        ) : (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
        <Link to="/feed">Постове</Link>
        <Link to="/create-post">Нов пост</Link>
        <Link to="/profile">Профил</Link>
        <Link to="/admin">Админ</Link>
      </nav>
    </header>
  );
}

export default Header;