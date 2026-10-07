import { describe, it, vi, expect } from "vitest";
import {
  createPost,
  deletePost,
  getPostById,
  searchPosts,
  updatePost,
} from "./post.service";
import { supabase } from "../config/supabase-config";

vi.mock(import("../config/supabase-config"), () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  };
});

describe("Create post tests", () => {
  it("createPost should return the post with correct information and sends the correct data", async () => {
    const post = {
      data: {
        id: 1,
        author_id: 30,
        title: "My post",
        content: "My first post is live",
      },
      error: null,
    };
    const obj = {};
    supabase.from.mockReturnValue(obj);
    obj.insert = vi.fn().mockReturnValue(obj);
    obj.select = vi.fn().mockReturnValue(obj);
    obj.single = vi.fn().mockResolvedValue(post);

    const result = await createPost(30, "My post", "My first post is live");

    expect(result).toEqual(post.data);
    expect(obj.insert).toHaveBeenCalledWith({
      author_id: 30,
      title: "My post",
      content: "My first post is live",
    });
  });

  it("createPost should throw when RLS blocks an insert", async () => {
    const post = {
      data: null,
      error: {
        message: "Error message",
      },
    };
    const obj = {};
    supabase.from.mockReturnValue(obj);
    obj.insert = vi.fn().mockReturnValue(obj);
    obj.select = vi.fn().mockReturnValue(obj);
    obj.single = vi.fn().mockResolvedValue(post);
    const result = createPost(30, "My post", "My first post is live");

    await expect(result).rejects.toEqual({ message: "Error message" });
  });

  it("getPostById should return null with no match", async () => {
    const post = {
      data: null,
      error: null,
    };

    const obj = {};
    supabase.from.mockReturnValue(obj);
    obj.select = vi.fn().mockReturnValue(obj);
    obj.eq = vi.fn().mockReturnValue(obj);
    obj.maybeSingle = vi.fn().mockResolvedValue(post);

    const result = await getPostById(1);

    expect(result).toBeNull();
  });

  it("deletePost should delete the user post", async () => {
    const obj = {};
    supabase.from.mockReturnValue(obj);
    obj.delete = vi.fn().mockReturnValue(obj);
    obj.eq = vi.fn().mockReturnValue(obj);
    obj.select = vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null });

    const result = await deletePost(1);
    expect(result).toBeUndefined();
    expect(obj.delete).toHaveBeenCalled();
    expect(obj.eq).toHaveBeenCalledWith("id", 1);
    expect(obj.select).toHaveBeenCalledWith("id");
  });

  it("deletePost should throw when no post was deleted", async () => {
    const obj = {};
    supabase.from.mockReturnValue(obj);
    obj.delete = vi.fn().mockReturnValue(obj);
    obj.eq = vi.fn().mockReturnValue(obj);
    obj.select = vi.fn().mockResolvedValue({ data: [], error: null });

    await expect(deletePost(1)).rejects.toThrow("The post was not deleted");
  });

  it("updatePost should correctly change the user post", async () => {
    const post = {
      data: {
        id: 1,
        title: "My post",
        content: "My first post is live",
      },
      error: null,
    };

    const obj = {};
    supabase.from.mockReturnValue(obj);
    obj.update = vi.fn().mockReturnValue(obj);
    obj.eq = vi.fn().mockReturnValue(obj);
    obj.select = vi.fn().mockReturnValue(obj);
    obj.single = vi.fn().mockResolvedValue(post);

    const result = await updatePost(1, "My post", "My first post is live");
    expect(result).toEqual(post.data);
    expect(obj.update).toHaveBeenCalledWith({
      title: "My post",
      content: "My first post is live",
    });
    expect(obj.eq).toHaveBeenCalledWith("id", 1);
  });

  it("searchPosts should correctly show relevant posts", async () => {
    const post = {
      data: [{
        id: 1,
        title: "My post about Batman",
        content: "Here is what i think about the bat",
      }],
      error: null,
    };

    const obj = {};
    supabase.from.mockReturnValue(obj);
    obj.select = vi.fn().mockReturnValue(obj);
    obj.or = vi.fn().mockReturnValue(obj);
    obj.order = vi.fn().mockResolvedValue(post);

    const result = await searchPosts("bat", false);
    expect(result).toEqual(post.data);
    expect(obj.or).toHaveBeenCalledWith(
      "title.ilike.%bat%,content.ilike.%bat%",
    );
    expect(obj.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it('updatePost should throw when unauthorized user tries to update a post', async () => {
    const post = {
      data: null,
      error: {
        message: "Error message",
      },
    };
    const obj = {};
    supabase.from.mockReturnValue(obj);
    obj.update = vi.fn().mockReturnValue(obj);
    obj.eq = vi.fn().mockReturnValue(obj);
    obj.select = vi.fn().mockReturnValue(obj);
    obj.single = vi.fn().mockResolvedValue(post);

    const result = updatePost(1, "My post", "My first post is live");
    await expect(result).rejects.toEqual({ message: "Error message" });
  })
});
