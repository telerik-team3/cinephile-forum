import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AppContext } from "../state/app.context";
import VoteControl from "./VoteControl";

vi.mock(import("../config/supabase-config"), () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  };
});

function renderAs(appState) {
  return renderToStaticMarkup(
    <AppContext.Provider value={appState}>
      <VoteControl postId={30} />
    </AppContext.Provider>,
  );
}

describe("User access tests", () => {
  it("should show the vote buttons to users who are not blocked", () => {
    const result = renderAs({
      user: { id: 1 },
      userData: { is_blocked: false },
      loading: false,
    });

    expect(result).toContain("Like");
    expect(result).toContain("Dislike");
    expect(result).toContain("Rating");
  });

  it("should hide the vote buttons to blocked users", () => {
    const result = renderAs({
      user: { id: 1 },
      userData: { is_blocked: true },
      loading: false,
    });

    expect(result).not.toContain("Like");
    expect(result).not.toContain("Dislike");
    expect(result).toContain("Rating");
  });
});
