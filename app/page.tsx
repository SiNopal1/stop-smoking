import Link from 'next/link';

export default function LandingPage() {
  return (
    <html>
    <body>
    <main style={{ padding: '2rem' }}>
      <h1>Selamat Datang di Aplikasi Tracker</h1>
      <p>Silakan pilih tindakan di bawah ini:</p>
      <ul>
        <li>
          <Link href="/login">Login ke Akun</Link>
        </li>
        <li>
          <Link href="/register">Daftar Akun Baru</Link>
        </li>
      </ul>
    </main>
    </body>
    </html>
  );
}