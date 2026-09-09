import { Link, useNavigate } from "react-router-dom";
import { toUserMessage } from "../../../shared/api/ApiError";
import {
  apiErrorToFieldErrors,
  type FieldErrorRule,
} from "../../../shared/forms/fieldErrors";
import { useZodForm } from "../../../shared/forms/useZodForm";
import { Button } from "../../../shared/ui/Button/Button";
import { Field } from "../../../shared/ui/Field/Field";
import { useToast } from "../../../shared/ui/Toast/useToast";
import { RegisterSchema } from "../api/auth.schemas";
import { useRegister } from "../hooks/useRegister";
import styles from "./AuthLayout.module.css";

// The backend does not say which field failed, so map the status to one.
const ERROR_RULES: ReadonlyArray<FieldErrorRule> = [
  { status: 409, field: "email", message: "Cet email est déjà utilisé" },
];

export function RegisterForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const registerMutation = useRegister();

  const form = useZodForm({
    schema: RegisterSchema,
    initialValues: { email: "", username: "", password: "" },
    onSubmit: async (values) => {
      await registerMutation.mutateAsync(values);
      navigate("/feed", { replace: true });
    },
    onError: (error) => {
      const fieldErrors = apiErrorToFieldErrors(error, ERROR_RULES);

      // Anything that maps to no field still has to be shown.
      if (Object.keys(fieldErrors).length === 0) {
        showToast({
          variant: "error",
          title: "Inscription impossible",
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
        label="Nom d'utilisateur"
        name="username"
        required
        autoComplete="username"
        maxLength={30}
        value={form.values.username}
        error={form.errors["username"]}
        disabled={form.isSubmitting}
        onValueChange={(value) => form.setField("username", value)}
      />

      <Field
        label="Mot de passe"
        kind="password"
        name="password"
        required
        autoComplete="new-password"
        hint="8 caractères minimum"
        value={form.values.password}
        error={form.errors["password"]}
        disabled={form.isSubmitting}
        onValueChange={(value) => form.setField("password", value)}
      />

      <div className={styles.actions}>
        <Button type="submit" variant="primary" fullWidth disabled={form.isSubmitting}>
          {form.isSubmitting ? "Création du compte…" : "Créer mon compte"}
        </Button>

        <p className={styles.switchLine}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </form>
  );
}
