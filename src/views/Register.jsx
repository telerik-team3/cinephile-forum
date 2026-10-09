import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth.service";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    if (firstName.trim().length < 4 || firstName.trim().length > 32) {
      alert("First name must be between 4 and 32 characters");
      return;
    }
    if (lastName.trim().length < 4 || lastName.trim().length > 32) {
      alert("Last name must be between 4 and 32 characters");
      return;
    }

    registerUser(email, password, username, firstName, lastName)
      .then(() => navigate("/feed"))
      .catch((error) => alert(error.message));
  }

  return (
    <div>
      <h1>Регистрация</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Имейл
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Парола
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          Потребителско име
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Име
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>
        <label>
          Фамилия
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>
        <button>Регистрация</button>
      </form>
    </div>
  );
}

export default Register;