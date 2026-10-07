import { describe, expect, it } from "vitest";
import { getRating, sortPosts } from "./posts.lib";

describe("Rating tests", () => {
  it("should return the rating as zero", () => {
    let post = {
      votes: [],
    };
    expect(getRating(post)).toBe(0);
  });

  it("should sum and return the positive rating", () => {
    let post = {
      votes: [
        {
          rating: 1,
        },
        {
          rating: 1,
        },
        {
          rating: 1,
        },
      ],
    };
    expect(getRating(post)).toBe(3);
  });

  it("should sum and return the total rating", () => {
    let post = {
      votes: [
        {
          rating: 1,
        },
        {
          rating: 1,
        },
        {
          rating: -1,
        },
        {
          rating: 1,
        },
      ],
    };
    expect(getRating(post)).toBe(2);
  });
});

describe("Sorting tests", () => {
  it("should sort the posts by most comments first", () => {
    let posts = [
      {
        id: 1,
        comments: [
          {
            count: 3,
          },
        ],
      },
      {
        id: 2,
        comments: [
          {
            count: 2,
          },
        ],
      },
      {
        id: 3,
        comments: [
          {
            count: 4,
          },
        ],
      },
    ];
    expect(sortPosts(posts, "most-comments").map((p) => p.id)).toEqual([
      3, 1, 2,
    ]);
  });

  it("should sort the posts by most likes", () => {
    let posts = [
      {
        id: 1,
        votes: [
          {
            rating: 1,
          },
          {
            rating: 1,
          },
        ],
      },
      {
        id: 2,
        votes: [
          {
            rating: -1,
          },
          {
            rating: -1,
          },
        ],
      },
      {
        id: 3,
        votes: [
          {
            rating: 1,
          },
          {
            rating: -1,
          },
        ],
      },
    ];

    expect(sortPosts(posts, "most-liked").map((p) => p.id)).toEqual([1, 3, 2]);
  });

  it('sorting by newest should not change the order' , () => {
    let posts = [
      {
        id : 1
      }, {
        id: 2
      }, {
        id: 3
      }, {
        id: 4
      }
    ]
    expect(sortPosts(posts, "newest").map((p) => p.id)).toEqual([1, 2, 3, 4])
  });

  it('sorting by oldest should not change the order' , () => {
    let posts = [
      {
        id : 1
      }, {
        id: 2
      }, {
        id: 3
      }, {
        id: 4
      }
    ]
    expect(sortPosts(posts, "oldest").map((p) => p.id)).toEqual([1, 2, 3, 4])
  });

  it('sorting by most comments should not change the original posts', () => {
    let posts = [
      {
        id: 1,
        comments: [
          {
            count: 3,
          },
        ],
      },
      {
        id: 2,
        comments: [
          {
            count: 2,
          },
        ],
      },
      {
        id: 3,
        comments: [
          {
            count: 4,
          },
        ],
      },
    ];
    expect(sortPosts(posts, "most-comments").map((p) => p.id)).toEqual([3, 1, 2])
    expect(posts.map(p => p.id)).toEqual([1, 2, 3])
  })
});
