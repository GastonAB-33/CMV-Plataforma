import Link from 'next/link';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/hermanos', label: 'Hermanos' },
  { href: '/seguimiento', label: 'Seguimiento' },
  { href: '/eventos', label: 'Eventos y Noticias' },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-white p-4">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-slate-500">Interno</p>
        <p className="text-lg font-semibold">CMV Seguimiento</p>
      </div>

      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
