import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, test } from "vitest";
import {
  AuthRoutes,
  OTHER_PROTECTED_LABEL,
  PROTECTED_LABEL,
} from "../../../test/authRoutes";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { server } from "../../../test/server";
import { readSession } from "../session.storage";

const SESSION = { token: "jeton-valide", user: { id: "user-1", username: "alice" } };

/** Sign-in is judged by what it unlocks, not by the form alone. */
function renderFrom(route = "/login") {
  renderWithProviders(<AuthRoutes />, { route });
}

async function submitLogin(email = "alice@test.com", password = "password123") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/adresse email/i), email);
  await user.type(screen.getByLabelText(/mot de passe/i), password);
  await user.click(screen.getByRole("button", { name: /se connecter/i }));
}

describe("LoginForm", () => {
  test("valide les champs côté front avant tout appel réseau", async () => {
    // No handler declared: a request going out would fail the test.
    renderFrom();

    await userEvent.setup().click(screen.getByRole("button", { name: /se connecter/i }));

    expect(await screen.findByText(/adresse email invalide/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/adresse email/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("une connexion réussie persiste la session et ouvre l'espace protégé", async () => {
    server.use(http.post("*/auth/login", () => HttpResponse.json(SESSION)));

    renderFrom();
    await submitLogin();

    expect(await screen.findByText(PROTECTED_LABEL)).toBeInTheDocument();
    // Persisted, so still there on the next page load.
    expect(readSession()).toEqual(SESSION);
  });

  test("un mot de passe invalide s'affiche sur le champ, sans déconnexion en boucle", async () => {
    server.use(
      http.post("*/auth/login", () =>
        HttpResponse.json({ error: "Identifiants invalides" }, { status: 401 }),
      ),
    );

    renderFrom();
    await submitLogin();

    // Here a 401 means bad credentials, not an expired session: it must
    // not sign the user out and redirect to /login from /login.
    expect(await screen.findByText(/email ou mot de passe incorrect/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByDisplayValue("alice@test.com")).toBeInTheDocument();
    expect(readSession()).toBeNull();
  });

  test("une panne serveur prévient l'utilisateur et conserve la saisie", async () => {
    server.use(
      http.post("*/auth/login", () =>
        HttpResponse.json({ error: "Serveur indisponible" }, { status: 500 }),
      ),
    );

    renderFrom();
    await submitLogin();

    expect(await screen.findByRole("alert")).toHaveTextContent(/serveur indisponible/i);
    expect(screen.getByDisplayValue("alice@test.com")).toBeInTheDocument();
  });

  test("après une redirection, la connexion ramène sur la page demandée", async () => {
    server.use(http.post("*/auth/login", () => HttpResponse.json(SESSION)));

    // A protected page other than the default target, so this can fail.
    renderFrom("/parametres");
    await screen.findByRole("button", { name: /se connecter/i });
    await submitLogin();

    expect(await screen.findByText(OTHER_PROTECTED_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(PROTECTED_LABEL)).not.toBeInTheDocument();
  });
});
