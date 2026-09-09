import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, test } from "vitest";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { server } from "../../../test/server";
import { RegisterPage } from "../pages/RegisterPage";

async function fillValidForm(): Promise<void> {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/adresse email/i), "alice@test.com");
  await user.type(screen.getByLabelText(/nom d'utilisateur/i), "alice");
  await user.type(screen.getByLabelText(/mot de passe/i), "password123");
  await user.click(screen.getByRole("button", { name: /créer mon compte/i }));
}

describe("RegisterForm", () => {
  test("valide les champs côté front avant tout appel réseau", async () => {
    // No handler declared: a request going out would fail the test.
    renderWithProviders(<RegisterPage />);

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /créer mon compte/i }));

    expect(await screen.findByText(/adresse email invalide/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/adresse email/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("affiche une erreur sur le champ email quand l'API renvoie 409", async () => {
    server.use(
      http.post("*/auth/register", () =>
        HttpResponse.json({ error: "Email already used" }, { status: 409 }),
      ),
    );

    renderWithProviders(<RegisterPage />);
    await fillValidForm();

    expect(await screen.findByText(/cet email est déjà utilisé/i)).toBeInTheDocument();
  });

  test("conserve les valeurs saisies quand l'API échoue", async () => {
    server.use(
      http.post("*/auth/register", () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );

    renderWithProviders(<RegisterPage />);
    await fillValidForm();

    // A network failure must not empty the form.
    expect(await screen.findByDisplayValue("alice@test.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("alice")).toBeInTheDocument();
  });

  test("rejette une réponse au mauvais format plutôt que de la propager", async () => {
    // A 200 without a token is structurally invalid: it must surface as an error.
    server.use(
      http.post("*/auth/register", () => HttpResponse.json({ user: { id: "1" } })),
    );

    renderWithProviders(<RegisterPage />);
    await fillValidForm();

    expect(await screen.findByRole("alert")).toHaveTextContent(/inattendue/i);
  });
});
