export function sortPosts(posts, sort) {
  if (sort === "most-comments") {
    return posts
      .slice()
      .sort((a, b) => b.comments[0].count - a.comments[0].count);
  }
  if (sort === "most-liked") {
    return posts.slice().sort((a, b) => getRating(b) - getRating(a));
  } else {
    return posts;
  }
}

export function getRating(p) {
  return p.votes.reduce((acc, curr) => acc + curr.rating, 0);
}
