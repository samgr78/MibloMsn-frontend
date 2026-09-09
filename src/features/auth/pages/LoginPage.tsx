import { AuthLayout } from "../components/AuthLayout";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <AuthLayout title="Connexion" tagline="Vos amis vous attendent en ligne">
      <LoginForm />
    </AuthLayout>
  );
}
