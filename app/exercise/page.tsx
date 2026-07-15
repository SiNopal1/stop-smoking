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

  const btnControlStyle = {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '600',
    fontSize: '18px',
    cursor: 'pointer',
    flex: 1,
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ backgroundColor: '#fffefb', minHeight: '100vh' }}>
      <main style={{ padding: '4rem 2rem', fontFamily: '"Inter", sans-serif', maxWidth: '800px', margin: '0 auto', color: '#201515' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #c5c0b1', paddingBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '500', margin: 0 }}>Craving Exercise</h2>
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
          <button onClick={() => navigateTo('/progress')} style={navButtonStyle}>/progress</button>
          <button onClick={() => navigateTo('/exercise')} style={{ ...navButtonStyle, backgroundColor: '#201515', color: '#fffefb', border: '1px solid #201515' }}>/exercise</button>
        </nav>

        {/* Fitur Pelacak Olahraga Penahan Hasrat */}
        <section style={{ marginTop: '3rem', border: 'none', padding: '24px', borderRadius: '12px', backgroundColor: '#f8f4f0' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 24px 0', letterSpacing: '-0.6px' }}>Fitur Pelacak Olahraga</h3>
          
          {/* Input Kilogram & Jenis Olahraga */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px', fontWeight: '600', color: '#36342e' }}>Berat Badan (kg):</label>
              <input 
                type="number" 
                value={beratBadan} 
                onChange={(e) => setBeratBadan(e.target.value)}
                disabled={isTracking}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #201515', backgroundColor: '#fffefb', color: '#201515', boxSizing: 'border-box', fontSize: '16px', fontFamily: '"Inter", sans-serif' }}
              />
            </div>
            
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '16px', marginBottom: '8px', fontWeight: '600', color: '#36342e' }}>Jenis Olahraga:</label>
              <select 
                value={jenisOlahraga} 
                onChange={(e) => setJenisOlahraga(e.target.value)}
                disabled={isTracking}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #201515', backgroundColor: '#fffefb', color: '#201515', boxSizing: 'border-box', fontSize: '16px', fontFamily: '"Inter", sans-serif' }}
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
          <div style={{ textAlign: 'center', padding: '32px 0', borderTop: '1px solid #c5c0b1', borderBottom: '1px solid #c5c0b1', margin: '32px 0' }}>
            <div style={{ fontSize: '56px', fontWeight: '500', color: isTracking ? '#ff4f00' : '#201515', transition: 'color 0.3s ease' }}>
              {formatWaktu(detikBerjalan)}
            </div>
            <div style={{ fontSize: '18px', marginTop: '12px', color: '#605d52' }}>
              Kalori Terbakar: <strong style={{ color: '#ff4f00', fontSize: '24px', fontWeight: '600' }}>{kaloriTerbakar.toFixed(2)}</strong> kcal
            </div>
          </div>

          {/* Tombol Kontrol */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {!isTracking ? (
              <button onClick={handleStart} style={{ ...btnControlStyle, backgroundColor: '#ff4f00', color: '#fffefb' }}>Mulai</button>
            ) : (
              <button onClick={handleStop} style={{ ...btnControlStyle, backgroundColor: '#201515', color: '#fffefb' }}>Berhenti</button>
            )}
            
            <button onClick={handleSimpanLatihan} disabled={isTracking || detikBerjalan === 0} style={{ ...btnControlStyle, backgroundColor: '#201515', color: '#fffefb', opacity: (isTracking || detikBerjalan === 0) ? 0.4 : 1 }}>
              Simpan Data
            </button>
            
            <button onClick={handleReset} disabled={isTracking} style={{ ...btnControlStyle, backgroundColor: '#fffefb', color: '#201515', border: '1px solid #201515', opacity: isTracking ? 0.4 : 1 }}>
              Reset
            </button>
          </div>
        </section>

        {/* Tampilan Riwayat Latihan dari Local Storage */}
        <section style={{ marginTop: '4rem' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', letterSpacing: '-0.6px' }}>Riwayat Latihan Anda</h3>
          {riwayatLatihan.length === 0 ? (
            <p style={{ color: '#939084', fontSize: '16px' }}>Belum ada data latihan yang disimpan.</p>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #c5c0b1' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px', backgroundColor: '#fffefb' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f4f0', textAlign: 'left' }}>
                    <th style={{ padding: '16px', borderBottom: '1px solid #c5c0b1', fontWeight: '600', color: '#201515' }}>Tanggal</th>
                    <th style={{ padding: '16px', borderBottom: '1px solid #c5c0b1', fontWeight: '600', color: '#201515' }}>Olahraga</th>
                    <th style={{ padding: '16px', borderBottom: '1px solid #c5c0b1', fontWeight: '600', color: '#201515' }}>Durasi</th>
                    <th style={{ padding: '16px', borderBottom: '1px solid #c5c0b1', fontWeight: '600', color: '#201515' }}>Kalori</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayatLatihan.map((item, index) => (
                    <tr key={item.id}>
                      <td style={{ padding: '16px', borderBottom: index === riwayatLatihan.length - 1 ? 'none' : '1px solid #e8e6df', color: '#605d52', fontSize: '14px' }}>{item.tanggal}</td>
                      <td style={{ padding: '16px', borderBottom: index === riwayatLatihan.length - 1 ? 'none' : '1px solid #e8e6df', color: '#201515' }}>{item.jenisOlahraga} <span style={{ fontSize: '14px', color: '#939084' }}>({item.beratBadan}kg)</span></td>
                      <td style={{ padding: '16px', borderBottom: index === riwayatLatihan.length - 1 ? 'none' : '1px solid #e8e6df', fontWeight: '600', color: '#201515' }}>{item.durasi}</td>
                      <td style={{ padding: '16px', borderBottom: index === riwayatLatihan.length - 1 ? 'none' : '1px solid #e8e6df', color: '#ff4f00', fontWeight: '600' }}>{item.kalori} kcal</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}