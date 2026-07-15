'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

interface HistoryRecord {
  id: string;
  tanggal: string;
  jenisOlahraga: string;
  beratBadan: number;
  durasi: string; // Format "MM:SS"
  kalori: number;
}

interface DayData {
  label: string;      // Contoh: "15 Jul"
  fullLabel: string;  // Contoh: "15 Jul 2026"
  totalKalori: number;
  totalDurasiMenit: number;
  logs: HistoryRecord[];
}

export default function Progress() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State untuk Data Progress
  const [riwayatLatihan, setRiwayatLatihan] = useState<HistoryRecord[]>([]);
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [chartMode, setChartMode] = useState<'kalori' | 'durasi'>('kalori');
  const [selectedIndex, setSelectedIndex] = useState<number>(6); // Default ke hari ini (indeks terakhir)

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

    // 1. Mengambil data olahraga dari local storage
    const savedHistory = localStorage.getItem('riwayat_olahraga');
    const logs: HistoryRecord[] = savedHistory ? JSON.parse(savedHistory) : [];
    setRiwayatLatihan(logs);

    // 2. Memproses data menjadi struktur 7 hari terakhir
    const days: DayData[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const fullLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      
      days.push({
        label,
        fullLabel,
        totalKalori: 0,
        totalDurasiMenit: 0,
        logs: []
      });
    }

    // Mengelompokkan log ke hari yang sesuai
    logs.forEach((log) => {
      const targetDay = days.find(day => log.tanggal.includes(day.fullLabel));
      if (targetDay) {
        targetDay.logs.push(log);
        targetDay.totalKalori += log.kalori;
        
        // Konversi format durasi "MM:SS" ke total menit desimal
        const timeParts = log.durasi.split(':');
        const menit = parseInt(timeParts[0] || '0', 10);
        const detik = parseInt(timeParts[1] || '0', 10);
        targetDay.totalDurasiMenit += menit + (detik / 60);
      }
    });

    setChartData(days);
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fffefb', color: '#201515', fontFamily: '"Inter", sans-serif' }}>
        <p style={{ fontSize: '18px', fontWeight: '500' }}>Memuat halaman...</p>
      </div>
    );
  }

  const navButtonStyle = {
    padding: '12px 24px',
    borderRadius: '12px',
    border: '1px solid #201515',
    backgroundColor: '#fffefb',
    color: '#201515',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14.4px',
    flex: 1,
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
  };

  const toggleButtonStyle = (mode: 'kalori' | 'durasi') => ({
    padding: '8px 16px',
    borderRadius: '12px',
    border: '1px solid #201515',
    backgroundColor: chartMode === mode ? '#201515' : '#fffefb',
    color: chartMode === mode ? '#fffefb' : '#201515',
    cursor: 'pointer',
    fontSize: '14.4px',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
  });

  // Cari nilai tertinggi untuk kalkulasi tinggi diagram batang secara proporsional
  const maxChartValue = Math.max(
    ...chartData.map(d => chartMode === 'kalori' ? d.totalKalori : d.totalDurasiMenit),
    1 // Agar tidak terjadi pembagian dengan angka 0
  );

  const selectedDay = chartData[selectedIndex];

  return (
    <div style={{ backgroundColor: '#fffefb', minHeight: '100vh' }}>
      <main style={{ padding: '4rem 2rem', fontFamily: '"Inter", sans-serif', maxWidth: '800px', margin: '0 auto', color: '#201515' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #c5c0b1', paddingBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '500', margin: 0 }}>Progress Tracker</h2>
          <button 
            onClick={handleLogout} 
            style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #201515', backgroundColor: '#fffefb', color: '#201515', cursor: 'pointer', fontWeight: '600', fontSize: '14.4px' }}
          >
            Keluar (Logout)
          </button>
        </header>

        {/* Navigasi */}
        <nav style={{ display: 'flex', gap: '12px', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigateTo('/home')} style={navButtonStyle}>/home</button>
          <button onClick={() => navigateTo('/profil')} style={navButtonStyle}>/profil</button>
          <button onClick={() => navigateTo('/progress')} style={{ ...navButtonStyle, backgroundColor: '#201515', color: '#fffefb', border: '1px solid #201515' }}>/progress</button>
          <button onClick={() => navigateTo('/exercise')} style={navButtonStyle}>/exercise</button>
        </nav>

        <section style={{ marginTop: '3rem' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', letterSpacing: '-0.6px' }}>Statistik Aktivitas Fisik</h3>
          <p style={{ color: '#605d52', fontSize: '16px', marginBottom: '1.5rem' }}>Halo {profile?.full_name || 'User'}, pantau konsistensi latihan Anda dalam 7 hari terakhir.</p>

          {/* Tombol Toggle Mode Grafik */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <button onClick={() => setChartMode('kalori')} style={toggleButtonStyle('kalori')}>Total Kalori (kcal)</button>
            <button onClick={() => setChartMode('durasi')} style={toggleButtonStyle('durasi')}>Total Waktu (Menit)</button>
          </div>

          {/* Area Diagram Batang */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'space-between', 
            height: '200px', 
            backgroundColor: '#f8f4f0', 
            padding: '24px 16px 12px 16px', 
            borderRadius: '12px',
            border: 'none'
          }}>
            {chartData.map((day, index) => {
              const currentVal = chartMode === 'kalori' ? day.totalKalori : day.totalDurasiMenit;
              // Hitung persentase tinggi batang (minimal 5% agar tetap terlihat jika bernilai 0)
              const barHeight = currentVal > 0 ? (currentVal / maxChartValue) * 100 : 5;
              const isSelected = index === selectedIndex;

              return (
                <div 
                  key={index} 
                  onClick={() => setSelectedIndex(index)}
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    margin: '0 6px'
                  }}
                >
                  {/* Nilai di atas diagram batang */}
                  <span style={{ fontSize: '12px', color: isSelected ? '#ff4f00' : '#605d52', marginBottom: '8px', fontWeight: isSelected ? '600' : '400', transition: 'color 0.2s ease' }}>
                    {chartMode === 'kalori' ? Math.round(day.totalKalori) : day.totalDurasiMenit.toFixed(1)}
                  </span>
                  
                  {/* Batang Grafik */}
                  <div style={{ 
                    width: '100%', 
                    height: `${barHeight}px`, 
                    backgroundColor: isSelected ? '#ff4f00' : '#c5c0b1',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.3s ease',
                    maxHeight: '130px'
                  }} />
                  
                  {/* Label Tanggal X-Axis */}
                  <span style={{ fontSize: '12px', color: isSelected ? '#201515' : '#939084', marginTop: '12px', fontWeight: isSelected ? '600' : '400' }}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Detail Log Harian Berdasarkan Pilihan Grafik */}
        <section style={{ marginTop: '3rem', borderTop: '1px solid #c5c0b1', paddingTop: '2rem' }}>
          <h4 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 16px 0', letterSpacing: '-0.5px' }}>
            Detail Latihan: <span style={{ color: '#ff4f00' }}>{selectedDay?.fullLabel}</span>
          </h4>
          
          {!selectedDay || selectedDay.logs.length === 0 ? (
            <div style={{ padding: '24px', backgroundColor: '#f8f4f0', borderRadius: '12px', textAlign: 'center', color: '#939084', fontSize: '16px' }}>
              Tidak ada riwayat olahraga tercatat pada tanggal ini.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedDay.logs.map((log) => (
                <div 
                  key={log.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '20px', 
                    backgroundColor: '#fffefb', 
                    border: '1px solid #c5c0b1', 
                    borderRadius: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '18px', display: 'block', fontWeight: '600', color: '#201515', marginBottom: '4px' }}>{log.jenisOlahraga}</strong>
                    <span style={{ fontSize: '14px', color: '#605d52' }}>Pukul {log.tanggal.split(',')[1] || ''} • {log.beratBadan} kg</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '600', color: '#201515', display: 'block', fontSize: '16px' }}>⏱️ {log.durasi}</span>
                    <span style={{ fontSize: '16px', color: '#ff4f00', fontWeight: '600', marginTop: '4px', display: 'block' }}>🔥 {log.kalori} kcal</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}