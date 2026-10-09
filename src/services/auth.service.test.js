import { describe, it, vi, expect } from "vitest";
import { registerUser, loginUser, logoutUser } from "./auth.service";
import { supabase } from "../config/supabase-config";

vi.mock(import("../config/supabase-config"), () => {
  return {
    supabase: {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
    },
  };
});

describe("Registration tests", () => {
  it("registerUser should call signUp and return the user data", async () => {
    const userData = { user: { id: "u1", email: "test@test.com" } };
    supabase.auth.signUp.mockResolvedValue({ data: userData, error: null });

    const result = await registerUser("test@test.com", "pass123", "testuser", "Test", "User");

    expect(result).toEqual(userData);
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "pass123",
      options: {
        data: {
          username: "testuser",
          first_name: "Test",
          last_name: "User",
        },
      },
    });
  });
    it("registerUser should throw when Supabase returns an error", async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: "User already registered" },
    });

    await expect(
      registerUser("test@test.com", "pass123", "testuser", "Test", "User")
    ).rejects.toMatchObject({ message: "User already registered" });
  });
});

describe("Login tests", () => {
  it("loginUser should call signInWithPassword and return the session data", async () => {
    const sessionData = { user: { id: "u1" }, session: { access_token: "abc" } };
    supabase.auth.signInWithPassword.mockResolvedValue({ data: sessionData, error: null });

    const result = await loginUser("test@test.com", "pass123");

    expect(result).toEqual(sessionData);
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "pass123",
    });
  });

  it("loginUser should throw when the credentials are wrong", async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    });

    await expect(loginUser("test@test.com", "wrongpass")).rejects.toMatchObject({
      message: "Invalid login credentials",
    });
  });
});

describe("Logout tests", () => {
  it("logoutUser should call signOut", async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });

    await logoutUser();

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it("logoutUser should throw when Supabase returns an error", async () => {
    supabase.auth.signOut.mockResolvedValue({ error: { message: "Network error" } });

    await expect(logoutUser()).rejects.toMatchObject({ message: "Network error" });
  });
});