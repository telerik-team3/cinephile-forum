import { useContext, useEffect, useState } from "react";
import { AppContext } from "../state/app.context";
import {
  createVote,
  deleteVote,
  getCurrentVote,
  getVoteScore,
  updateVote,
} from "../services/vote.service";

function VoteControl({ postId }) {
  const [score, setScore] = useState(0);
  const [vote, setVote] = useState(0);
  const { user } = useContext(AppContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getCurrentVote(postId, user.id)
      .then((result) => {
        if (active) {
          setVote(result);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    getVoteScore(postId)
      .then((result) => {
        if (active) {
          setScore(result);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => (active = false);
  }, [postId, user.id]);

  function handleVote(voteClick) {
    if (vote === 0) {
      createVote(postId, user.id, voteClick)
        .then((r) => {
          setVote(r.rating);
          return getVoteScore(postId).then((res) => setScore(res));
        })
        .catch((e) => setError(e.message));
    } else if (vote === voteClick) {
      deleteVote(postId, user.id)
        .then(() => {
          setVote(0);
          return getVoteScore(postId).then((res) => setScore(res));
        })
        .catch((e) => setError(e.message));
    } else {
      updateVote(postId, user.id, voteClick)
        .then((r) => {
          setVote(r.rating);
          return getVoteScore(postId).then((res) => setScore(res));
        })
        .catch((e) => setError(e.message));
    }
  }

  return (
    <div>
        Rating {" "}
        {score} {" "}
      <button onClick={() => handleVote(1)}>
        {" "}
        {vote === 1 ? "Liked" : "Like"}
      </button>
      <button onClick={() => handleVote(-1)}>
        {" "}
        {vote === -1 ? "Disliked" : "Dislike"}
      </button>
      {error ? <p> {error} </p>: null}
    </div>
  );
}

export default VoteControl;
