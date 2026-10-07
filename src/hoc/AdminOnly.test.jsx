import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import AdminOnly from "./AdminOnly";
import { AppContext } from "../state/app.context";

// Renders AdminOnly to plain HTML text, as the given kind of user.
function renderAs(appState) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <AppContext.Provider value={appState}>
        <AdminOnly>
          <p>Admin dashboard</p>
        </AdminOnly>
      </AppContext.Provider>
    </MemoryRouter>
  );
}

describe("Admin access tests", () => {
  it("should show the admin page to an administrator", () => {
    const html = renderAs({ user: { id: "u1" }, userData: { is_admin: true }, loading: false });

    expect(html).toContain("Admin dashboard");
  });

  it("should not show the admin page to a regular user", () => {
    const html = renderAs({ user: { id: "u1" }, userData: { is_admin: false }, loading: false });

    expect(html).not.toContain("Admin dashboard");
  });

  it("should not show the admin page to a visitor who is not logged in", () => {
    const html = renderAs({ user: null, userData: null, loading: false });

    expect(html).not.toContain("Admin dashboard");
  });

  it("should wait while the profile is loading", () => {
    const html = renderAs({ user: { id: "u1" }, userData: null, loading: true });

    expect(html).toContain("Зареждане");
    expect(html).not.toContain("Admin dashboard");
  });
});
