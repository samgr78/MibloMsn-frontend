import { AuthLayout } from "../components/AuthLayout";
import { RegisterForm } from "../components/RegisterForm";

export function RegisterPage() {
  return (
    <AuthLayout title="Créer un compte" tagline="Rejoignez la conversation">
      <RegisterForm />
    </AuthLayout>
  );
}
