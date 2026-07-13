import { ReactNode } from 'react';

export const metadata = {
  title: 'Stop Smoking Tracker',
  description: 'Track your stop smoking progress with Supabase',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
