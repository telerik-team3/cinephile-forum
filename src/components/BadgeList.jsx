import { useEffect, useState } from "react";
import { getBadgeStats } from "../services/badge.service";
import { getBadges } from "../lib/badges.lib";

// Shows the badges a user has earned (#48). The rules live in badges.lib.js.
function BadgeList({ userId }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getBadgeStats(userId)
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  if (error) {
    return <p>Could not load the badges: {error}</p>;
  }

  if (!stats) {
    return <p>Loading badges...</p>;
  }

  const badges = getBadges(stats);

  return (
    <section className="badge-card">
      <h2>Badges</h2>
      {badges.length === 0 ? (
        <p>No badges earned yet.</p>
      ) : (
        <ul className="badges">
          {badges.map((badge) => (
            <li key={badge.id} title={badge.description}>
              {badge.icon} {badge.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default BadgeList;