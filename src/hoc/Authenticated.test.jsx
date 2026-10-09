import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import Authenticated from "./Authenticated";
import { AppContext } from "../state/app.context";

function renderAs(appState) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <AppContext.Provider value={appState}>
        <Authenticated>
          <p>Protected content</p>
        </Authenticated>
      </AppContext.Provider>
    </MemoryRouter>
  );
}

describe("Authenticated route guard tests", () => {
  it("should show the protected content to a logged-in user", () => {
    const html = renderAs({ user: { id: "u1" }, loading: false });

    expect(html).toContain("Protected content");
  });

  it("should not show the protected content to a visitor who is not logged in", () => {
    const html = renderAs({ user: null, loading: false });

    expect(html).not.toContain("Protected content");
  });

  it("should wait while the session is loading", () => {
    const html = renderAs({ user: null, loading: true });

    expect(html).toContain("Зареждане");
    expect(html).not.toContain("Protected content");
  });
});