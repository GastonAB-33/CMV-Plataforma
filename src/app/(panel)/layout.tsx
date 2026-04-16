import { InternalShell } from '@/components/layout/internal-shell';
import { requireAuth } from '@/lib/auth/guards';

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <InternalShell>{children}</InternalShell>;
}
