import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, test } from "vitest";
import { makePost, makeSession } from "../../../test/factories";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { server } from "../../../test/server";
import { FeedPage } from "../pages/FeedPage";
import type { Post } from "../api/posts.schemas";

const ME = { id: "user-me", username: "moi" };

/** Mounted inside the feed, like the like button: the list is what
 *  subscribes to the cache, so only it can show the post disappearing. */
function renderFeedWith(post: Post, user = ME) {
  server.use(
    http.get("*/posts", () => HttpResponse.json({ items: [post], nextCursor: null })),
  );
  renderWithProviders(<FeedPage />, { session: makeSession(user) });
}

function myPost(): Post {
  return makePost({ content: "Un post à moi", author: ME });
}

function deleteButton(): Promise<HTMLElement> {
  return screen.findByRole("button", { name: /supprimer ce post/i });
}

describe("DeletePostButton — qui peut supprimer", () => {
  test("le post d'un autre n'offre aucun bouton de suppression", async () => {
    renderFeedWith(makePost({ content: "Le post de quelqu'un d'autre" }));

    await screen.findByText("Le post de quelqu'un d'autre");
    expect(
      screen.queryByRole("button", { name: /supprimer ce post/i }),
    ).not.toBeInTheDocument();
  });

  test("son propre post offre le bouton", async () => {
    renderFeedWith(myPost());

    expect(await deleteButton()).toBeInTheDocument();
  });
});

describe("DeletePostButton — confirmation", () => {
  test("cliquer ne supprime pas : une confirmation est demandée d'abord", async () => {
    renderFeedWith(myPost());

    // No DELETE handler: a request going out would fail the test.
    await userEvent.setup().click(await deleteButton());

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Un post à moi")).toBeInTheDocument();
  });

  test("annuler referme la confirmation et laisse le post en place", async () => {
    renderFeedWith(myPost());
    const user = userEvent.setup();

    await user.click(await deleteButton());
    await user.click(await screen.findByRole("button", { name: /annuler/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Un post à moi")).toBeInTheDocument();
  });
});

describe("DeletePostButton — suppression", () => {
  test("après confirmation, le post disparaît de la liste sans rechargement", async () => {
    renderFeedWith(myPost());
    server.use(http.delete("*/posts/:id", () => new HttpResponse(null, { status: 204 })));

    const user = userEvent.setup();
    await user.click(await deleteButton());
    await user.click(
      await screen.findByRole("button", { name: /supprimer définitivement/i }),
    );

    expect(await screen.findByText(/aucun post pour le moment/i)).toBeInTheDocument();
    expect(screen.queryByText("Un post à moi")).not.toBeInTheDocument();
  });

  test("un refus du serveur prévient l'utilisateur et laisse le post en place", async () => {
    renderFeedWith(myPost());
    // The backend refuses another user's post with a 403, even if the
    // interface had shown the button.
    server.use(
      http.delete("*/posts/:id", () =>
        HttpResponse.json(
          { error: "Vous ne pouvez supprimer que vos propres posts" },
          { status: 403 },
        ),
      ),
    );

    const user = userEvent.setup();
    await user.click(await deleteButton());
    await user.click(
      await screen.findByRole("button", { name: /supprimer définitivement/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/vos propres posts/i);
    expect(screen.getByText("Un post à moi")).toBeInTheDocument();
  });
});
