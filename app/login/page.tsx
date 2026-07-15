'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(''); // Bisa username atau email
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let email = identifier.trim();

      // Cek apakah input berupa email (mengandung karakter @)
      const isEmail = email.includes('@');

      if (!isEmail) {
        // 1 & 2. Cari username dan ambil email serta id di public.profile
        const { data: profile, error: profileError } = await supabase
          .from('profile')
          .select('id, email')
          .eq('username', email) // 'email' di sini adalah variabel input username dari user
          .maybeSingle();

        if (profileError) {
          throw new Error('Gagal memeriksa username: ' + profileError.message);
        }

        // Jika profile tidak ditemukan sama sekali
        if (!profile) {
          throw new Error('Username tidak ditemukan!');
        }

        // Jika profile ada tapi email-nya kosong/belum diverifikasi
        if (!profile.email) {
          throw new Error('Username ditemukan, tetapi tidak ada email yang terikat.');
        }

        // Jika ketemu, oper email dari public.profile ke variabel login
        email = profile.email;
      }

      // Lakukan login dengan email & password menggunakan Supabase auth
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Arahkan ke halaman home jika login berhasil
      router.push('/home');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fffefb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: '"Inter", sans-serif' }}>
      <main style={{ width: '100%', maxWidth: '450px', backgroundColor: '#f8f4f0', padding: '32px', borderRadius: '12px', color: '#201515' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '500', margin: '0 0 8px 0', letterSpacing: '-0.6px' }}>Masuk ke Akun</h2>
        <p style={{ color: '#605d52', fontSize: '16px', margin: '0 0 24px 0' }}>Selamat datang kembali. Silakan masukkan kredensial Anda.</p>
        
        {errorMsg && (
          <div style={{ backgroundColor: '#fffefb', border: '1px solid #ff4f00', color: '#ff4f00', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Username atau Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #201515', backgroundColor: '#fffefb', color: '#201515', boxSizing: 'border-box', fontSize: '16px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #201515', backgroundColor: '#fffefb', color: '#201515', boxSizing: 'border-box', fontSize: '16px' }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              borderRadius: '12px', 
              border: 'none', 
              backgroundColor: '#ff4f00', 
              color: '#fffefb', 
              fontSize: '18px', 
              fontWeight: '600', 
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid #c5c0b1', marginTop: '24px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '16px', color: '#605d52' }}>
            Belum punya akun?{' '}
            <Link href="/register" style={{ color: '#ff4f00', fontWeight: '600', textDecoration: 'none' }}>
              Daftar di sini
            </Link>
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
            <Link href="/" style={{ color: '#939084', textDecoration: 'none' }}>
              ← Kembali ke Beranda
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}