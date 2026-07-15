'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

// Impor data dari berkas JSON eksternal
import timelineBenefits from './timeline.json';
import dailyContent from './content.json';

// --- BRAND TOKENS (Sesuai dengan design.md) ---
const tokens = {
  colors: {
    primary: '#ff4f00',
    canvas: '#fffefb',
    canvasSoft: '#f8f4f0',
    ink: '#201515',
    inkSoft: '#2f2a26',
    body: '#605d52',
    bodyMid: '#939084',
    mute: '#c5c0b1',
  },
  rounded: {
    none: '0px',
    sm: '6px',
    md: '12px',
    pill: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  }
};

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

    Swal.fire({
      title: 'Apakah anda yakin?',
      text: 'Streak bebas rokok Anda akan diulang dari detik ini!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: tokens.colors.primary,
      cancelButtonColor: tokens.colors.ink,
      confirmButtonText: 'Ya, Reset!',
      cancelButtonText: 'Tidak',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const now = new Date();

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

          setRawLastSmokeDate(now);
          setLastSmokeDate(
            now.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          );

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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: tokens.colors.canvas, color: tokens.colors.ink, fontFamily: 'Inter, sans-serif' }}>
        <p style={{ fontSize: '18px', fontWeight: 500 }}>Memuat halaman...</p>
      </div>
    );
  }

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Konfigurasi data bar
  const streakBars = [
    { label: 'Tahun', value: streak.years, max: Math.max(10, streak.years) || 10 },
    { label: 'Bulan', value: streak.months, max: 12 },
    { label: 'Hari', value: streak.days, max: 31 },
    { label: 'Jam', value: streak.hours, max: 24 },
    { label: 'Menit', value: streak.minutes, max: 60 },
    { label: 'Detik', value: streak.seconds, max: 60 },
  ];

  return (
    <main style={{ 
      backgroundColor: tokens.colors.canvas, 
      color: tokens.colors.ink, 
      minHeight: '100vh', 
      padding: `${tokens.spacing['3xl']} ${tokens.spacing.xl}`, 
      fontFamily: 'Inter, sans-serif' 
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: tokens.spacing['2xl'] }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: tokens.spacing.md }}>
          <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 500, letterSpacing: '-0.5px' }}>Dashboard Utama</h2>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: `${tokens.spacing.md} ${tokens.spacing.xl}`, 
              borderRadius: tokens.rounded.md, 
              border: 'none', 
              backgroundColor: tokens.colors.ink, 
              color: tokens.colors.canvasSoft, 
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Keluar
          </button>
        </header>

        {/* Menu Navigasi (Button Tertiary Style) */}
        <nav style={{ display: 'flex', gap: tokens.spacing.md, flexWrap: 'wrap' }}>
          {['/home', '/profil', '/progress', '/exercise'].map((path) => (
            <button 
              key={path}
              onClick={() => navigateTo(path)} 
              style={{
                padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
                borderRadius: tokens.rounded.md,
                border: `1px solid ${tokens.colors.ink}`,
                backgroundColor: path === '/home' ? tokens.colors.ink : tokens.colors.canvas,
                color: path === '/home' ? tokens.colors.canvasSoft : tokens.colors.ink,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                flex: '1 1 auto',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                if (path !== '/home') {
                  e.currentTarget.style.backgroundColor = tokens.colors.canvasSoft;
                }
              }}
              onMouseOut={(e) => {
                if (path !== '/home') {
                  e.currentTarget.style.backgroundColor = tokens.colors.canvas;
                }
              }}
            >
              {path}
            </button>
          ))}
        </nav>

        {/* --- KOTAK INFORMASI TRACKER (Card Content) --- */}
        <div style={{ backgroundColor: tokens.colors.canvasSoft, padding: tokens.spacing.xl, borderRadius: tokens.rounded.md }}>
          <h4 style={{ margin: `0 0 ${tokens.spacing.lg} 0`, fontSize: '24px', fontWeight: 600 }}>Ringkasan Tracker</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: tokens.spacing.lg, marginBottom: tokens.spacing.xl }}>
             <div>
               <p style={{ margin: 0, fontSize: '14px', color: tokens.colors.body }}>Tanggal Hari Ini</p>
               <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>{todayDate}</p>
             </div>
             <div>
               <p style={{ margin: 0, fontSize: '14px', color: tokens.colors.body }}>Terakhir Merokok</p>
               <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>{lastSmokeDate || 'Belum ada data'}</p>
             </div>
             <div>
               <p style={{ margin: 0, fontSize: '14px', color: tokens.colors.body }}>Total Uang Dihemat</p>
               <p style={{ margin: '4px 0 0 0', fontWeight: 700, fontSize: '20px', color: tokens.colors.primary }}>{formatRupiah(moneySaved)}</p>
             </div>
          </div>

          <div style={{ borderTop: `1px solid ${tokens.colors.mute}`, paddingTop: tokens.spacing.lg }}>
            <p style={{ margin: `0 0 ${tokens.spacing.md} 0`, fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Streak Bebas Rokok
            </p>

            {/* --- STOPWATCH BENTUK BATANG --- */}
            {rawLastSmokeDate ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
                {streakBars.map((bar) => {
                  const percentage = Math.min(100, (bar.value / bar.max) * 100);
                  return (
                    <div key={bar.label} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xs }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 500 }}>
                        <span>{bar.label}</span>
                        <span style={{ fontWeight: 600 }}>{bar.value}</span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '12px', 
                        backgroundColor: tokens.colors.mute, 
                        borderRadius: tokens.rounded.pill,
                        overflow: 'hidden' 
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: tokens.colors.primary,
                          borderRadius: tokens.rounded.pill,
                          transition: 'width 1s linear', // Transisi smooth untuk detik yang terus berjalan
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: 0, fontStyle: 'italic', color: tokens.colors.bodyMid }}>Menghitung...</p>
            )}
          </div>

          {/* Tombol Reset Counter (Primary Button) */}
          <button
            onClick={handleResetCounter}
            style={{
              marginTop: tokens.spacing.xl,
              width: '100%',
              padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
              borderRadius: tokens.rounded.md,
              border: 'none',
              backgroundColor: tokens.colors.primary,
              color: tokens.colors.canvas,
              fontSize: '18px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Reset Timer Merokok
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: tokens.spacing['2xl'] }}>
          {/* --- INTEGRASI ELEMEN KONTEN HARIAN --- */}
          <div style={{ border: `1px solid ${tokens.colors.ink}`, padding: tokens.spacing.xl, borderRadius: tokens.rounded.md, backgroundColor: tokens.colors.canvas }}>
            <h4 style={{ margin: `0 0 ${tokens.spacing.md} 0`, fontSize: '20px', fontWeight: 600 }}>Tantangan & Motivasi</h4>
            <p style={{ fontSize: '16px', lineHeight: '1.5', margin: `0 0 ${tokens.spacing.sm} 0` }}>
              <strong>Misi:</strong> {challenge}
            </p>
            <p style={{ fontStyle: 'italic', color: tokens.colors.body, margin: 0, fontSize: '16px' }}>"{motivation}"</p>
          </div>

          {/* --- DETAIL AKUN --- */}
          <div style={{ backgroundColor: tokens.colors.canvasSoft, padding: tokens.spacing.xl, borderRadius: tokens.rounded.md }}>
            <h4 style={{ margin: `0 0 ${tokens.spacing.md} 0`, fontSize: '20px', fontWeight: 600 }}>Detail Akun Anda</h4>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm }}>
              <li style={{ fontSize: '16px' }}><strong style={{ color: tokens.colors.inkSoft }}>Nama:</strong> {profile?.full_name || '-'}</li>
              <li style={{ fontSize: '16px' }}><strong style={{ color: tokens.colors.inkSoft }}>Username:</strong> {profile?.username || '-'}</li>
              <li style={{ fontSize: '16px' }}><strong style={{ color: tokens.colors.inkSoft }}>Email:</strong> {user?.email}</li>
              <li style={{ fontSize: '14px', color: tokens.colors.bodyMid, wordBreak: 'break-all' }}><strong>UID:</strong> {user?.id}</li>
            </ul>
          </div>
        </div>

        {/* --- INTEGRASI ELEMEN PROGRESS KESEHATAN --- */}
        <div style={{ border: `1px solid ${tokens.colors.ink}`, padding: tokens.spacing.xl, borderRadius: tokens.rounded.md, backgroundColor: tokens.colors.canvas }}>
          <h4 style={{ margin: `0 0 ${tokens.spacing.lg} 0`, fontSize: '20px', fontWeight: 600 }}>Status Pemulihan Fisik</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
            {timelineBenefits.map((benefit) => {
              const isUnlocked = totalMsElapsed >= benefit.thresholdMs;
              return (
                <div 
                  key={benefit.id} 
                  style={{ 
                    paddingBottom: tokens.spacing.sm, 
                    borderBottom: `1px dashed ${tokens.colors.mute}`,
                    opacity: isUnlocked ? 1 : 0.4,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '16px' }}>{benefit.label}</strong>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      backgroundColor: isUnlocked ? tokens.colors.ink : tokens.colors.mute,
                      color: isUnlocked ? tokens.colors.canvas : tokens.colors.ink,
                      padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
                      borderRadius: tokens.rounded.pill
                    }}>
                      {isUnlocked ? 'Terlewati' : 'Terkunci'}
                    </span>
                  </div>
                  <p style={{ margin: `${tokens.spacing.xs} 0 0 0`, fontSize: '14px', color: tokens.colors.body }}>{benefit.text}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}