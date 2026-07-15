'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2'; // Mengimpor SweetAlert2

// Impor data dari berkas JSON eksternal
import timelineBenefits from './timeline.json';
import dailyContent from './content.json';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State asli
  const [lastSmokeDate, setLastSmokeDate] = useState<string | null>(null);
  const [dailyExpense, setDailyExpense] = useState<number>(30000);
  const [todayDate, setTodayDate] = useState<string>('');

  // State backend JSON
  const [challenge, setChallenge] = useState<string>('Tidak ada challenge hari ini.');
  const [motivation, setMotivation] = useState<string>('Tetap semangat!');
  const [totalMsElapsed, setTotalMsElapsed] = useState<number>(0);

  // State real-time streak & money saved
  const [rawLastSmokeDate, setRawLastSmokeDate] = useState<Date | null>(null);
  const [moneySaved, setMoneySaved] = useState<number>(0);
  const [streak, setStreak] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

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

        // 2. Tarik informasi tanggal terakhir merokok
        const { data: smokeData } = await supabase
          .from('last_smoke')
          .select('last_smoke')
          .eq('profile_id', user.id)
          .maybeSingle();

        if (smokeData?.last_smoke) {
          const smokeDateObj = new Date(smokeData.last_smoke);
          setRawLastSmokeDate(smokeDateObj);
          
          const formattedSmokeDate = smokeDateObj.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
          setLastSmokeDate(formattedSmokeDate);
        }

        // 3. Ambil pengeluaran rokok per hari dari Local Storage
        const localExpense = localStorage.getItem('daily_smoke_expense');
        if (localExpense) {
          setDailyExpense(Number(localExpense));
        } else {
          localStorage.setItem('daily_smoke_expense', '30000');
        }

        // 4. Logika Konten Harian (Day of Year)
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 0);
        const diffTime = today.getTime() - startOfYear.getTime();
        const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const dayKey = dayOfYear.toString();

        if ((dailyContent as any)[dayKey]) {
          setChallenge((dailyContent as any)[dayKey].challenge);
          setMotivation((dailyContent as any)[dayKey].motivation);
        }

        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // --- TIMER EFFECT: UPDATE CLIENT-SIDE REAL-TIME SETIAP 1 DETIK ---
  useEffect(() => {
    if (loading) return;

    const updateTicker = () => {
      const now = new Date();

      setTodayDate(now.toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }) + ' WIB');

      if (rawLastSmokeDate) {
        const msDiff = now.getTime() - rawLastSmokeDate.getTime();
        const safeMsDiff = msDiff > 0 ? msDiff : 0;
        setTotalMsElapsed(safeMsDiff);

        // 1. Hitung Uang Dihemat
        const daysElapsed = safeMsDiff / (1000 * 60 * 60 * 24);
        setMoneySaved(daysElapsed * dailyExpense);

        // 2. Kalkulasi Breakdown Streak
        let years = now.getFullYear() - rawLastSmokeDate.getFullYear();
        let months = now.getMonth() - rawLastSmokeDate.getMonth();
        let days = now.getDate() - rawLastSmokeDate.getDate();
        let hours = now.getHours() - rawLastSmokeDate.getHours();
        let minutes = now.getMinutes() - rawLastSmokeDate.getMinutes();
        let seconds = now.getSeconds() - rawLastSmokeDate.getSeconds();

        if (seconds < 0) { seconds += 60; minutes--; }
        if (minutes < 0) { minutes += 60; hours--; }
        if (hours < 0) { hours += 24; days--; }
        if (days < 0) {
          const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
          days += prevMonthDays;
          months--;
        }
        if (months < 0) { months += 12; years--; }

        setStreak({ years, months, days, hours, minutes, seconds });
      }
    };

    updateTicker();
    const intervalId = setInterval(updateTicker, 1000);

    return () => clearInterval(intervalId);
  }, [loading, rawLastSmokeDate, dailyExpense]);

  // --- FITUR BARU: RESET COUNTER TANGGAL TERAKHIR MEROKOK ---
  const handleResetCounter = async () => {
    if (!user) return;

    // Tampilkan dialog konfirmasi SweetAlert
    Swal.fire({
      title: 'Apakah anda yakin?',
      text: 'Streak bebas rokok Anda akan diulang dari detik ini!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4d4f',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Reset!',
      cancelButtonText: 'Tidak',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const now = new Date();

          // Kirim update ke database Supabase (menggunakan upsert agar aman jika baris belum ada)
          const { error } = await supabase
            .from('last_smoke')
            .upsert(
              { 
                profile_id: user.id, 
                last_smoke: now.toISOString() 
              }, 
              { onConflict: 'profile_id' }
            );

          if (error) throw error;

          // Perbarui state lokal agar UI langsung bereaksi secara real-time
          setRawLastSmokeDate(now);
          setLastSmokeDate(
            now.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          );

          // Beritahu pengguna bahwa proses berhasil
          Swal.fire({
            title: 'Berhasil di-reset!',
            text: 'Mulai petualangan sehatmu kembali dari sekarang. Semangat!',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false
          });

        } catch (err: any) {
          console.error(err);
          Swal.fire(
            'Gagal!',
            'Gagal memperbarui data tracker. Silakan coba lagi nanti.',
            'error'
          );
        }
      }
    });
  };

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

      {/* Menu Navigasi */}
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

        {/* --- KOTAK INFORMASI TRACKER --- */}
        <div style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', padding: '15px', borderRadius: '8px', marginTop: '1.5rem' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0050b3' }}>Ringkasan Tracker:</h4>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>📅 <strong>Tanggal Hari Ini:</strong> {todayDate}</li>
            <li>🚬 <strong>Terakhir Merokok:</strong> {lastSmokeDate || 'Belum ada data / Baru mulai'}</li>
            <li>💰 <strong>Anggaran Rokok / Hari:</strong> {formatRupiah(dailyExpense)}</li>
            
            <li style={{ borderTop: '1px dashed #91d5ff', paddingTop: '8px', marginTop: '4px' }}>
              ⏱️ <strong>Streak Bebas Rokok:</strong>{' '}
              {rawLastSmokeDate ? (
                <span style={{ fontWeight: 'bold' }}>
                  {streak.years} Tahun, {streak.months} Bulan, {streak.days} Hari, {streak.hours} Jam, {streak.minutes} Menit, {streak.seconds} Detik
                </span>
              ) : (
                'Menghitung...'
              )}
            </li>
            <li>
              💸 <strong>Total Uang Dihemat:</strong>{' '}
              <span style={{ fontWeight: 'bold', color: '#389e0d' }}>
                {formatRupiah(moneySaved)}
              </span>
            </li>
          </ul>

          {/* Tombol Reset Counter */}
          <button
            onClick={handleResetCounter}
            style={{
              marginTop: '15px',
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ff4d4f',
              backgroundColor: '#fff1f0',
              color: '#ff4d4f',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ffccc7')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fff1f0')}
          >
            🔄 Reset Timer Merokok (Gagal Tahan Godaan)
          </button>
        </div>

        {/* --- INTEGRASI ELEMEN KONTEN HARIAN --- */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '1.5rem' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>🎯 Tantangan & Motivasi Hari Ini</h4>
          <p><strong>Misi:</strong> {challenge}</p>
          <p style={{ fontStyle: 'italic', color: '#555' }}>"{motivation}"</p>
        </div>

        {/* --- INTEGRASI ELEMEN PROGRESS KESEHATAN --- */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '1.5rem' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>🚀 Status Pemulihan Fisik</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {timelineBenefits.map((benefit) => {
              const isUnlocked = totalMsElapsed >= benefit.thresholdMs;
              return (
                <div 
                  key={benefit.id} 
                  style={{ 
                    padding: '8px', 
                    borderBottom: '1px dashed #eee',
                    opacity: isUnlocked ? 1 : 0.5 
                  }}
                >
                  <strong>{benefit.label}</strong> {isUnlocked ? '✅ Terlewati' : '🔒 Belum'}
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>{benefit.text}</p>
                </div>
              );
            })}
          </div>
        </div>

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