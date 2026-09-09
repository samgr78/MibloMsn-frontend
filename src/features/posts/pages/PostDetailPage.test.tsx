import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";
import { makePost } from "../../../test/factories";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { server } from "../../../test/server";
import { CreatePostSchema, type Comment, type PostDetail } from "../api/posts.schemas";
import { PostDetailPage } from "./PostDetailPage";

const POST_ID = "post-detail-1";

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: "comment-1",
    content: "Un commentaire existant",
    createdAt: new Date().toISOString(),
    author: { id: "user-9", username: "bob" },
    ...overrides,
  };
}

function makeDetail(overrides: Partial<PostDetail> = {}): PostDetail {
  return { ...makePost({ id: POST_ID }), comments: [], ...overrides };
}

function renderDetail() {
  return renderWithProviders(
    <Routes>
      <Route path="/posts/:postId" element={<PostDetailPage />} />
    </Routes>,
    { route: `/posts/${POST_ID}` },
  );
}

describe("PostDetailPage — états d'écran", () => {
  test("loading avant la réponse", async () => {
    server.use(
      http.get("*/posts/:id", async () => {
        await delay("infinite");
        return HttpResponse.json({});
      }),
    );

    renderDetail();

    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  test("un post inexistant affiche une absence, pas une erreur technique", async () => {
    server.use(
      http.get("*/posts/:id", () =>
        HttpResponse.json({ error: "Post introuvable" }, { status: 404 }),
      ),
    );

    renderDetail();

    expect(await screen.findByText(/ce post n'existe plus/i)).toBeInTheDocument();
    // Retrying a deleted post would fail the same way.
    expect(screen.queryByRole("button", { name: /réessayer/i })).not.toBeInTheDocument();
  });

  test("une panne serveur affiche bien une erreur avec Réessayer", async () => {
    server.use(
      http.get("*/posts/:id", () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );

    renderDetail();

    expect(await screen.findByRole("alert")).toHaveTextContent(/erreur/i);
    expect(screen.getByRole("button", { name: /réessayer/i })).toBeInTheDocument();
  });

  test("success : le post et ses commentaires sont affichés", async () => {
    server.use(
      http.get("*/posts/:id", () =>
        HttpResponse.json(
          makeDetail({ content: "Le contenu du post", comments: [makeComment()], commentCount: 1 }),
        ),
      ),
    );

    renderDetail();

    expect(await screen.findByText("Le contenu du post")).toBeInTheDocument();
    const list = screen.getByRole("list", { name: /commentaires/i });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
  });

  test("un post sans commentaire l'annonce explicitement", async () => {
    server.use(http.get("*/posts/:id", () => HttpResponse.json(makeDetail())));

    renderDetail();

    expect(await screen.findByText(/aucun commentaire/i)).toBeInTheDocument();
  });
});

describe("PostDetailPage — ajout de commentaire", () => {
  test("le commentaire s'ajoute à la liste sans rechargement", async () => {
    server.use(
      http.get("*/posts/:id", () => HttpResponse.json(makeDetail())),
      http.post("*/posts/:id/comments", async ({ request }) => {
        // The real schema, so the handler also checks what the front sends.
        const { content } = CreatePostSchema.parse(await request.json());
        return HttpResponse.json(makeComment({ id: "comment-neuf", content }));
      }),
    );

    renderDetail();
    const user = userEvent.setup();

    await user.type(
      await screen.findByLabelText(/votre commentaire/i),
      "Mon nouveau commentaire",
    );
    await user.click(screen.getByRole("button", { name: /^commenter$/i }));

    expect(await screen.findByText("Mon nouveau commentaire")).toBeInTheDocument();
  });

  test("un commentaire vide est refusé côté front, sans appel réseau", async () => {
    server.use(http.get("*/posts/:id", () => HttpResponse.json(makeDetail())));

    renderDetail();

    await screen.findByLabelText(/votre commentaire/i);
    // No POST handler: a request going out would fail the test.
    await userEvent.setup().click(screen.getByRole("button", { name: /^commenter$/i }));

    expect(await screen.findByText(/ne peut pas être vide/i)).toBeInTheDocument();
  });

  test("un échec API prévient l'utilisateur et conserve la saisie", async () => {
    server.use(
      http.get("*/posts/:id", () => HttpResponse.json(makeDetail())),
      http.post("*/posts/:id/comments", () =>
        HttpResponse.json({ error: "Serveur indisponible" }, { status: 500 }),
      ),
    );

    renderDetail();
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText(/votre commentaire/i), "Texte précieux");
    await user.click(screen.getByRole("button", { name: /^commenter$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/serveur indisponible/i);
    expect(screen.getByDisplayValue("Texte précieux")).toBeInTheDocument();
  });
});
