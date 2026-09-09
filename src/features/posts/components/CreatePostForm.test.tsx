import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, test } from "vitest";
import { makePost } from "../../../test/factories";
import { liveObjectUrlCount } from "../../../test/objectUrl.polyfill";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { server } from "../../../test/server";
import { FeedPage } from "../pages/FeedPage";
import { POST_IMAGE_MAX_BYTES, type Post } from "../api/posts.schemas";

/**
 * Mounted inside the feed, as in production: the feed is what subscribes
 * to the cache, so only it can show the post appearing without a reload.
 */
function renderFeedWith(items: ReadonlyArray<Post> = []) {
  server.use(
    http.get("*/posts", () => HttpResponse.json({ items, nextCursor: null })),
  );
  renderWithProviders(<FeedPage />);
}

function messageField(): Promise<HTMLElement> {
  return screen.findByLabelText(/votre message/i);
}

function imageField(): Promise<HTMLElement> {
  return screen.findByLabelText(/image/i);
}

function publishButton(): HTMLElement {
  return screen.getByRole("button", { name: /publier/i });
}

describe("CreatePostForm", () => {
  test("un message vide est refusé côté client, sans appel réseau", async () => {
    renderFeedWith();
    await messageField();

    // No POST handler declared: a request would fail the test.
    await userEvent.setup().click(publishButton());

    expect(await screen.findByText(/ne peut pas être vide/i)).toBeInTheDocument();
  });

  test("le post publié apparaît en tête du fil, en multipart, et vide le formulaire", async () => {
    const existingPost = makePost({ content: "Un post déjà présent" });
    const createdPost = makePost({ content: "Mon tout nouveau post" });
    renderFeedWith([existingPost]);

    // Held in an object: a variable reassigned in a callback would still
    // be typed `null` at the assertion.
    const sent: { body: FormData | null } = { body: null };
    server.use(
      http.post("*/posts", async ({ request }) => {
        sent.body = await request.formData();
        return HttpResponse.json(createdPost, { status: 201 });
      }),
    );

    const user = userEvent.setup();
    await user.type(await messageField(), "Mon tout nouveau post");
    await user.click(publishButton());

    await screen.findByText("Mon tout nouveau post");

    const items = within(
      screen.getByRole("list", { name: /fil d'actualité/i }),
    ).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    // The head of the list, not just somewhere on the page.
    expect(items[0]).toHaveTextContent("Mon tout nouveau post");

    expect(sent.body?.get("content")).toBe("Mon tout nouveau post");
    expect(await messageField()).toHaveValue("");
  });

  test("une image trop volumineuse est refusée sur son champ, sans appel réseau", async () => {
    renderFeedWith();
    const user = userEvent.setup();

    const oversizedImage = new File(
      [new Uint8Array(POST_IMAGE_MAX_BYTES + 1)],
      "panorama.png",
      { type: "image/png" },
    );

    await user.type(await messageField(), "Avec une image géante");
    await user.upload(screen.getByLabelText(/image/i), oversizedImage);
    await user.click(publishButton());

    expect(await screen.findByText(/trop volumineuse/i)).toBeInTheDocument();
  });

  test("l'image choisie est prévisualisée avant l'envoi, et peut être retirée", async () => {
    renderFeedWith();
    const user = userEvent.setup();

    const image = new File([new Uint8Array(64)], "chat.png", { type: "image/png" });
    await user.upload(await imageField(), image);

    // Found by accessible name: the preview must name the file.
    expect(await screen.findByRole("img", { name: /aperçu de chat\.png/i })).toBeInTheDocument();
    expect(liveObjectUrlCount()).toBe(1);

    await user.click(screen.getByRole("button", { name: /retirer l'image/i }));

    expect(screen.queryByRole("img", { name: /aperçu/i })).not.toBeInTheDocument();
    // Revoked, otherwise every file choice would leak a blob.
    expect(liveObjectUrlCount()).toBe(0);
  });

  test("un échec API prévient l'utilisateur et conserve la saisie", async () => {
    renderFeedWith();
    server.use(
      http.post("*/posts", () =>
        HttpResponse.json({ error: "Serveur indisponible" }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    await user.type(await messageField(), "Texte qu'il ne faut pas perdre");
    await user.click(publishButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(/serveur indisponible/i);
    expect(screen.getByDisplayValue("Texte qu'il ne faut pas perdre")).toBeInTheDocument();
  });
});
