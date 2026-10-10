// Badges (#47). Each badge has a rule that looks at the numbers from
// get_badge_stats and decides whether the user has earned it.

const DAY = 24 * 60 * 60 * 1000;

const daysSince = (date, now) => (now - new Date(date)) / DAY;

export const BADGES = [
  {
    id: 'first-post',
    icon: '🎬',
    name: 'Първи пост',
    description: 'Написа първия си пост',
    earned: (stats) => stats.post_count >= 1,
  },
  {
    id: 'ten-posts',
    icon: '🎞️',
    name: 'Сценарист',
    description: 'Написа 10 поста',
    earned: (stats) => stats.post_count >= 10,
  },
  {
    id: 'first-comment',
    icon: '💬',
    name: 'Първи коментар',
    description: 'Написа първия си коментар',
    earned: (stats) => stats.comment_count >= 1,
  },
  {
    id: 'fifty-comments',
    icon: '🗣️',
    name: 'Критик',
    description: 'Написа 50 коментара',
    earned: (stats) => stats.comment_count >= 50,
  },
  {
    id: 'reputation-10',
    icon: '⭐',
    name: 'Харесван',
    description: 'Събра 10 точки репутация',
    earned: (stats) => stats.reputation >= 10,
  },
  {
    id: 'one-month',
    icon: '🍿',
    name: 'Редовен зрител',
    description: 'Член на форума от 30 дни',
    earned: (stats, now) => daysSince(stats.member_since, now) >= 30,
  },
  {
    id: 'one-year',
    icon: '🏆',
    name: 'Ветеран',
    description: 'Член на форума от една година',
    earned: (stats, now) => daysSince(stats.member_since, now) >= 365,
  },
];

export function getBadges(stats, now = new Date()) {
  if (!stats) {
    return [];
  }

  return BADGES.filter((badge) => badge.earned(stats, now));
}     