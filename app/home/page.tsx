'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State baru untuk informasi tambahan
  const [lastSmokeDate, setLastSmokeDate] = useState<string | null>(null);
  const [dailyExpense, setDailyExpense] = useState<number>(30000);
  const [todayDate, setTodayDate] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        alert("Silahkan register/login terlebih dahulu");
        router.push('/');
      } else {
        setUser(user);
        
        // 1. Ambil data profil dari database
        const { data: profileData } = await supabase
          .from('profile')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
        }

        // 2. Tarik informasi tanggal terakhir merokok (tabel public.last_smoke)
        const { data: smokeData } = await supabase
          .from('last_smoke')
          .select('last_smoke')
          .eq('profile_id', user.id)
          .maybeSingle();

        if (smokeData?.last_smoke) {
          // Format tanggal agar lebih manusiawi (Contoh: 14 Juli 2026)
          const formattedSmokeDate = new Date(smokeData.last_smoke).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
          setLastSmokeDate(formattedSmokeDate);
        }

        // 3. Ambil pengeluaran rokok per hari dari Local Storage (Default: Rp30.000)
        const localExpense = localStorage.getItem('daily_smoke_expense');
        if (localExpense) {
          setDailyExpense(Number(localExpense));
        } else {
          // Set default ke local storage jika belum ada
          localStorage.setItem('daily_smoke_expense', '30000');
        }

        // 4. Ambil tanggal hari ini secara client-side
        const today = new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        setTodayDate(today);

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
    transition: 'all 0.2s',
  };

  // Helper untuk format Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

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

      {/* Menu Navigasi Empat Tombol */}
      <nav style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => navigateTo('/home')} 
          style={{ ...navButtonStyle, backgroundColor: '#e6f7ff', borderColor: '#91d5ff', color: '#1890ff' }}
        >
          /home
        </button>
        <button onClick={() => navigateTo('/profil')} style={navButtonStyle}>/profil</button>
        <button onClick={() => navigateTo('/progress')} style={navButtonStyle}>/progress</button>
        <button onClick={() => navigateTo('/exercise')} style={navButtonStyle}>/exercise</button>
      </nav>

      <section style={{ marginTop: '2rem' }}>
        <h3>Selamat Datang kembali, {profile?.full_name || user?.email}!</h3>
        <p>Anda berhasil login ke dalam sistem tracker stop-smoking.</p>

        {/* --- KOTAK INFORMASI BARU YANG DIMINTA --- */}
        <div style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', padding: '15px', borderRadius: '8px', marginTop: '1.5rem' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0050b3' }}>Ringkasan Tracker:</h4>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>📅 <strong>Tanggal Hari Ini:</strong> {todayDate}</li>
            <li>🚬 <strong>Terakhir Merokok:</strong> {lastSmokeDate || 'Belum ada data / Baru mulai'}</li>
            <li>💰 <strong>Anggaran Rokok / Hari:</strong> {formatRupiah(dailyExpense)}</li>
          </ul>
        </div>
        {/* ----------------------------------------- */}

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