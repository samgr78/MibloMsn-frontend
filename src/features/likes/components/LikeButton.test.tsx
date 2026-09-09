import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { beforeEach, describe, expect, test } from "vitest";
import { makePost } from "../../../test/factories";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { server } from "../../../test/server";
import { FeedPage } from "../../posts/pages/FeedPage";

/**
 * Mounted inside the feed, not on its own: the feed is what subscribes to
 * the cache. Alone, the button would just re-render the frozen prop it
 * was given, and the test would prove nothing.
 */
function renderFeedWith(post: ReturnType<typeof makePost>) {
  server.use(
    http.get("*/posts", () => HttpResponse.json({ items: [post], nextCursor: null })),
  );
  renderWithProviders(<FeedPage />);
}

async function likeButton(): Promise<HTMLElement> {
  return screen.findByRole("button", { name: /like/i });
}

describe("LikeButton", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  test("expose son état via aria-pressed et affiche le compteur", async () => {
    renderFeedWith(makePost({ likeCount: 4, likedByMe: true }));

    const button = await screen.findByRole("button", { name: /retirer mon like/i });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("4");
  });

  test("incrémente le compteur avant la réponse du serveur", async () => {
    renderFeedWith(makePost({ likeCount: 2, likedByMe: false }));
    // The response never arrives, so what shows is the optimistic update.
    server.use(
      http.post("*/posts/:id/like", async () => {
        await delay("infinite");
        return HttpResponse.json({});
      }),
    );

    await userEvent.setup().click(await likeButton());

    const button = await likeButton();
    expect(button).toHaveTextContent("3");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  test("revient en arrière et prévient l'utilisateur si l'API échoue", async () => {
    renderFeedWith(makePost({ likeCount: 7, likedByMe: false }));
    server.use(
      http.post("*/posts/:id/like", () =>
        HttpResponse.json({ error: "Serveur indisponible" }, { status: 500 }),
      ),
    );

    await userEvent.setup().click(await likeButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(/serveur indisponible/i);

    const button = await screen.findByRole("button", { name: /liker ce post/i });
    expect(button).toHaveTextContent("7");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  test("un like déjà posé déclenche un unlike", async () => {
    renderFeedWith(makePost({ likeCount: 1, likedByMe: true }));
    server.use(
      http.delete("*/posts/:id/like", ({ params }) =>
        HttpResponse.json({ postId: params["id"], likeCount: 0, likedByMe: false }),
      ),
    );

    await userEvent.setup().click(await screen.findByRole("button", { name: /retirer/i }));

    expect(
      await screen.findByRole("button", { name: /liker ce post/i }),
    ).toHaveTextContent("0");
  });

  test("le compteur du serveur fait autorité sur l'estimation optimiste", async () => {
    renderFeedWith(makePost({ likeCount: 10, likedByMe: false }));
    // Someone else liked meanwhile: the server says 25, not our 11.
    server.use(
      http.post("*/posts/:id/like", ({ params }) =>
        HttpResponse.json({ postId: params["id"], likeCount: 25, likedByMe: true }),
      ),
    );

    await userEvent.setup().click(await likeButton());

    expect(await screen.findByText("25")).toBeInTheDocument();
  });
});
