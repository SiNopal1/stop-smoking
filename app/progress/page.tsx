'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Progress() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        alert("Silahkan register/login terlebih dahulu");
        router.push('/');
      } else {
        setUser(user);
        
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

  const navigateTo = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>Memuat halaman...</p>
      </div>
    );
  }

  const navButtonStyle = {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    color: '#333',
    cursor: 'pointer',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center' as const,
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h2>Progress Tracker</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#ff4d4f', color: '#fff', cursor: 'pointer' }}>
          Keluar (Logout)
        </button>
      </header>

      {/* Navigasi */}
      <nav style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigateTo('/home')} style={navButtonStyle}>/home</button>
        <button onClick={() => navigateTo('/profil')} style={navButtonStyle}>/profil</button>
        <button onClick={() => navigateTo('/progress')} style={{ ...navButtonStyle, backgroundColor: '#e6f7ff', borderColor: '#91d5ff', color: '#1890ff' }}>/progress</button>
        <button onClick={() => navigateTo('/exercise')} style={navButtonStyle}>/exercise</button>
      </nav>

      <section style={{ marginTop: '2rem' }}>
        <h3>Statistik Berhenti Merokok</h3>
        <p>Halo {profile?.full_name || 'User'}, berikut adalah pencapaian klinis Anda sejauh ini:</p>

        {/* Placeholder Box Statistik */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '1.5rem' }}>
          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#52c41a' }}>0 Hari</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#666' }}>Waktu Bebas Asap</p>
          </div>
          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1890ff' }}>Rp 0</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#666' }}>Uang yang Dihemat</p>
          </div>
        </div>
      </section>
    </main>
  );
}