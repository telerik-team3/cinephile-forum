import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../state/app.context";
import { logoutUser } from "../services/auth.service";

function Header() {
  const { user, userData } = useContext(AppContext);
  // index.html has already applied the saved theme, so start from it.
  const [theme, setTheme] = useState(document.documentElement.dataset.theme);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";

    // Pico reads data-theme on <html> and switches every colour.
    document.documentElement.dataset.theme = next;
    setTheme(next);

    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked (private window). The theme still changes for this visit.
    }
  }

  return (
    <header>
      <h2>Cinephile Forum</h2>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/feed">Posts</Link>
        <Link to="/create-post">New post</Link>
        <Link to="/profile">Profile</Link>
        {userData?.is_admin && <Link to="/admin">Admin</Link>}
        {user ? (
          <button onClick={logoutUser}>Log out</button>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Light theme" : "Dark theme"}
          title={theme === "dark" ? "Light theme" : "Dark theme"}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </nav>
    </header>
  );
}

export default Header;
