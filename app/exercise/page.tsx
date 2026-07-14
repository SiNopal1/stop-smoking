'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Exercise() {
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
        <h2>Craving Exercise</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#ff4d4f', color: '#fff', cursor: 'pointer' }}>
          Keluar (Logout)
        </button>
      </header>

      {/* Navigasi */}
      <nav style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigateTo('/home')} style={navButtonStyle}>/home</button>
        <button onClick={() => navigateTo('/profil')} style={navButtonStyle}>/profil</button>
        <button onClick={() => navigateTo('/progress')} style={navButtonStyle}>/progress</button>
        <button onClick={() => navigateTo('/exercise')} style={{ ...navButtonStyle, backgroundColor: '#e6f7ff', borderColor: '#91d5ff', color: '#1890ff' }}>/exercise</button>
      </nav>

      <section style={{ marginTop: '2rem' }}>
        <h3>Latihan Penahan Hasrat Merokok</h3>
        <p>Saat hasrat merokok melanda, coba lakukan latihan relaksasi pernapasan 4-7-8 untuk menenangkan sistem saraf Anda.</p>
        
        <div style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', padding: '15px', borderRadius: '8px', marginTop: '1.5rem' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#d46b08' }}>Tips Cepat:</h4>
          <ol style={{ paddingLeft: '20px', margin: 0 }}>
            <li>Tarik napas lewat hidung dalam 4 detik.</li>
            <li>Tahan napas Anda selama 7 detik.</li>
            <li>Hembuskan perlahan lewat mulut penuh dalam 8 detik.</li>
          </ol>
        </div>
      </section>
    </main>
  );
}