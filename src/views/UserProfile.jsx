import { useContext, useEffect, useState } from "react";
import { AppContext } from "../state/app.context";
import { getProfileById } from "../services/profile.service";
import { getPostsByAuthor } from "../services/post.service";

function UserProfile() {
  const { user } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getProfileById(user.id).then((data) => setProfile(data));
    getPostsByAuthor(user.id).then((data) => setPosts(data));
  }, []);

  return (
    <div>
      <h1>Профил</h1>
      {profile ? (
        <>
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt="Профилна снимка" width="100" />
          )}
          <p>
            {profile.username} — {profile.first_name} {profile.last_name}
          </p>
          {profile.phone && <p>Телефон: {profile.phone}</p>}

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