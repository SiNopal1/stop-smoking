'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Daftar MET untuk beberapa jenis olahraga umum
const MET_VALUES: { [key: string]: number } = {
  berjalan: 3.5,
  jogging: 7.0,
  bersepeda: 5.5,
  senam: 4.0,
  pernapasan: 1.3 // Latihan napas dalam penahan hasrat
};

interface HistoryRecord {
  id: string;
  tanggal: string;
  jenisOlahraga: string;
  beratBadan: number;
  durasi: string;
  kalori: number;
}

export default function Exercise() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State untuk Fitur Olahraga & Stopwatch
  const [beratBadan, setBeratBadan] = useState<string>('60');
  const [jenisOlahraga, setJenisOlahraga] = useState<string>('berjalan');
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [detikBerjalan, setDetikBerjalan] = useState<number>(0);
  const [kaloriTerbakar, setKaloriTerbakar] = useState<number>(0);
  const [riwayatLatihan, setRiwayatLatihan] = useState<HistoryRecord[]>([]);

  // 1. Cek Autentikasi & Ambil Riwayat dari Local Storage
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
          if (profileData.weight) {
            setBeratBadan(profileData.weight.toString());
          }
        }
        setLoading(false);
      }
    };

    checkAuth();

    // Memuat data dari local storage dengan aman saat di-render di client
    const savedHistory = localStorage.getItem('riwayat_olahraga');
    if (savedHistory) {
      setRiwayatLatihan(JSON.parse(savedHistory));
    }
  }, [router]);

  // 2. Efek Stopwatch & Hitung Kalori Real-Time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTracking) {
      const weight = parseFloat(beratBadan) || 0;
      const met = MET_VALUES[jenisOlahraga] || 1.0;

      // Rumus kalori per detik: (MET * 3.5 * beratBadan) / 200 / 60
      const kaloriPerDetik = (met * 3.5 * weight) / 12000;

      interval = setInterval(() => {
        setDetikBerjalan((prev) => prev + 1);
        setKaloriTerbakar((prev) => prev + kaloriPerDetik);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, jenisOlahraga, beratBadan]);

  // Fungsi Kontrol Stopwatch
  const handleStart = () => {
    if (!beratBadan || parseFloat(beratBadan) <= 0) {
      alert("Masukkan berat badan yang valid terlebih dahulu!");
      return;
    }
    setIsTracking(true);
  };

  const handleStop = () => {
    setIsTracking(false);
  };

  const handleReset = () => {
    setIsTracking(false);
    setDetikBerjalan(0);
    setKaloriTerbakar(0);
  };

  // Format Detik ke Menit:Detik (MM:SS)
  const formatWaktu = (totalDetik: number) => {
    const menit = Math.floor(totalDetik / 60);
    const detik = totalDetik % 60;
    return `${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}`;
  };

  // 3. Simpan Latihan ke Local Storage
  const handleSimpanLatihan = () => {
    if (detikBerjalan === 0) {
      alert("Belum ada waktu latihan yang tercatat!");
      return;
    }

    const dataBaru: HistoryRecord = {
      id: Date.now().toString(),
      tanggal: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      jenisOlahraga: jenisOlahraga.charAt(0).toUpperCase() + jenisOlahraga.slice(1),
      beratBadan: parseFloat(beratBadan),
      durasi: formatWaktu(detikBerjalan),
      kalori: parseFloat(kaloriTerbakar.toFixed(2))
    };

    const riwayatDiperbarui = [dataBaru, ...riwayatLatihan];
    setRiwayatLatihan(riwayatDiperbarui);
    localStorage.setItem('riwayat_olahraga', JSON.stringify(riwayatDiperbarui));
    
    alert("Latihan berhasil disimpan!");
    handleReset();
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
  };

  const btnControlStyle = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', color: '#333' }}>
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

      {/* Fitur Pelacak Olahraga Penahan Hasrat */}
      <section style={{ marginTop: '2rem', border: '1px solid #e8e8e8', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Fitur Pelacak Olahraga</h3>
        
        {/* Input Kilogram & Jenis Olahraga */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: '600' }}>Berat Badan (kg):</label>
            <input 
              type="number" 
              value={beratBadan} 
              onChange={(e) => setBeratBadan(e.target.value)}
              disabled={isTracking}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: '600' }}>Jenis Olahraga:</label>
            <select 
              value={jenisOlahraga} 
              onChange={(e) => setJenisOlahraga(e.target.value)}
              disabled={isTracking}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', boxSizing: 'border-box' }}
            >
              <option value="berjalan">Jalan Kaki (MET: 3.5)</option>
              <option value="jogging">Jogging / Lari (MET: 7.0)</option>
              <option value="bersepeda">Bersepeda (MET: 5.5)</option>
              <option value="senam">Senam / Kalistenik (MET: 4.0)</option>
              <option value="pernapasan">Napas Dalam 4-7-8 (MET: 1.3)</option>
            </select>
          </div>
        </div>

        {/* Stopwatch & Kalori Display */}
        <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', margin: '20px 0' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'monospace', color: isTracking ? '#52c41a' : '#555' }}>
            {formatWaktu(detikBerjalan)}
          </div>
          <div style={{ fontSize: '16px', marginTop: '5px', color: '#666' }}>
            Kalori Terbakar: <strong style={{ color: '#fa8c16', fontSize: '20px' }}>{kaloriTerbakar.toFixed(2)}</strong> kcal
          </div>
        </div>

        {/* Tombol Kontrol */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {!isTracking ? (
            <button onClick={handleStart} style={{ ...btnControlStyle, backgroundColor: '#52c41a', color: '#fff' }}>Mulai</button>
          ) : (
            <button onClick={handleStop} style={{ ...btnControlStyle, backgroundColor: '#faad14', color: '#fff' }}>Berhenti</button>
          )}
          
          <button onClick={handleSimpanLatihan} disabled={isTracking || detikBerjalan === 0} style={{ ...btnControlStyle, backgroundColor: '#1890ff', color: '#fff', opacity: (isTracking || detikBerjalan === 0) ? 0.5 : 1 }}>
            Simpan Data
          </button>
          
          <button onClick={handleReset} disabled={isTracking} style={{ ...btnControlStyle, backgroundColor: '#d9d9d9', color: '#333', opacity: isTracking ? 0.5 : 1 }}>
            Reset
          </button>
        </div>
      </section>

      {/* Tampilan Riwayat Latihan dari Local Storage */}
      <section style={{ marginTop: '2rem' }}>
        <h3>Riwayat Latihan Anda</h3>
        {riwayatLatihan.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>Belum ada data latihan yang disimpan.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Tanggal</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Olahraga</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Durasi</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Kalori</th>
                </tr>
              </thead>
              <tbody>
                {riwayatLatihan.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '12px' }}>{item.tanggal}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.jenisOlahraga} <span style={{ fontSize: '11px', color: '#888' }}>({item.beratBadan}kg)</span></td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontWeight: '600' }}>{item.durasi}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee', color: '#fa8c16', fontWeight: '600' }}>{item.kalori} kcal</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}