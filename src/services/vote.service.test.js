import { describe, it, vi, expect } from "vitest";
import { supabase } from "../config/supabase-config";
import {
  getCurrentVote,
  getVoteScore,
  updateVote,
  deleteVote,
  createVote,
} from "./vote.service";

vi.mock(import("../config/supabase-config"), () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  };
});

describe("Vote tests", () => {
  it("getCurrentVote should return 0 with no votes", async () => {
    const post = {
      data: null,
      error: null,
    };

    const obj = {};
    supabase.from.mockReturnValue(obj);
    obj.select = vi.fn().mockReturnValue(obj);
    obj.eq = vi.fn().mockReturnValue(obj);
    obj.maybeSingle = vi.fn().mockResolvedValue(post);

    const result = await getCurrentVote(1, 30);

    expect(result).toBe(0);
  });

  it("getVoteScore should return with the total score", async () => {
    const post = {
      data: [
        {
          rating: 1,
        },
        {
          rating: 1,
        },
        {
          rating: -1,
        },
      ],
      error: null,
    };

    const obj = {};
    supabase.from.mockReturnValue(obj);
    obj.select = vi.fn().mockReturnValue(obj);
    obj.eq = vi.fn().mockResolvedValue(post);

    const result = await getVoteScore(1);

    expect(result).toBe(1);
  });

  it("updateVote should correctly change the vote", async () => {
    const post = {
      data: {
        rating: -1,
        post_id: 1,
        author_id: 30,
      },
      error: null,
    };

    const obj = {};
    supabase.from.mockReturnValue(obj);
    obj.update = vi.fn().mockReturnValue(obj);
    obj.eq = vi.fn().mockReturnValue(obj);
    obj.select = vi.fn().mockReturnValue(obj);
    obj.single = vi.fn().mockResolvedValue(post);

    const result = await updateVote(1, 30, -1);
    expect(result).toEqual(post.data);
    expect(obj.update).toHaveBeenCalledWith({ rating: -1 });
    expect(obj.eq).toHaveBeenCalledWith("post_id", 1);
    expect(obj.eq).toHaveBeenCalledWith("author_id", 30);
  });

  it("deleteVote should only delete the user vote on this post", async () => {
    const obj = {};
    supabase.from.mockReturnValue(obj);
    obj.delete = vi.fn().mockReturnValue(obj);
    obj.eq = vi
      .fn()
      .mockReturnValueOnce(obj)
      .mockResolvedValueOnce({ error: null });

    const result = await deleteVote(1, 30);
    expect(result).toBeUndefined();
    expect(obj.delete).toHaveBeenCalled();
    expect(obj.eq).toHaveBeenCalledWith("post_id", 1);
    expect(obj.eq).toHaveBeenCalledWith("author_id", 30);
  });

  it("createVote should create a vote and send the correct data", async () => {
    let post = {
      data: {
        post_id: 1,
        author_id: 30,
        rating: 1,
      },
      error: null,
    };

    const obj = {};
    supabase.from.mockReturnValue(obj);
    obj.insert = vi.fn().mockReturnValue(obj);
    obj.select = vi.fn().mockReturnValue(obj);
    obj.single = vi.fn().mockResolvedValue(post);

    const result = await createVote(1, 30, 1);
    expect(result).toEqual(post.data);
    expect(obj.insert).toHaveBeenCalledWith({
      post_id: 1,
      author_id: 30,
      rating: 1,
    });
  });
});
