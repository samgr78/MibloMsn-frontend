import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";
import { makePost, makeSession } from "../../../test/factories";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { server } from "../../../test/server";
import type { Comment, PostDetail } from "../../posts/api/posts.schemas";
import { PostDetailPage } from "../../posts/pages/PostDetailPage";

const POST_ID = "post-with-comments";
const ME = { id: "user-me", username: "moi" };
const SOMEONE_ELSE = { id: "user-other", username: "bob" };

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: "comment-1",
    content: "Un commentaire",
    createdAt: new Date().toISOString(),
    author: SOMEONE_ELSE,
    ...overrides,
  };
}

/** Mounted inside the detail page, as in production: it is what subscribes
 *  to the cache, so only it can show the comment and counter updating. */
function renderDetailWith(comments: ReadonlyArray<Comment>) {
  const detail: PostDetail = {
    // The post belongs to someone else, so only the comment button shows
    // and the queries stay unambiguous.
    ...makePost({ id: POST_ID, author: SOMEONE_ELSE }),
    comments: [...comments],
    commentCount: comments.length,
  };

  server.use(http.get("*/posts/:id", () => HttpResponse.json(detail)));

  renderWithProviders(
    <Routes>
      <Route path="/posts/:postId" element={<PostDetailPage />} />
    </Routes>,
    { route: `/posts/${POST_ID}`, session: makeSession(ME) },
  );
}

function deleteButton(): Promise<HTMLElement> {
  return screen.findByRole("button", { name: /supprimer ce commentaire/i });
}

function commentItems(): HTMLElement[] {
  return within(screen.getByRole("list", { name: /commentaires/i })).getAllByRole(
    "listitem",
  );
}

describe("DeleteCommentButton — qui peut supprimer", () => {
  test("le commentaire d'un autre n'offre aucun bouton de suppression", async () => {
    renderDetailWith([makeComment({ content: "Le commentaire de bob" })]);

    await screen.findByText("Le commentaire de bob");
    expect(
      screen.queryByRole("button", { name: /supprimer ce commentaire/i }),
    ).not.toBeInTheDocument();
  });

  test("son propre commentaire offre le bouton", async () => {
    renderDetailWith([makeComment({ author: ME, content: "Mon commentaire" })]);

    expect(await deleteButton()).toBeInTheDocument();
  });
});

describe("DeleteCommentButton — suppression", () => {
  test("cliquer ne supprime pas : une confirmation est demandée d'abord", async () => {
    renderDetailWith([makeComment({ author: ME, content: "Mon commentaire" })]);

    // No DELETE handler: a request going out would fail the test.
    await userEvent.setup().click(await deleteButton());

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Mon commentaire")).toBeInTheDocument();
  });

  test("après confirmation, le commentaire disparaît et le compteur baisse", async () => {
    renderDetailWith([
      makeComment({ id: "comment-mine", author: ME, content: "Mon commentaire" }),
      makeComment({ id: "comment-other", content: "Le commentaire de bob" }),
    ]);
    server.use(
      http.delete("*/comments/:id", () => new HttpResponse(null, { status: 204 })),
    );

    const user = userEvent.setup();
    await screen.findByText("Mon commentaire");
    expect(screen.getByRole("region", { name: /commentaires \(2\)/i })).toBeInTheDocument();

    await user.click(await deleteButton());
    await user.click(
      await screen.findByRole("button", { name: /supprimer définitivement/i }),
    );

    await screen.findByRole("region", { name: /commentaires \(1\)/i });
    expect(screen.queryByText("Mon commentaire")).not.toBeInTheDocument();
    expect(commentItems()).toHaveLength(1);
  });

  test("un refus du serveur prévient et laisse le commentaire en place", async () => {
    renderDetailWith([makeComment({ author: ME, content: "Mon commentaire" })]);
    // The backend refuses another user's comment with a 403, even if the
    // interface had shown the button.
    server.use(
      http.delete("*/comments/:id", () =>
        HttpResponse.json(
          { error: "Vous ne pouvez supprimer que vos propres commentaires" },
          { status: 403 },
        ),
      ),
    );

    const user = userEvent.setup();
    await user.click(await deleteButton());
    await user.click(
      await screen.findByRole("button", { name: /supprimer définitivement/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/vos propres commentaires/i);
    expect(screen.getByText("Mon commentaire")).toBeInTheDocument();
  });
});
