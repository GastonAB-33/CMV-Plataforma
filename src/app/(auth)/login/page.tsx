import { Card } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { redirectIfAuthenticated } from '@/lib/auth/guards';

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Acceso interno</h1>
          <p className="text-sm text-slate-600">
            Ingresa con tu email autorizado en la hoja de Usuarios.
          </p>
        </div>

        <LoginForm />
      </Card>
    </main>
  );
}
