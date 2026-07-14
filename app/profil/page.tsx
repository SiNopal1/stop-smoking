'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Profil() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State Data Mandiri
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [instagram, setInstagram] = useState<string>('');
  const [lastSmokeDate, setLastSmokeDate] = useState<string>('-');
  const [todayDate, setTodayDate] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // State Data Teman (Connection)
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        alert("Silahkan register/login terlebih dahulu");
        router.push('/');
      } else {
        setUser(user);
        
        // 1. Ambil data profil user
        const { data: profileData } = await supabase
          .from('profile')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
        }

        // 2. Ambil data kontak (WhatsApp & Instagram) milik sendiri
        const { data: contactData } = await supabase
          .from('contact')
          .select('*')
          .eq('profile_id', user.id)
          .maybeSingle();

        if (contactData) {
          setWhatsapp(contactData.whatsapp || '');
          setInstagram(contactData.instagram || '');
        }

        // 3. Ambil tanggal terakhir merokok user sendiri
        const { data: smokeData } = await supabase
          .from('last_smoke')
          .select('last_smoke')
          .eq('profile_id', user.id)
          .maybeSingle();

        if (smokeData?.last_smoke) {
          setLastSmokeDate(new Date(smokeData.last_smoke).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
          }));
        }

        // 4. Ambil tanggal hari ini secara client-side
        const today = new Date().toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
        setTodayDate(today);

        // 5. Backend Logic: Ambil Daftar Teman Dua Arah & Datanya (Termasuk Kontak Sosial)
        const { data: connData } = await supabase
          .from('connection')
          .select('profile_id, connection_id')
          .or(`profile_id.eq.${user.id},connection_id.eq.${user.id}`);

        if (connData && connData.length > 0) {
          // Filter ID untuk mendapatkan ID teman saja
          const friendIds = connData.map(c => c.profile_id === user.id ? c.connection_id : c.profile_id);

          // Tarik data profil teman
          const { data: friendsProfiles } = await supabase
            .from('profile')
            .select('id, username, profile_photo')
            .in('id', friendIds);

          // Tarik data tanggal terakhir merokok milik teman
          const { data: friendsSmoke } = await supabase
            .from('last_smoke')
            .select('profile_id, last_smoke')
            .in('profile_id', friendIds);

          // BARU: Tarik data kontak (WhatsApp & Instagram) milik teman
          const { data: friendsContacts } = await supabase
            .from('contact')
            .select('profile_id, whatsapp, instagram')
            .in('profile_id', friendIds);

          // Gabungkan semua data teman berdasarkan ID masing-masing
          const combinedFriends = (friendsProfiles || []).map(fProfile => {
            const smokeInfo = (friendsSmoke || []).find(s => s.profile_id === fProfile.id);
            const contactInfo = (friendsContacts || []).find(c => c.profile_id === fProfile.id);
            
            let streakText = '-';

            if (smokeInfo?.last_smoke) {
              const lastSmokeDate = new Date(smokeInfo.last_smoke);
              const todayDateObj = new Date();

              lastSmokeDate.setHours(0, 0, 0, 0);
              todayDateObj.setHours(0, 0, 0, 0);

              const diffTime = todayDateObj.getTime() - lastSmokeDate.getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              streakText = `${diffDays >= 0 ? diffDays : 0} hari`;
            }

            return {
              username: fProfile.username || 'Tanpa Nama',
              profile_photo: fProfile.profile_photo || '',
              streak: streakText,
              whatsapp: contactInfo?.whatsapp || '',     // Menyimpan nomor WA teman jika ada
              instagram: contactInfo?.instagram || ''    // Menyimpan username IG teman jika ada
            };
          });

          setFriends(combinedFriends);
        }

        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fungsi Simpan atau Edit Kontak
  const handleSaveContact = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('contact')
      .upsert({
        profile_id: user.id,
        whatsapp: whatsapp || null,
        instagram: instagram || null
      });

    setIsSaving(true);
    setIsSaving(false);
    if (error) {
      alert("Gagal memperbarui kontak: " + error.message);
    } else {
      alert("Kontak berhasil diperbarui!");
    }
  };

  // Fungsi Hapus Kontak
  const handleDeleteContact = async (field: 'whatsapp' | 'instagram') => {
    if (!confirm(`Hapus data ${field}?`)) return;

    if (field === 'whatsapp') setWhatsapp('');
    if (field === 'instagram') setInstagram('');

    const { error } = await supabase
      .from('contact')
      .update({ [field]: null })
      .eq('profile_id', user.id);

    if (error) {
      alert(`Gagal menghapus ${field}: ` + error.message);
    } else {
      alert(`${field} berhasil dihapus!`);
    }
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

  const inputStyle = {
    padding: '8px',
    width: '70%',
    marginRight: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h2>Profil Pengguna</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#ff4d4f', color: '#fff', cursor: 'pointer' }}>
          Keluar (Logout)
        </button>
      </header>

      {/* Navigasi */}
      <nav style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigateTo('/home')} style={navButtonStyle}>/home</button>
        <button onClick={() => navigateTo('/profil')} style={{ ...navButtonStyle, backgroundColor: '#e6f7ff', borderColor: '#91d5ff', color: '#1890ff' }}>/profil</button>
        <button onClick={() => navigateTo('/progress')} style={navButtonStyle}>/progress</button>
        <button onClick={() => navigateTo('/exercise')} style={navButtonStyle}>/exercise</button>
      </nav>

      <section style={{ marginTop: '2rem' }}>
        <h3>Manajemen Profil</h3>
        <p>📅 <strong>Hari Ini:</strong> {todayDate}</p>

        {/* Informasi Utama */}
        <div style={{ border: '1px solid #e8e8e8', padding: '15px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
          <p><strong>Nama Lengkap:</strong> {profile?.full_name || '-'}</p>
          <p><strong>Username Akun:</strong> {profile?.username || '-'}</p>
          <p><strong>Email Terdaftar:</strong> {user?.email}</p>
          <p><strong>Terakhir Merokok Anda:</strong> {lastSmokeDate}</p>
        </div>

        {/* Manajemen Kontak Sosial Sendiri */}
        <div style={{ border: '1px solid #e8e8e8', padding: '15px', borderRadius: '8px', marginTop: '1.5rem' }}>
          <h4>🔗 Kontak Sosial Anda</h4>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}><strong>WhatsApp:</strong></label>
            <input 
              type="text" 
              value={whatsapp} 
              onChange={(e) => setWhatsapp(e.target.value)} 
              placeholder="Contoh: 08123456789"
              style={inputStyle}
            />
            {whatsapp && (
              <button onClick={() => handleDeleteContact('whatsapp')} style={{ backgroundColor: '#ff4d4f', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}><strong>Instagram Username:</strong></label>
            <input 
              type="text" 
              value={instagram} 
              onChange={(e) => setInstagram(e.target.value)} 
              placeholder="Contoh: naufal_aufa" 
              style={inputStyle}
            />
            {instagram && (
              <button onClick={() => handleDeleteContact('instagram')} style={{ backgroundColor: '#ff4d4f', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>
            )}
          </div>

          <button 
            onClick={handleSaveContact} 
            disabled={isSaving}
            style={{ width: '100%', padding: '10px', backgroundColor: '#52c41a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan / Perbarui Kontak'}
          </button>
        </div>

        {/* Daftar Teman, Status Streak, beserta Hyperlink Kontak */}
        <div style={{ border: '1px solid #e8e8e8', padding: '15px', borderRadius: '8px', marginTop: '1.5rem' }}>
          <h4>👥 Status Bebas Asap Teman ({friends.length})</h4>
          {friends.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>Belum memiliki teman terhubung.</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {friends.map((friend, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <img 
                    src={friend.profile_photo || 'https://via.placeholder.com/40'} 
                    alt={friend.username} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', backgroundColor: '#ccc' }} 
                  />
                  <div>
                    <strong style={{ display: 'block' }}>@{friend.username}</strong>
                    
                    {/* BAGIAN PERUBAHAN UTAMA: Streak Bebas Asap + Hyperlink WA & IG Teman */}
                    <span style={{ fontSize: '0.85rem', color: '#555' }}>
                      {`🔥 ${friend.streak} `}
                      
                      {/* Hanya munculkan pemisah '|' dan link jika ada salah satu kontak yang terisi */}
                      {(friend.whatsapp || friend.instagram) && ' | '}
                      
                      {friend.whatsapp && (
                        <a 
                          href={`https://wa.me/${friend.whatsapp}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: '#1890ff', textDecoration: 'none', marginRight: '8px', fontWeight: 'bold' }}
                        >
                          wa
                        </a>
                      )}
                      
                      {friend.instagram && (
                        <a 
                          href={`https://instagram.com/${friend.instagram}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: '#1890ff', textDecoration: 'none', fontWeight: 'bold' }}
                        >
                          ig
                        </a>
                      )}
                    </span>

                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}