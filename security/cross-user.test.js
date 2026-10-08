// Cross-user CRUD: user B must not change or delete what user A owns.
// These tests sign in to the real database (see security/clients.js).
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { signIn } from "./clients.js";

const TITLE = "Security test post by user A";
const CONTENT = "This post exists only while the security tests are running.";

let a;
let b;
let postId;
let commentId;

beforeAll(async () => {
  a = await signIn("USER_A");
  b = await signIn("USER_B");

  const post = await a.client
    .from("posts")
    .insert({ author_id: a.userId, title: TITLE, content: CONTENT })
    .select()
    .single();
  if (post.error) throw post.error;
  postId = post.data.id;

  const comment = await a.client
    .from("comments")
    .insert({ post_id: postId, author_id: a.userId, content: "Comment by user A" })
    .select()
    .single();
  if (comment.error) throw comment.error;
  commentId = comment.data.id;
});

// Deleting the post also deletes its comments (on delete cascade).
afterAll(async () => {
  if (postId) {
    await a.client.from("posts").delete().eq("id", postId);
  }
});

describe("Cross-user CRUD", () => {
  it("the author can update their own post (control test)", async () => {
    const { data, error } = await a.client
      .from("posts")
      .update({ content: CONTENT + " Edited by A." })
      .eq("id", postId)
      .select();

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("another user cannot update the post", async () => {
    const { data, error } = await b.client
      .from("posts")
      .update({ title: "Changed by user B!!!" })
      .eq("id", postId)
      .select();

    expect(error).toBeNull();
    expect(data).toHaveLength(0);

    const check = await a.client.from("posts").select("title").eq("id", postId).single();
    expect(check.data.title).toBe(TITLE);
  });

  it("another user cannot delete the post", async () => {
    const { data, error } = await b.client
      .from("posts")
      .delete()
      .eq("id", postId)
      .select();

    expect(error).toBeNull();
    expect(data).toHaveLength(0);

    const check = await a.client.from("posts").select("id").eq("id", postId);
    expect(check.data).toHaveLength(1);
  });

  it("a user cannot create a post in someone else's name", async () => {
    const { data, error } = await b.client
      .from("posts")
      .insert({ author_id: a.userId, title: TITLE, content: CONTENT })
      .select();

    expect(data).toBeNull();
    expect(error.code).toBe("42501");
  });

  it("another user cannot update the comment", async () => {
    const { data, error } = await b.client
      .from("comments")
      .update({ content: "Changed by user B" })
      .eq("id", commentId)
      .select();

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("another user cannot delete the comment", async () => {
    const { data, error } = await b.client
      .from("comments")
      .delete()
      .eq("id", commentId)
      .select();

    expect(error).toBeNull();
    expect(data).toHaveLength(0);

    const check = await a.client.from("comments").select("id").eq("id", commentId);
    expect(check.data).toHaveLength(1);
  });

  it("another user cannot update the profile", async () => {
    const { data, error } = await b.client
      .from("profiles")
      .update({ first_name: "Hacked" })
      .eq("id", a.userId)
      .select();

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });
});
