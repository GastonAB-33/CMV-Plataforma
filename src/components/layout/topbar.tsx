import { getSession } from '@/lib/auth/session';
import { LogoutButton } from '@/components/layout/logout-button';

export async function Topbar() {
  const session = await getSession();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <div>
        <p className="text-sm text-slate-500">Panel interno</p>
        {session ? (
          <p className="text-sm font-medium text-slate-700">
            {session.nombre || session.email} · {session.rol}
          </p>
        ) : null}
      </div>
      <LogoutButton />
    </header>
  );
}
