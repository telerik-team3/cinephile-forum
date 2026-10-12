import { useContext, useEffect, useState } from "react";
import { AppContext } from "../state/app.context";
import { getProfileById } from "../services/profile.service";
import { getPostsByAuthor } from "../services/post.service";
import { updateProfile } from "../services/profile.service";
import { uploadAvatar } from "../services/profile.service";
import { useParams } from "react-router-dom";
import { getRating, sortPosts } from "../lib/posts.lib";
import { Link } from "react-router-dom";
import { getCommentsByAuthor } from "../services/comment.service";
import BadgeList from "../components/BadgeList";
import { getUserReputation } from "../services/profile.service";

function UserProfile() {
  const { user } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();
  const profileID = id ?? user.id;
  const [comments, setComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("newest");
  const [sortComments, setSortComments] = useState("newest");
  const [reputation, setReputation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      getProfileById(profileID)
        .then((data) => {
          if (active) setProfile(data);
        })
        .catch((e) => {
          if (active) setError(e.message);
        }),

      getPostsByAuthor(profileID)
        .then((data) => {
          if (active) setPosts(data);
        })
        .catch((e) => {
          if (active) setError(e.message);
        }),

      getCommentsByAuthor(profileID)
        .then((data) => {
          if (active) setComments(data);
        })
        .catch((e) => {
          if (active) setError(e.message);
        }),

      getUserReputation(profileID)
        .then((data) => {
          if (active) setReputation(data);
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
  }, [profileID]);



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

    if (firstName.trim().length < 4 || firstName.trim().length > 32) {
      setSaveError("First name must be between 4 and 32 characters");
      return;
    }
    if (lastName.trim().length < 4 || lastName.trim().length > 32) {
      setSaveError("Last name must be between 4 and 32 characters");
      return;
    }
    try {
      // The file name never changes, so a timestamp makes the browser load the new photo.
      const avatarUrl = avatarFile
        ? `${await uploadAvatar(user.id, avatarFile)}?t=${Date.now()}`
        : profile.avatar_url;
      const updatedProfile = await updateProfile(
        user.id,
        firstName,
        lastName,
        phone,
        avatarUrl,
      );
      setProfile(updatedProfile);
      setAvatarFile(null);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message);
    }
  };

  const filtered = posts.filter((p) => {
    return (
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sorted =
    sort === "oldest" ? filtered.slice().reverse() : sortPosts(filtered, sort);

  const sortedComments =
    sortComments === "oldest" ? comments.slice().reverse() : comments;


      if (loading) {
    return <p>Loading</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Profile</h1>
      {profile ? (
        <>
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={`${profile.username}'s profile picture`}
              width="100"
            />
          )}

          {isEditing ? (
            <div>
              <p>Username: {profile.username} (cannot be changed)</p>
              <label>
                First name
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </label>

              <label>
                Last name
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </label>

              <label>
                Phone
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                />
              </label>

              <label>
                Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                />
              </label>
              {saveError && <p>Error: {saveError}</p>}
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          ) : (
            <div>
              <p>
                {profile.username} — {profile.first_name} {profile.last_name}
              </p>
              {profile.phone && <p>Phone: {profile.phone}</p>}
              {profileID === user.id && (
                <button onClick={startEditing}>Edit</button>
              )}
            </div>
          )}
          <BadgeList userId={profileID} />
          <p>Reputation: {reputation}</p>
          {profileID === user.id ? (
            <h2>My posts</h2>
          ) : (
            <h2>{profile.username}'s posts</h2>
          )}
          <label>
            Search posts
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
            />
          </label>
          <label>
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value={"newest"}>Newest</option>
              <option value={"oldest"}>Oldest</option>
              <option value={"most-comments"}>Most comments</option>
              <option value={"most-liked"}>Most liked</option>
            </select>
          </label>
          {sorted.length > 0 ? (
            <ul>
              {sorted.map((post) => (
                <li key={post.id}>
                  <Link to={`/posts/${post.id}`}>{post.title}</Link>{" "}
                  {post.comments[0].count} comment(s) , Rating {getRating(post)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts found</p>
          )}

          {profileID === user.id ? (
            <h2>My comments</h2>
          ) : (
            <h2>{profile.username}'s comments</h2>
          )}
          <label>
            Sort comments by
            <select
              value={sortComments}
              onChange={(e) => setSortComments(e.target.value)}
            >
              <option value={"newest"}>Newest</option>
              <option value={"oldest"}>Oldest</option>
            </select>
          </label>
          {sortedComments.length > 0 ? (
            <ul>
              {sortedComments.map((c) => (
                <li key={c.id}>
                  <Link to={`/posts/${c.post.id}`}>{c.post.title}</Link>{" "}
                  {c.content} {new Date(c.created_at).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No comments found</p>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default UserProfile;
