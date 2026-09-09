import { screen, within } from "@testing-library/react";
import { HttpResponse, delay, http } from "msw";
import { Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";
import { makePosts, makeSession } from "../../../test/factories";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { server } from "../../../test/server";
import type { Post } from "../../posts/api/posts.schemas";
import type { PublicUser } from "../api/users.schemas";
import { ProfilePage } from "./ProfilePage";

const USER_ID = "user-profil-1";

function makeUser(overrides: Partial<PublicUser> = {}): PublicUser {
  return {
    id: USER_ID,
    username: "alice",
    createdAt: new Date("2026-01-15T10:00:00.000Z").toISOString(),
    ...overrides,
  };
}

/** The posts request always has a handler: both go out in parallel, and an
 *  uncovered call would fail the test. */
function userPosts(items: ReadonlyArray<Post>) {
  return http.get("*/users/:id/posts", () =>
    HttpResponse.json({ items, nextCursor: null }),
  );
}

function renderProfile(options: { session?: ReturnType<typeof makeSession> } = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/users/:userId" element={<ProfilePage />} />
    </Routes>,
    { route: `/users/${USER_ID}`, ...options },
  );
}

describe("ProfilePage — états d'écran", () => {
  test("loading avant la réponse", async () => {
    server.use(
      http.get("*/users/:id", async () => {
        await delay("infinite");
        return HttpResponse.json({});
      }),
      userPosts([]),
    );

    renderProfile();

    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  test("un profil inexistant affiche une absence, pas une erreur technique", async () => {
    server.use(
      http.get("*/users/:id", () =>
        HttpResponse.json({ error: "Utilisateur introuvable" }, { status: 404 }),
      ),
      userPosts([]),
    );

    renderProfile();

    expect(await screen.findByText(/ce profil n'existe pas/i)).toBeInTheDocument();
    // Retrying a deleted account would fail the same way.
    expect(screen.queryByRole("button", { name: /réessayer/i })).not.toBeInTheDocument();
  });

  test("une panne serveur affiche bien une erreur avec Réessayer", async () => {
    server.use(
      http.get("*/users/:id", () => HttpResponse.json({ error: "boom" }, { status: 500 })),
      userPosts([]),
    );

    renderProfile();

    expect(await screen.findByRole("alert")).toHaveTextContent(/erreur/i);
    expect(screen.getByRole("button", { name: /réessayer/i })).toBeInTheDocument();
  });

  test("success : l'identité et les posts de l'utilisateur sont affichés", async () => {
    const posts = makePosts(2);
    server.use(
      http.get("*/users/:id", () => HttpResponse.json(makeUser())),
      userPosts(posts),
    );

    renderProfile();

    expect(await screen.findByRole("heading", { name: "alice" })).toBeInTheDocument();
    expect(screen.getByText(/membre depuis/i)).toBeInTheDocument();

    const list = await screen.findByRole("list", { name: /posts de alice/i });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  });

  test("un profil sans post l'annonce explicitement", async () => {
    server.use(
      http.get("*/users/:id", () => HttpResponse.json(makeUser())),
      userPosts([]),
    );

    renderProfile();

    expect(await screen.findByText(/alice n'a rien publié/i)).toBeInTheDocument();
  });
});

describe("ProfilePage — profil de l'utilisateur connecté", () => {
  test("son propre profil est signalé et le message de vide lui parle", async () => {
    server.use(
      http.get("*/users/:id", () => HttpResponse.json(makeUser({ username: "moi" }))),
      userPosts([]),
    );

    renderProfile({ session: makeSession({ id: USER_ID, username: "moi" }) });

    expect(await screen.findByText(/c'est vous/i)).toBeInTheDocument();
    expect(screen.getByText(/vous n'avez rien publié/i)).toBeInTheDocument();
  });

  test("le profil d'un autre n'est pas présenté comme le sien", async () => {
    server.use(
      http.get("*/users/:id", () => HttpResponse.json(makeUser())),
      userPosts([]),
    );

    renderProfile({ session: makeSession({ id: "quelqu-un-d-autre", username: "bob" }) });

    await screen.findByRole("heading", { name: "alice" });
    expect(screen.queryByText(/c'est vous/i)).not.toBeInTheDocument();
  });
});
