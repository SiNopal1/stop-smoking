'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // Redirect malisious/unauthenticated users back to landing page
        router.push('/');
      } else {
        setUser(user);
        
        // Ambil data profil dari database untuk menyambut pengguna
        const { data: profileData } = await supabase
          .from('profile')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
        }
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>Memuat halaman...</p>
      </div>
    );
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h2>Dashboard Utama</h2>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '8px 16px', 
            borderRadius: '4px', 
            border: 'none', 
            backgroundColor: '#ff4d4f', 
            color: '#fff', 
            cursor: 'pointer' 
          }}
        >
          Keluar (Logout)
        </button>
      </header>

      <section style={{ marginTop: '2rem' }}>
        <h3>Selamat Datang kembali, {profile?.full_name || user?.email}!</h3>
        <p>Anda berhasil login ke dalam sistem tracker stop-smoking.</p>

        <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginTop: '1.5rem' }}>
          <h4>Detail Akun Anda:</h4>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li><strong>Nama Lengkap:</strong> {profile?.full_name || '-'}</li>
            <li><strong>Username:</strong> {profile?.username || '-'}</li>
            <li><strong>Email:</strong> {user?.email}</li>
            <li><strong>UID Pengguna:</strong> {user?.id}</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
