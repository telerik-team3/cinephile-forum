import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <h2>Cinephile Forum</h2>
      <nav>
        <Link to="/">Начало</Link>
        <Link to="/login">Вход</Link>
        <Link to="/register">Регистрация</Link>
        <Link to="/feed">Постове</Link>
        <Link to="/create-post">Нов пост</Link>
        <Link to="/profile">Профил</Link>
        <Link to="/admin">Админ</Link>
      </nav>
    </header>
  );
}

export default Header;