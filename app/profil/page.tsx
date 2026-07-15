'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Profil() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State Manajemen Data Profil Baru
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);

  // State Data Mandiri (Kontak & Smoke)
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [instagram, setInstagram] = useState<string>('');
  const [lastSmokeDate, setLastSmokeDate] = useState<string>('-');
  const [todayDate, setTodayDate] = useState<string>('');
  const [isSavingContact, setIsSavingContact] = useState<boolean>(false);

  // State Data Teman & Fitur Pertemanan
  const [friends, setFriends] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchMessage, setSearchMessage] = useState<string>('');

  const loadConnections = async (currentUserId: string) => {
    const { data: connData } = await supabase
      .from('connection')
      .select('id, profile_id, connection_id, is_accepted')
      .or(`profile_id.eq.${currentUserId},connection_id.eq.${currentUserId}`);

    if (!connData) return;

    // 1. OLAHAN: Teman Terkonfirmasi
    const acceptedConns = connData.filter(c => c.is_accepted === true);
    if (acceptedConns.length > 0) {
      const friendIds = acceptedConns.map(c => c.profile_id === currentUserId ? c.connection_id : c.profile_id);

      const { data: friendsProfiles } = await supabase.from('profile').select('id, username, profile_photo').in('id', friendIds);
      const { data: friendsSmoke } = await supabase.from('last_smoke').select('profile_id, last_smoke').in('profile_id', friendIds);
      const { data: friendsContacts } = await supabase.from('contact').select('profile_id, whatsapp, instagram').in('profile_id', friendIds);

      const combinedFriends = (friendsProfiles || []).map(fProfile => {
        const smokeInfo = (friendsSmoke || []).find(s => s.profile_id === fProfile.id);
        const contactInfo = (friendsContacts || []).find(c => c.profile_id === fProfile.id);
        const conn = acceptedConns.find(c => c.profile_id === fProfile.id || c.connection_id === fProfile.id);
        
        let streakText = '-';
        if (smokeInfo?.last_smoke) {
          const lastSmokeDateObj = new Date(smokeInfo.last_smoke);
          const todayDateObj = new Date();
          lastSmokeDateObj.setHours(0, 0, 0, 0);
          todayDateObj.setHours(0, 0, 0, 0);
          const diffTime = todayDateObj.getTime() - lastSmokeDateObj.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          streakText = `${diffDays >= 0 ? diffDays : 0} hari`;
        }

        return {
          username: fProfile.username || 'Tanpa Nama',
          profile_photo: fProfile.profile_photo || '',
          streak: streakText,
          whatsapp: contactInfo?.whatsapp || '',
          instagram: contactInfo?.instagram || '',
          roomId: conn?.id
        };
      });
      setFriends(combinedFriends);
    } else {
      setFriends([]);
    }

    // 2. OLAHAN: Invitasi Masuk
    const incomingConns = connData.filter(c => c.is_accepted === false && c.connection_id === currentUserId);
    if (incomingConns.length > 0) {
      const requesterIds = incomingConns.map(c => c.profile_id);
      const { data: requestersProfiles } = await supabase.from('profile').select('id, username, profile_photo').in('id', requesterIds);

      const combinedIncoming = (requestersProfiles || []).map(rProfile => {
        const conn = incomingConns.find(c => c.profile_id === rProfile.id);
        return {
          connectionTableId: conn?.id,
          username: rProfile.username || 'Tanpa Nama',
          profile_photo: rProfile.profile_photo || ''
        };
      });
      setIncomingRequests(combinedIncoming);
    } else {
      setIncomingRequests([]);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        alert("Silahkan register/login terlebih dahulu");
        router.push('/');
      } else {
        setUser(user);
        
        // 1. Ambil data profil user & isi input state
        const { data: profileData } = await supabase
          .from('profile')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || '');
          setUsername(profileData.username || '');
          setAvatarUrl(profileData.profile_photo || '');
        }

        // 2. Ambil data kontak milik sendiri
        const { data: contactData } = await supabase
          .from('contact')
          .select('*')
          .eq('profile_id', user.id)
          .maybeSingle();

        if (contactData) {
          setWhatsapp(contactData.whatsapp || '');
          setInstagram(contactData.instagram || '');
        }

        // 3. Ambil tanggal terakhir merokok
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

        const today = new Date().toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
        setTodayDate(today);

        await loadConnections(user.id);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fitur Unggah Foto Profil (Upload/Ubah)
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0 || !user) return;
      setIsUploadingPhoto(true);

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Gunakan nama file unik terstruktur
      const filePath = `${user.id}/${Date.now()}_avatar.${fileExt}`;

      // 1. Unggah file ke Supabase Storage (Nama bucket: avatars)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Dapatkan Public URL hasil upload
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update kolom profile_photo di DB
      const { error: updateError } = await supabase
        .from('profile')
        .update({ profile_photo: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setProfile((prev: any) => ({ ...prev, profile_photo: publicUrl }));
      alert('Foto profil berhasil diperbarui!');
    } catch (error: any) {
      alert('Gagal mengunggah foto: ' + error.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Fitur Hapus Foto Profil
  const handleDeletePhoto = async () => {
    if (!user || !avatarUrl) return;
    if (!confirm('Apakah Anda yakin ingin menghapus foto profil?')) return;

    try {
      setIsUploadingPhoto(true);

      // Jalankan update untuk set profile_photo menjadi null di database
      const { error } = await supabase
        .from('profile')
        .update({ profile_photo: null })
        .eq('id', user.id);

      if (error) throw error;

      setAvatarUrl('');
      setProfile((prev: any) => ({ ...prev, profile_photo: null }));
      alert('Foto profil berhasil dihapus.');
    } catch (error: any) {
      alert('Gagal menghapus foto profil: ' + error.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Fitur Simpan Perubahan Biodata (Nama & Cek Unik Username)
  const handleUpdateProfileData = async () => {
    if (!user) return;
    setIsUpdatingProfile(true);

    const cleanUsername = username.trim().toLowerCase();

    // Validasi input kosong
    if (!fullName.trim() || !cleanUsername) {
      alert("Nama Lengkap dan Username tidak boleh kosong.");
      setIsUpdatingProfile(false);
      return;
    }

    try {
      // Cek ketersediaan username hanya jika usernamenya diganti dari yang lama
      if (cleanUsername !== profile?.username?.toLowerCase()) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profile')
          .select('id')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingUser) {
          alert(`Username @${cleanUsername} sudah digunakan oleh orang lain! Silakan pilih yang lain.`);
          setIsUpdatingProfile(false);
          return;
        }
      }

      // Jalankan update ke tabel profile
      const { error: updateError } = await supabase
        .from('profile')
        .update({
          full_name: fullName.trim(),
          username: cleanUsername
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile((prev: any) => ({ ...prev, full_name: fullName.trim(), username: cleanUsername }));
      alert("Biodata profil berhasil disimpan!");
    } catch (error: any) {
      alert("Gagal memperbarui profil: " + error.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Logika Fitur Pertemanan Lainnya (Search, Send, Accept, dll.)
  const handleSearchFriend = async () => {
    if (!searchQuery.trim() || !user) return;
    setSearchMessage('');
    setSearchResult(null);

    if (searchQuery.trim().toLowerCase() === profile?.username?.toLowerCase()) {
      setSearchMessage('Anda tidak dapat mencari diri sendiri.');
      return;
    }

    const { data: targetProfile, error } = await supabase
      .from('profile')
      .select('id, username, profile_photo')
      .eq('username', searchQuery.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      setSearchMessage('Gagal melakukan pencarian.');
    } else if (!targetProfile) {
      setSearchMessage('Username tidak ditemukan.');
    } else {
      const { data: existingConn } = await supabase
        .from('connection')
        .select('*')
        .or(`and(profile_id.eq.${user.id},connection_id.eq.${targetProfile.id}),and(profile_id.eq.${targetProfile.id},connection_id.eq.${user.id})`)
        .maybeSingle();

      setSearchResult({ ...targetProfile, existingConn });
    }
  };

  const handleSendRequest = async (targetId: string) => {
    if (!user) return;
    const { error } = await supabase.from('connection').insert({ profile_id: user.id, connection_id: targetId, is_accepted: false });

    if (error) {
      alert("Gagal mengirim pertemanan: " + error.message);
    } else {
      alert("Undangan pertemanan berhasil dikirim!");
      setSearchQuery('');
      setSearchResult(null);
      await loadConnections(user.id);
    }
  };

  const handleAcceptRequest = async (connectionTableId: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('connection').update({ is_accepted: true }).eq('id', connectionTableId).select();

    if (error) {
      alert("Gagal menerima pertemanan: " + error.message);
    } else if (!data || data.length === 0) {
      alert("Gagal: Aksi diblokir oleh RLS Supabase.");
    } else {
      alert("Undangan pertemanan diterima!");
      await loadConnections(user.id);
    }
  };

  const handleSaveContact = async () => {
    setIsSavingContact(true);
    const { error } = await supabase.from('contact').upsert({ profile_id: user.id, whatsapp: whatsapp || null, instagram: instagram || null });
    setIsSavingContact(false);
    if (error) alert("Gagal memperbarui kontak: " + error.message);
    else alert("Kontak berhasil diperbarui!");
  };

  const handleDeleteContact = async (field: 'whatsapp' | 'instagram') => {
    if (!confirm(`Hapus data ${field}?`)) return;
    if (field === 'whatsapp') setWhatsapp('');
    if (field === 'instagram') setInstagram('');
    const { error } = await supabase.from('contact').update({ [field]: null }).eq('profile_id', user.id);
    if (error) alert(`Gagal menghapus ${field}: ` + error.message);
    else alert(`${field} berhasil dihapus!`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navButtonStyle = { padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', color: '#333', cursor: 'pointer', fontWeight: '600', flex: 1, textAlign: 'center' as const };
  const inputStyle = { padding: '8px', width: '70%', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={avatarUrl || 'https://via.placeholder.com/50'} 
            alt="Avatar" 
            style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1890ff' }} 
          />
          <div>
            <h2 style={{ margin: 0 }}>{profile?.full_name || 'User'}</h2>
            <span style={{ color: '#888', fontSize: '0.9rem' }}>@{profile?.username || 'username'}</span>
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#ff4d4f', color: '#fff', cursor: 'pointer' }}>
          Keluar
        </button>
      </header>

      <nav style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => router.push('/home')} style={navButtonStyle}>/home</button>
        <button onClick={() => router.push('/profil')} style={{ ...navButtonStyle, backgroundColor: '#e6f7ff', borderColor: '#91d5ff', color: '#1890ff' }}>/profil</button>
        <button onClick={() => router.push('/progress')} style={navButtonStyle}>/progress</button>
        <button onClick={() => router.push('/exercise')} style={navButtonStyle}>/exercise</button>
      </nav>

      <section style={{ marginTop: '2rem' }}>
        <p>📅 <strong>Hari Ini:</strong> {todayDate}</p>

        {/* FITUR BARU: PANEL PENGATURAN IDENTITAS PROFIL */}
        <div style={{ border: '1px solid #e8e8e8', padding: '15px', borderRadius: '8px', backgroundColor: '#fafafa', marginBottom: '1.5rem' }}>
          <h4>⚙️ Edit Biodata & Foto Profil</h4>
          
          {/* UPLOAD & HAPUS FOTO PROFIL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px dashed #e8e8e8' }}>
            <img 
              src={avatarUrl || 'https://via.placeholder.com/80'} 
              alt="Preview Avatar" 
              style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', backgroundColor: '#ddd' }} 
            />
            <div>
              <label style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#1890ff', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {isUploadingPhoto ? 'Mengunggah...' : 'Ubah Foto'}
                <input type="file" accept="image/*" onChange={handleUploadPhoto} disabled={isUploadingPhoto} style={{ display: 'none' }} />
              </label>
              {avatarUrl && (
                <button 
                  onClick={handleDeletePhoto}
                  disabled={isUploadingPhoto}
                  style={{ marginLeft: '10px', padding: '6px 12px', backgroundColor: '#fff', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Hapus
                </button>
              )}
            </div>
          </div>

          {/* EDIT NAMA LENGKAP & USERNAME */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}><strong>Nama Lengkap:</strong></label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              style={{ ...inputStyle, width: '95%' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}><strong>Username (@):</strong></label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={{ ...inputStyle, width: '95%' }}
            />
          </div>

          <button 
            onClick={handleUpdateProfileData}
            disabled={isUpdatingProfile}
            style={{ width: '100%', padding: '10px', backgroundColor: '#1890ff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
          </button>
        </div>

        {/* Informasi Status Tambahan */}
        <div style={{ border: '1px solid #e8e8e8', padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
          <p style={{ margin: 0 }}><strong>Terakhir Merokok Anda:</strong> {lastSmokeDate}</p>
        </div>

        {/* Manajemen Kontak Sosial Sendiri */}
        <div style={{ border: '1px solid #e8e8e8', padding: '15px', borderRadius: '8px', marginTop: '1.5rem' }}>
          <h4>🔗 Kontak Sosial Teman</h4>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}><strong>WhatsApp:</strong></label>
            <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Contoh: 08123456789" style={inputStyle} />
            {whatsapp && <button onClick={() => handleDeleteContact('whatsapp')} style={{ backgroundColor: '#ff4d4f', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}><strong>Instagram Username:</strong></label>
            <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Contoh: naufal_aufa" style={inputStyle} />
            {instagram && <button onClick={() => handleDeleteContact('instagram')} style={{ backgroundColor: '#ff4d4f', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>}
          </div>
          <button onClick={handleSaveContact} disabled={isSavingContact} style={{ width: '100%', padding: '10px', backgroundColor: '#52c41a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            {isSavingContact ? 'Menyimpan...' : 'Simpan / Perbarui Kontak'}
          </button>
        </div>

        {/* Fitur Cari Teman */}
        <div style={{ border: '1px solid #e8e8e8', padding: '15px', borderRadius: '8px', marginTop: '1.5rem' }}>
          <h4>🔍 Cari Teman Baru</h4>
          <div style={{ display: 'flex' }}>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari username teman..." style={inputStyle} />
            <button onClick={handleSearchFriend} style={{ padding: '8px 16px', backgroundColor: '#1890ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cari</button>
          </div>
          {searchMessage && <p style={{ color: '#ff4d4f', fontSize: '0.85rem', marginTop: '5px' }}>{searchMessage}</p>}
          {searchResult && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '6px', marginTop: '10px', border: '1px dashed #ccc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={searchResult.profile_photo || 'https://via.placeholder.com/40'} alt={searchResult.username} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} />
                <strong>@{searchResult.username}</strong>
              </div>
              {searchResult.existingConn ? (
                <span style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>
                  {searchResult.existingConn.is_accepted ? 'Sudah Berteman' : 'Permintaan Tertunda'}
                </span>
              ) : (
                <button onClick={() => handleSendRequest(searchResult.id)} style={{ padding: '6px 12px', backgroundColor: '#52c41a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Tambah Teman</button>
              )}
            </div>
          )}
        </div>

        {/* Undangan Masuk */}
        <div style={{ border: '1px solid #e8e8e8', padding: '15px', borderRadius: '8px', marginTop: '1.5rem', backgroundColor: '#fffbe6', borderColor: '#ffe58f' }}>
          <h4>📩 Undangan Teman Masuk ({incomingRequests.length})</h4>
          {incomingRequests.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic', margin: 0, fontSize: '0.85rem' }}>Tidak ada undangan pertemanan baru.</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {incomingRequests.map((req, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={req.profile_photo || 'https://via.placeholder.com/40'} alt={req.username} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} />
                    <strong>@{req.username}</strong>
                  </div>
                  <button onClick={() => handleAcceptRequest(req.connectionTableId)} style={{ padding: '6px 12px', backgroundColor: '#52c41a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Accept</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Daftar Teman Aktif */}
        <div style={{ border: '1px solid #e8e8e8', padding: '15px', borderRadius: '8px', marginTop: '1.5rem' }}>
          <h4>👥 Status Bebas Asap Teman ({friends.length})</h4>
          {friends.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>Belum memiliki teman terhubung.</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {friends.map((friend, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <img src={friend.profile_photo || 'https://via.placeholder.com/40'} alt={friend.username} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', backgroundColor: '#ccc' }} />
                  <div>
                    <strong style={{ display: 'block' }}>@{friend.username}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#555' }}>
                      {`🔥 ${friend.streak} | `}
                      {friend.roomId && <button onClick={() => router.push(`/chat?room=${friend.roomId}&name=${friend.username}`)} style={{ background: 'none', border: 'none', color: '#52c41a', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>chat</button>}
                      {(friend.whatsapp || friend.instagram) && ' | '}
                      {friend.whatsapp && <a href={`https://wa.me/${friend.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', textDecoration: 'none', marginRight: '8px', fontWeight: 'bold' }}>wa</a>}
                      {friend.instagram && <a href={`https://instagram.com/${friend.instagram}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', textDecoration: 'none', fontWeight: 'bold' }}>ig</a>}
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