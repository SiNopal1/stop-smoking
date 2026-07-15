'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#fffefb', minHeight: '100vh', fontFamily: '"Inter", sans-serif', color: '#201515' }}>
      
      {/* Top Navigation Bar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', maxWidth: '1280px', margin: '0 auto', borderBottom: '1px solid #f8f4f0' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>
          Uncrave<span style={{ color: '#ff4f00' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/login" style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #201515', backgroundColor: 'transparent', color: '#201515', textDecoration: 'none', fontSize: '14.4px', fontWeight: '600' }}>
            Masuk
          </Link>
          <Link href="/register" style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#ff4f00', color: '#fffefb', textDecoration: 'none', fontSize: '14.4px', fontWeight: '600' }}>
            Daftar Baru
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <span style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#f8f4f0', color: '#201515', borderRadius: '9999px', fontSize: '14px', fontWeight: '500', marginBottom: '24px', letterSpacing: '1px', transform: 'uppercase' }}>
          TRANSFORMASI KEBIASAAN SEHAT
        </span>
        <h1 style={{ fontSize: '56px', fontWeight: '500', lineHeight: '1.1', letterSpacing: '-1px', margin: '0 0 24px 0' }}>
          Tekan Kebiasaan Merokok Anda
        </h1>
        <p style={{ fontSize: '20px', lineHeight: '1.5', color: '#605d52', margin: '0 0 40px 0', padding: '0 20px' }}>
          Ubah dorongan merokok menjadi energi positif. Pantau waktu bersih Anda, kelola craving melalui latihan fisik terukur, dan hitung kalori yang terbakar secara real-time demi tubuh yang lebih sehat.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ padding: '16px 32px', borderRadius: '12px', backgroundColor: '#ff4f00', color: '#fffefb', textDecoration: 'none', fontSize: '18px', fontWeight: '600', transition: 'background-color 0.2s' }}>
            Uncrave Sekarang
          </Link>
        </div>
      </header>

      {/* Footer */}
      <footer style={{ backgroundColor: '#201515', color: '#f8f4f0', padding: '48px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', fontSize: '14px' }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: '600' }}>Uncrave Tracker Platform</p>
          <p style={{ color: '#939084', margin: 0 }}>&copy; 2026. Mengubah kebiasaan lama menjadi disiplin baru.</p>
        </div>
      </footer>

    </div>
  );
}