import { useContext, useEffect, useState } from "react";
import { AppContext } from "../state/app.context";
import { getProfileById } from "../services/profile.service";
import { getPostsByAuthor } from "../services/post.service";
import { updateProfile } from "../services/profile.service";
import { uploadAvatar } from "../services/profile.service";

function UserProfile() {
  const { user } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getProfileById(user.id).then((data) => setProfile(data));
    getPostsByAuthor(user.id).then((data) => setPosts(data));
  }, [user.id]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [saveError, setSaveError] = useState("");

  // Fill the form with the saved profile each time editing starts.
  function startEditing() {
    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
    setPhone(profile.phone || "");
    setIsEditing(true);
  }


  const handleSave = async () => {
    setSaveError("");
    try {
      // The file name never changes, so a timestamp makes the browser load the new photo.
      const avatarUrl = avatarFile
        ? `${await uploadAvatar(user.id, avatarFile)}?t=${Date.now()}`
        : profile.avatar_url;
      const updatedProfile = await updateProfile(user.id, firstName, lastName, phone, avatarUrl);
      setProfile(updatedProfile);
      setAvatarFile(null);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message);
    }
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
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
              />
              {saveError && <p>Грешка при запазване: {saveError}</p>}
              <button onClick={handleSave}>Запази</button>
              <button onClick={() => setIsEditing(false)}>Отказ</button>
            </div>
          ) : (
            <div>
              <p>
                {profile.username} — {profile.first_name} {profile.last_name}
              </p>
              {profile.phone && <p>Телефон: {profile.phone}</p>}
              <button onClick={startEditing}>Редактирай</button>
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