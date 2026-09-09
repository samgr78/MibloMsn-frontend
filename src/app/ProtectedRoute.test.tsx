import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import { readSession, writeSession } from "../features/auth/session.storage";
import { fetchJson } from "../shared/api/http";
import { AuthRoutes, PROTECTED_LABEL } from "../test/authRoutes";
import { renderWithProviders } from "../test/renderWithProviders";
import { server } from "../test/server";

/** Written out on purpose: these tests act as a user hand-editing storage. */
const STORAGE_KEY = "miblomsn.session";

const SESSION = { token: "jeton-valide", user: { id: "user-1", username: "alice" } };

function renderFrom(route: string) {
  renderWithProviders(<AuthRoutes />, { route });
}

function loginButton() {
  return screen.queryByRole("button", { name: /se connecter/i });
}

describe("ProtectedRoute", () => {
  test("un visiteur sans session est renvoyé sur la connexion", async () => {
    renderFrom("/feed");

    expect(
      await screen.findByRole("button", { name: /se connecter/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(PROTECTED_LABEL)).not.toBeInTheDocument();
  });

  test("une session déjà stockée ouvre l'accès sans passer par la connexion", () => {
    writeSession(SESSION);

    renderFrom("/feed");

    // Synchronous on purpose: a brief flash through /login would fail this.
    expect(screen.getByText(PROTECTED_LABEL)).toBeInTheDocument();
    expect(loginButton()).not.toBeInTheDocument();
  });

  test("un utilisateur connecté n'a rien à faire sur la page de connexion", async () => {
    writeSession(SESSION);

    renderFrom("/login");

    expect(await screen.findByText(PROTECTED_LABEL)).toBeInTheDocument();
  });
});

describe("Session stockée — contenu invalide", () => {
  test("une session modifiée à la main est refusée et effacée", async () => {
    // Token removed: the shape no longer matches SessionSchema.
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: { id: "user-1", username: "alice" } }),
    );

    renderFrom("/feed");

    expect(
      await screen.findByRole("button", { name: /se connecter/i }),
    ).toBeInTheDocument();
    // Wiped, not just ignored: it must not be reused.
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test("une session illisible ne fait pas planter l'application", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{ ceci n'est pas du JSON");

    renderFrom("/feed");

    expect(
      await screen.findByRole("button", { name: /se connecter/i }),
    ).toBeInTheDocument();
  });
});

describe("Session expirée", () => {
  test("un 401 sur une route protégée déconnecte et ramène sur la connexion", async () => {
    writeSession(SESSION);
    server.use(
      http.get("*/protege", () =>
        HttpResponse.json({ error: "Token invalide" }, { status: 401 }),
      ),
    );

    renderFrom("/feed");
    expect(screen.getByText(PROTECTED_LABEL)).toBeInTheDocument();

    // Triggered through the real network layer, so the actual wiring is
    // what gets checked, not a stand-in.
    await expect(fetchJson("/protege", { schema: z.unknown() })).rejects.toThrow();

    await waitFor(() => {
      expect(loginButton()).toBeInTheDocument();
    });
    expect(readSession()).toBeNull();
  });
});
