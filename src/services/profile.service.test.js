import { describe, it, vi, expect } from "vitest";
import { searchUsers, setUserBlocked, setUserAdmin } from "./profile.service";
import { supabase } from "../config/supabase-config";
import { updateProfile } from "./profile.service";

vi.mock(import("../config/supabase-config"), () => {
  return {
    supabase: {
      from: vi.fn(),
      rpc: vi.fn(),
    },
  };
});

// A fake update query. Every step returns the same object, so the chain
// .update().eq().select().single() keeps working. Only single gives the result.
function mockUpdate(result) {
  const obj = {};
  supabase.from.mockReturnValue(obj);
  obj.update = vi.fn().mockReturnValue(obj);
  obj.eq = vi.fn().mockReturnValue(obj);
  obj.select = vi.fn().mockReturnValue(obj);
  obj.single = vi.fn().mockResolvedValue(result);
  return obj;
}

describe("Admin user search tests", () => {
  it("searchUsers should call admin_search_users with the search term", async () => {
    const users = [{ id: "u1", username: "ivotest", email: "ivo.test@gmail.com" }];
    supabase.rpc.mockResolvedValue({ data: users, error: null });

    const result = await searchUsers("ivo");

    expect(result).toEqual(users);
    expect(supabase.rpc).toHaveBeenCalledWith("admin_search_users", { search_term: "ivo" });
  });

  it("searchUsers should throw when the caller is not an admin", async () => {
    supabase.rpc.mockResolvedValue({
      data: null,
      error: { code: "42501", message: "Only administrators can search users" },
    });

    await expect(searchUsers("")).rejects.toMatchObject({ code: "42501" });
  });
});

describe("Block and admin rights tests", () => {
  it("setUserBlocked should block the user and return the new status", async () => {
    const updated = { id: "u1", is_admin: false, is_blocked: true };
    const obj = mockUpdate({ data: updated, error: null });

    const result = await setUserBlocked("u1", true);

    expect(result).toEqual(updated);
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(obj.update).toHaveBeenCalledWith({ is_blocked: true });
    expect(obj.eq).toHaveBeenCalledWith("id", "u1");
  });

  it("setUserBlocked should unblock the user", async () => {
    const obj = mockUpdate({ data: { id: "u1", is_admin: false, is_blocked: false }, error: null });

    await setUserBlocked("u1", false);

    expect(obj.update).toHaveBeenCalledWith({ is_blocked: false });
  });

  it("setUserBlocked should throw when the database refuses the change", async () => {
    mockUpdate({
      data: null,
      error: { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" },
    });

    await expect(setUserBlocked("u1", true)).rejects.toMatchObject({ code: "PGRST116" });
  });

  it("setUserAdmin should give administrator rights", async () => {
    const updated = { id: "u1", is_admin: true, is_blocked: false };
    const obj = mockUpdate({ data: updated, error: null });

    const result = await setUserAdmin("u1", true);

    expect(result).toEqual(updated);
    expect(obj.update).toHaveBeenCalledWith({ is_admin: true });
    expect(obj.eq).toHaveBeenCalledWith("id", "u1");
  });

  it("setUserAdmin should remove administrator rights", async () => {
    const obj = mockUpdate({ data: { id: "u1", is_admin: false, is_blocked: false }, error: null });

    await setUserAdmin("u1", false);

    expect(obj.update).toHaveBeenCalledWith({ is_admin: false });
  });
});


describe("Profile editing tests", () => {
  it("updateProfile should update names, phone and avatar, and return the new profile", async () => {
    const updated = {
      id: "u1",
      username: "andro",
      first_name: "Andro",
      last_name: "Atanasov",
      phone: "0899999999",
      avatar_url: "https://example.com/avatar.png",
    };
    const obj = mockUpdate({ data: updated, error: null });

    const result = await updateProfile("u1", "Andro", "Atanasov", "0899999999", "https://example.com/avatar.png");

    expect(result).toEqual(updated);
    expect(obj.update).toHaveBeenCalledWith({
      first_name: "Andro",
      last_name: "Atanasov",
      phone: "0899999999",
      avatar_url: "https://example.com/avatar.png",
    });
    expect(obj.eq).toHaveBeenCalledWith("id", "u1");
  });

  it("updateProfile should never send the username, since it is not accepted as a parameter", async () => {
    const obj = mockUpdate({ data: { id: "u1", username: "andro" }, error: null });

    await updateProfile("u1", "Andro", "Atanasov", "0899999999", null);

    expect(obj.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ username: expect.anything() })
    );
  });
});