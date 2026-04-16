import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CMV Seguimiento',
  description: 'Aplicación interna para seguimiento de líderes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
