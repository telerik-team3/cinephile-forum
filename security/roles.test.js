// Blocked users, non-admins and admins: what the database lets each of them do.
// These tests sign in to the real database (see security/clients.js).
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { signIn, anonymousClient } from "./clients.js";

const TITLE = "Security test post for roles";
const CONTENT = "This post exists only while the security tests are running.";

let a;
let b;
let blocked;
let admin;
let postId;
let commentId;

beforeAll(async () => {
  a = await signIn("USER_A");
  b = await signIn("USER_B");
  blocked = await signIn("BLOCKED");
  admin = await signIn("ADMIN");

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

// Normally the admin test below has already deleted the post.
afterAll(async () => {
  if (postId) {
    await a.client.from("posts").delete().eq("id", postId);
  }
});

describe("Visitors (not signed in)", () => {
  it("cannot create a post", async () => {
    const { error } = await anonymousClient()
      .from("posts")
      .insert({ author_id: a.userId, title: TITLE, content: CONTENT });

    expect(error.code).toBe("42501");
  });
});

describe("Blocked users", () => {
  it("cannot create a post", async () => {
    const { error } = await blocked.client
      .from("posts")
      .insert({ author_id: blocked.userId, title: TITLE, content: CONTENT });

    expect(error.code).toBe("42501");
  });

  it("cannot comment", async () => {
    const { error } = await blocked.client
      .from("comments")
      .insert({ post_id: postId, author_id: blocked.userId, content: "Blocked comment" });

    expect(error.code).toBe("42501");
  });

  it("cannot vote", async () => {
    const { error } = await blocked.client
      .from("votes")
      .insert({ post_id: postId, author_id: blocked.userId, rating: 1 });

    expect(error.code).toBe("42501");
  });

  it("cannot unblock themselves", async () => {
    const { error } = await blocked.client
      .from("profiles")
      .update({ is_blocked: false })
      .eq("id", blocked.userId);

    expect(error.message).toContain("Only administrators");

    const check = await admin.client
      .from("profiles")
      .select("is_blocked")
      .eq("id", blocked.userId)
      .single();
    expect(check.data.is_blocked).toBe(true);
  });
});

describe("Regular users (not admins)", () => {
  it("cannot make themselves admin", async () => {
    const { error } = await b.client
      .from("profiles")
      .update({ is_admin: true })
      .eq("id", b.userId);

    expect(error.message).toContain("Only administrators");
  });

  it("cannot block another user", async () => {
    const { data, error } = await b.client
      .from("profiles")
      .update({ is_blocked: true })
      .eq("id", a.userId)
      .select();

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("cannot search users through the admin function", async () => {
    const { data, error } = await b.client.rpc("admin_search_users", {
      search_term: "sectest",
    });

    expect(data).toBeNull();
    expect(error.code).toBe("42501");
  });
});

describe("Administrators", () => {
  it("can search users and see their emails", async () => {
    const { data, error } = await admin.client.rpc("admin_search_users", {
      search_term: "sectest",
    });

    expect(error).toBeNull();
    expect(data.length).toBeGreaterThanOrEqual(2);
    expect(data[0].email).toBeTruthy();
  });

  it("can delete another user's comment", async () => {
    const { data, error } = await admin.client
      .from("comments")
      .delete()
      .eq("id", commentId)
      .select();

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("can delete another user's post", async () => {
    const { data, error } = await admin.client
      .from("posts")
      .delete()
      .eq("id", postId)
      .select();

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    postId = null;
  });
});
