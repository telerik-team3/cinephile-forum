import { useContext, useEffect, useState } from "react";
import { AppContext } from "../state/app.context";
import { getProfileById } from "../services/profile.service";
import { getPostsByAuthor } from "../services/post.service";
import { updateProfile } from "../services/profile.service";

function UserProfile() {
  const { user } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getProfileById(user.id).then((data) => setProfile(data));
    getPostsByAuthor(user.id).then((data) => setPosts(data));
  }, []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
    }
    }, [profile]);

  const handleSave = () => {
  updateProfile(user.id, firstName, lastName, phone).then((updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  });
  };


  return (
    <div>
      <h1>Профил</h1>
      {profile ? (
        <>
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt="Профилна снимка" width="100" />
          )}

          {isEditing ? (
            <div>
              <p>Потребителско име: {profile.username} (не може да се променя)</p>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Име"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Фамилия"
              />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Телефон"
              />
              <button onClick={handleSave}>Запази</button>
              <button onClick={() => setIsEditing(false)}>Отказ</button>
            </div>
          ) : (
            <div>
              <p>
                {profile.username} — {profile.first_name} {profile.last_name}
              </p>
              {profile.phone && <p>Телефон: {profile.phone}</p>}
              <button onClick={() => setIsEditing(true)}>Редактирай</button>
            </div>
          )}

          <h2>Моите постове</h2>
          <ul>
            {posts.map((post) => (
              <li key={post.id}>{post.title}</li>
            ))}
          </ul>
        </>
      ) : (
        <p>Зареждане...</p>
      )}
    </div>
  );
  }

export default UserProfile;