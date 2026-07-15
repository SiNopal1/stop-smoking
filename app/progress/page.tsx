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

  const toggleButtonStyle = (mode: 'kalori' | 'durasi') => ({
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: chartMode === mode ? '#1890ff' : '#fff',
    color: chartMode === mode ? '#fff' : '#333',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600' as const,
  });

  // Cari nilai tertinggi untuk kalkulasi tinggi diagram batang secara proporsional
  const maxChartValue = Math.max(
    ...chartData.map(d => chartMode === 'kalori' ? d.totalKalori : d.totalDurasiMenit),
    1 // Agar tidak terjadi pembagian dengan angka 0
  );

  const selectedDay = chartData[selectedIndex];

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', color: '#333' }}>
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
        <h3>Statistik Aktivitas Fisik</h3>
        <p>Halo {profile?.full_name || 'User'}, pantau konsistensi latihan Anda dalam 7 hari terakhir.</p>

        {/* Tombol Toggle Mode Grafik */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button onClick={() => setChartMode('kalori')} style={toggleButtonStyle('kalori')}>Total Kalori (kcal)</button>
          <button onClick={() => setChartMode('durasi')} style={toggleButtonStyle('durasi')}>Total Waktu (Menit)</button>
        </div>

        {/* Area Diagram Batang Sederhana */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between', 
          height: '160px', 
          backgroundColor: '#fafafa', 
          padding: '20px 10px 10px 10px', 
          borderRadius: '8px',
          border: '1px solid #e8e8e8'
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
                  margin: '0 4px'
                }}
              >
                {/* Nilai di atas diagram batang */}
                <span style={{ fontSize: '10px', color: '#666', marginBottom: '4px', fontWeight: isSelected ? 'bold' : 'normal' }}>
                  {chartMode === 'kalori' ? Math.round(day.totalKalori) : day.totalDurasiMenit.toFixed(1)}
                </span>
                
                {/* Batang Grafik */}
                <div style={{ 
                  width: '100%', 
                  height: `${barHeight}px`, 
                  backgroundColor: isSelected ? '#1890ff' : '#d9d9d9',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.2s ease',
                  maxHeight: '110px'
                }} />
                
                {/* Label Tanggal X-Axis */}
                <span style={{ fontSize: '11px', color: isSelected ? '#1890ff' : '#888', marginTop: '6px', fontWeight: isSelected ? 'bold' : 'normal' }}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detail Log Harian Berdasarkan Pilihan Grafik */}
      <section style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Detail Latihan: <span style={{ color: '#1890ff' }}>{selectedDay?.fullLabel}</span></h4>
        
        {!selectedDay || selectedDay.logs.length === 0 ? (
          <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '6px', textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
            Tidak ada riwayat olahraga tercatat pada tanggal ini.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {selectedDay.logs.map((log) => (
              <div 
                key={log.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 15px', 
                  backgroundColor: '#fff', 
                  border: '1px solid #e8e8e8', 
                  borderRadius: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <strong style={{ fontSize: '15px', display: 'block' }}>{log.jenisOlahraga}</strong>
                  <span style={{ fontSize: '12px', color: '#888' }}>Pukul {log.tanggal.split(',')[1] || ''} • {log.beratBadan} kg</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 'bold', color: '#333', display: 'block' }}>⏱️ {log.durasi}</span>
                  <span style={{ fontSize: '13px', color: '#fa8c16', fontWeight: '600' }}>🔥 {log.kalori} kcal</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}