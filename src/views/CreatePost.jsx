// Users must be able to create a new post with at least a title and content

import { useState, useContext } from "react";
import { AppContext } from "../state/app.context";
import { createPost } from "../services/post.service";
import { useNavigate } from "react-router-dom";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AppContext);

  function handleSubmit(e) {
    e.preventDefault();
    if (title.length < 16 || title.length > 64) {
      alert("Title must be between 16 and 64 characters");
      return;
    }
    if (content.length < 32 || content.length > 8192) {
      alert("Your post should be between 32 and 8192 characters");
      return;
    }

    createPost(user.id, title, content)
      .then((result) => navigate(`/posts/${result.id}`))
      .catch((error) => alert(error.message));
  }

  return (
    <div>
      <h1>New post</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          {title.length}/64
        </label>
        <label>
          Content
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {content.length}/8192
        </label>
        <button>Submit</button>
      </form>
    </div>
  );
}

export default CreatePost;
