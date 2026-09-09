import { Link } from "react-router-dom";
import { toUserMessage } from "../../../shared/api/ApiError";
import {
  apiErrorToFieldErrors,
  type FieldErrorRule,
} from "../../../shared/forms/fieldErrors";
import { useZodForm } from "../../../shared/forms/useZodForm";
import { Button } from "../../../shared/ui/Button/Button";
import { Field } from "../../../shared/ui/Field/Field";
import { useToast } from "../../../shared/ui/Toast/useToast";
import { LoginSchema } from "../api/auth.schemas";
import { useLogin } from "../hooks/useLogin";
import styles from "./AuthLayout.module.css";

const ERROR_RULES: ReadonlyArray<FieldErrorRule> = [
  { status: 401, field: "password", message: "Email ou mot de passe incorrect" },
];

export function LoginForm() {
  const { showToast } = useToast();
  const loginMutation = useLogin();

  const form = useZodForm({
    schema: LoginSchema,
    initialValues: { email: "", password: "" },
    // No imperative navigation: once the session is set, `GuestRoute`
    // moves the user on. One redirect, so no race.
    onSubmit: (values) => loginMutation.mutateAsync(values).then(() => undefined),
    onError: (error) => {
      const fieldErrors = apiErrorToFieldErrors(error, ERROR_RULES);

      if (Object.keys(fieldErrors).length === 0) {
        showToast({
          variant: "error",
          title: "Connexion impossible",
          message: toUserMessage(error),
        });
      }

      return fieldErrors;
    },
  });

  return (
    <form className={styles.form} onSubmit={form.handleSubmit} noValidate>
      <Field
        label="Adresse email"
        kind="email"
        name="email"
        required
        autoComplete="email"
        placeholder="vous@exemple.com"
        value={form.values.email}
        error={form.errors["email"]}
        disabled={form.isSubmitting}
        onValueChange={(value) => form.setField("email", value)}
      />

      <Field
        label="Mot de passe"
        kind="password"
        name="password"
        required
        autoComplete="current-password"
        value={form.values.password}
        error={form.errors["password"]}
        disabled={form.isSubmitting}
        onValueChange={(value) => form.setField("password", value)}
      />

      <div className={styles.actions}>
        <Button type="submit" variant="primary" fullWidth disabled={form.isSubmitting}>
          {form.isSubmitting ? "Connexion…" : "Se connecter"}
        </Button>

        <p className={styles.switchLine}>
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </form>
  );
}
