// Badges (#47). Each badge has a rule that looks at the numbers from
// get_badge_stats and decides whether the user has earned it.

const DAY = 24 * 60 * 60 * 1000;

// Without a date (an unknown user) no time has passed. new Date(null) would
// mean 1970 and award both time badges.
const daysSince = (date, now) => (date ? (now - new Date(date)) / DAY : 0);

export const BADGES = [
  {
    id: 'first-post',
    icon: '🎬',
    name: 'First post',
    description: 'Wrote their first post',
    earned: (stats) => stats.post_count >= 1,
  },
  {
    id: 'ten-posts',
    icon: '🎞️',
    name: 'Screenwriter',
    description: 'Wrote 10 posts',
    earned: (stats) => stats.post_count >= 10,
  },
  {
    id: 'first-comment',
    icon: '💬',
    name: 'First comment',
    description: 'Wrote their first comment',
    earned: (stats) => stats.comment_count >= 1,
  },
  {
    id: 'fifty-comments',
    icon: '🗣️',
    name: 'Critic',
    description: 'Wrote 50 comments',
    earned: (stats) => stats.comment_count >= 50,
  },
  {
    id: 'reputation-10',
    icon: '⭐',
    name: 'Crowd favourite',
    description: 'Reached 10 reputation points',
    earned: (stats) => stats.reputation >= 10,
  },
  {
    id: 'one-month',
    icon: '🍿',
    name: 'Regular viewer',
    description: 'Member of the forum for 30 days',
    earned: (stats, now) => daysSince(stats.member_since, now) >= 30,
  },
  {
    id: 'one-year',
    icon: '🏆',
    name: 'Veteran',
    description: 'Member of the forum for one year',
    earned: (stats, now) => daysSince(stats.member_since, now) >= 365,
  },
];

export function getBadges(stats, now = new Date()) {
  if (!stats) {
    return [];
  }

  return BADGES.filter((badge) => badge.earned(stats, now));
}     