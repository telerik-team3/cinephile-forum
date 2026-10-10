import { describe, expect, it } from "vitest";
import { getBadges } from "./badges.lib";

// A fixed "today", so the results do not depend on the day the tests run.
const NOW = new Date("2026-10-09T12:00:00Z");

const newUser = {
  post_count: 0,
  comment_count: 0,
  reputation: 0,
  member_since: "2026-10-09T10:00:00Z",
};

const ids = (badges) => badges.map((badge) => badge.id);

describe("getBadges", () => {
  it("returns no badges while the stats are still loading", () => {
    expect(getBadges(null, NOW)).toEqual([]);
  });

  it("returns no badges for a brand new user", () => {
    expect(getBadges(newUser, NOW)).toEqual([]);
  });

  it("gives the first post badge for one post", () => {
    const stats = { ...newUser, post_count: 1 };
    expect(ids(getBadges(stats, NOW))).toEqual(["first-post"]);
  });

  it("gives both post badges for ten posts", () => {
    const stats = { ...newUser, post_count: 10 };
    expect(ids(getBadges(stats, NOW))).toEqual(["first-post", "ten-posts"]);
  });

  it("gives both comment badges for fifty comments", () => {
    const stats = { ...newUser, comment_count: 50 };
    expect(ids(getBadges(stats, NOW))).toEqual(["first-comment", "fifty-comments"]);
  });

  it("gives the reputation badge at exactly 10 points, not at 9", () => {
    expect(ids(getBadges({ ...newUser, reputation: 9 }, NOW))).toEqual([]);
    expect(ids(getBadges({ ...newUser, reputation: 10 }, NOW))).toEqual(["reputation-10"]);
  });

  it("gives the one month badge after 30 days", () => {
    const stats = { ...newUser, member_since: "2026-09-09T12:00:00Z" };
    expect(ids(getBadges(stats, NOW))).toEqual(["one-month"]);
  });

  it("gives both time badges after one year", () => {
    const stats = { ...newUser, member_since: "2025-10-09T12:00:00Z" };
    expect(ids(getBadges(stats, NOW))).toEqual(["one-month", "one-year"]);
  });
});