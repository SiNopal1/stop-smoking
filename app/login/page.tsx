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
        // Jika bukan email, cari email berdasarkan username di tabel profile
        const { data, error } = await supabase
          .from('profile')
          .select('email')
          .eq('username', email)
          .maybeSingle();

        if (error) {
          throw new Error('Gagal memeriksa username: ' + error.message);
        }

        if (!data || !data.email) {
          throw new Error('Username tidak ditemukan!');
        }

        email = data.email;
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
    <main style={{ padding: '2rem', maxWidth: '320px', margin: '0 auto' }}>
      <h2>Masuk ke Akun</h2>
      {errorMsg && (
        <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
          {errorMsg}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="Username atau Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px', 
            borderRadius: '4px', 
            border: 'none', 
            backgroundColor: '#0070f3', 
            color: '#fff', 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
      <p style={{ marginTop: '15px', fontSize: '14px' }}>
        Belum punya akun? <Link href="/register" style={{ color: '#0070f3' }}>Daftar di sini</Link>
      </p>
      <p style={{ fontSize: '14px' }}>
        <Link href="/" style={{ color: '#666' }}>Kembali ke Beranda</Link>
      </p>
    </main>
  );
}
