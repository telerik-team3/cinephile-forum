import { describe, it, vi, expect } from "vitest";
import {
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment,
} from "./comment.service";
import { supabase } from "../config/supabase-config";

vi.mock(import("../config/supabase-config"), () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  };
});

// A fake query. Every step returns the same object, so any chain keeps working.
// The step named in "last" ends the chain and gives the result.
function mockQuery(last, result) {
  const obj = {};
  for (const step of ["select", "insert", "update", "delete", "eq", "order", "single"]) {
    obj[step] = vi.fn().mockReturnValue(obj);
  }
  obj[last] = vi.fn().mockResolvedValue(result);
  supabase.from.mockReturnValue(obj);
  return obj;
}

describe("Comment tests", () => {
  it("getCommentsByPostId should return the comments of the post, oldest first", async () => {
    const comments = [
      { id: "c1", content: "First comment" },
      { id: "c2", content: "Second comment" },
    ];
    const obj = mockQuery("order", { data: comments, error: null });

    const result = await getCommentsByPostId("p1");

    expect(result).toEqual(comments);
    expect(supabase.from).toHaveBeenCalledWith("comments");
    expect(obj.eq).toHaveBeenCalledWith("post_id", "p1");
    expect(obj.order).toHaveBeenCalledWith("created_at", { ascending: true });
  });

  it("createComment should send the post, the author and the text", async () => {
    const comment = { id: "c1", post_id: "p1", author_id: "u1", content: "Great movie" };
    const obj = mockQuery("single", { data: comment, error: null });

    const result = await createComment("p1", "u1", "Great movie");

    expect(result).toEqual(comment);
    expect(obj.insert).toHaveBeenCalledWith({
      post_id: "p1",
      author_id: "u1",
      content: "Great movie",
    });
  });

  it("createComment should throw when a blocked user comments", async () => {
    mockQuery("single", {
      data: null,
      error: { code: "42501", message: "new row violates row-level security policy" },
    });

    await expect(createComment("p1", "u1", "Great movie")).rejects.toMatchObject({ code: "42501" });
  });

  it("updateComment should change only the text of the comment", async () => {
    const comment = { id: "c1", content: "Edited text" };
    const obj = mockQuery("single", { data: comment, error: null });

    const result = await updateComment("c1", "Edited text");

    expect(result).toEqual(comment);
    expect(obj.update).toHaveBeenCalledWith({ content: "Edited text" });
    expect(obj.eq).toHaveBeenCalledWith("id", "c1");
  });

  it("deleteComment should delete the comment", async () => {
    const obj = mockQuery("single", { data: { id: "c1" }, error: null });

    const result = await deleteComment("c1");

    expect(result).toBeUndefined();
    expect(obj.delete).toHaveBeenCalled();
    expect(obj.eq).toHaveBeenCalledWith("id", "c1");
    expect(obj.select).toHaveBeenCalledWith("id");
  });

  it("deleteComment should throw when the database deletes nothing", async () => {
    mockQuery("single", {
      data: null,
      error: { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" },
    });

    await expect(deleteComment("c1")).rejects.toMatchObject({ code: "PGRST116" });
  });
});
