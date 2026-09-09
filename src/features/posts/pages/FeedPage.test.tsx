import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, test } from "vitest";
import { firstOf, makePosts } from "../../../test/factories";
import { triggerIntersection } from "../../../test/intersectionObserver.mock";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { server } from "../../../test/server";
import { FeedPage } from "./FeedPage";

type FeedBody = { items: unknown[]; nextCursor: string | null };

function respondWith(body: FeedBody) {
  return http.get("*/posts", () => HttpResponse.json(body));
}

function respondWithStatus(status: number) {
  return http.get("*/posts", () => HttpResponse.json({ error: "boom" }, { status }));
}

describe("FeedPage — les 4 états d'écran", () => {
  test("loading : un indicateur de chargement avant la réponse", async () => {
    server.use(
      http.get("*/posts", async () => {
        await delay("infinite");
        return HttpResponse.json({ items: [], nextCursor: null });
      }),
    );

    renderWithProviders(<FeedPage />);

    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  test("error : un message affiché avec un bouton Réessayer, jamais un écran blanc", async () => {
    server.use(respondWithStatus(500));

    renderWithProviders(<FeedPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/erreur/i);
    expect(screen.getByRole("button", { name: /réessayer/i })).toBeInTheDocument();
  });

  test("empty : un message dédié quand la liste est vide", async () => {
    server.use(respondWith({ items: [], nextCursor: null }));

    renderWithProviders(<FeedPage />);

    expect(await screen.findByText(/aucun post pour le moment/i)).toBeInTheDocument();
  });

  test("success : les posts sont affichés", async () => {
    const posts = makePosts(3);
    server.use(respondWith({ items: posts, nextCursor: null }));

    renderWithProviders(<FeedPage />);

    const list = await screen.findByRole("list", { name: /fil d'actualité/i });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText(firstOf(posts).content)).toBeInTheDocument();
  });
});

describe("FeedPage — validation de la réponse", () => {
  test("une réponse au mauvais format produit une erreur, pas un crash", async () => {
    // `likeCount` as a string: the schema must reject it.
    const malformed = { ...firstOf(makePosts(1)), likeCount: "beaucoup" };
    server.use(respondWith({ items: [malformed], nextCursor: null }));

    renderWithProviders(<FeedPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/inattendue/i);
  });
});

describe("FeedPage — pagination", () => {
  const firstPage = makePosts(3);
  const secondPage = makePosts(2);

  function paginatedHandler() {
    return http.get("*/posts", ({ request }) => {
      const cursor = new URL(request.url).searchParams.get("cursor");
      return cursor === null
        ? HttpResponse.json({ items: firstPage, nextCursor: "curseur-page-2" })
        : HttpResponse.json({ items: secondPage, nextCursor: null });
    });
  }

  test("la sentinelle déclenche le chargement de la page suivante", async () => {
    server.use(paginatedHandler());
    renderWithProviders(<FeedPage />);

    await screen.findByText(firstOf(firstPage).content);
    triggerIntersection();

    expect(await screen.findByText(firstOf(secondPage).content)).toBeInTheDocument();
  });

  test("charger la page suivante ne démonte pas les posts déjà affichés", async () => {
    server.use(paginatedHandler());
    renderWithProviders(<FeedPage />);

    const firstRenderedPost = await screen.findByText(firstOf(firstPage).content);

    triggerIntersection();
    await screen.findByText(firstOf(secondPage).content);

    // Same DOM node: the list did not flicker.
    expect(firstRenderedPost).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(
      firstPage.length + secondPage.length,
    );
  });

  test("le bouton Charger plus fait la même chose que le défilement", async () => {
    server.use(paginatedHandler());
    renderWithProviders(<FeedPage />);

    await screen.findByText(firstOf(firstPage).content);
    await userEvent.setup().click(screen.getByRole("button", { name: /charger plus/i }));

    expect(await screen.findByText(firstOf(secondPage).content)).toBeInTheDocument();
  });

  test("la fin de liste est annoncée quand il n'y a plus de page", async () => {
    server.use(respondWith({ items: makePosts(2), nextCursor: null }));
    renderWithProviders(<FeedPage />);

    await waitFor(() => {
      expect(screen.getByText(/vous avez tout vu/i)).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: /charger plus/i }),
    ).not.toBeInTheDocument();
  });
});
