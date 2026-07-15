'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Konstanta Token Desain Zapier
const TOKENS = {
  colors: {
    canvas: '#fffefb',       // Warm off-white background
    canvasSoft: '#f8f4f0',   // Cream-tinted soft surface for cards
    ink: '#201515',          // Deep coffee for headings and text
    inkSoft: '#2f2a26',      // Near-black with brown warmth
    body: '#605d52',         // Default body text color
    bodyMid: '#939084',      // Secondary body / metadata
    primary: '#ff4f00',      // Zapier Orange conversion accent
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    displaySubSm: { fontSize: '24px', fontWeight: '600', lineHeight: '30px', color: '#201515' },
    displayXs: { fontSize: '20px', fontWeight: '700', lineHeight: '25px', color: '#201515' },
    bodyMd: { fontSize: '18px', fontWeight: '400', lineHeight: '27px', color: '#605d52' },
    bodySm: { fontSize: '16px', fontWeight: '400', lineHeight: '24px', color: '#605d52' },
    buttonMd: { fontSize: '18px', fontWeight: '600', lineHeight: '27px' },
    buttonSm: { fontSize: '14.4px', fontWeight: '700', lineHeight: '14.4px' }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxxl: '64px'
  },
  rounded: {
    sm: '6px',
    md: '12px',
    pill: '9999px'
  }
};

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
      const filePath = `${user.id}/${Date.now()}_avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

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

    if (!fullName.trim() || !cleanUsername) {
      alert("Nama Lengkap dan Username tidak boleh kosong.");
      setIsUpdatingProfile(false);
      return;
    }

    try {
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

  // Penerapan Gaya Komponen Berdasarkan Aturan Desain
  const styles = {
    main: {
      padding: `${TOKENS.spacing['2xl']} ${TOKENS.spacing.lg}`,
      fontFamily: TOKENS.typography.fontFamily,
      maxWidth: '640px',
      margin: '0 auto',
      backgroundColor: TOKENS.colors.canvas,
      color: TOKENS.colors.body,
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${TOKENS.colors.ink}`,
      paddingBottom: TOKENS.spacing.lg,
      marginBottom: TOKENS.spacing.xl
    },
    profileBlock: {
      display: 'flex',
      alignItems: 'center',
      gap: TOKENS.spacing.md
    },
    avatarHeader: {
      width: '56px',
      height: '56px',
      borderRadius: TOKENS.rounded.pill,
      objectFit: 'cover' as const,
      border: `1px solid ${TOKENS.colors.ink}`
    },
    navContainer: {
      display: 'flex',
      gap: TOKENS.spacing.sm,
      marginTop: TOKENS.spacing.lg,
      marginBottom: TOKENS.spacing['2xl'],
      flexWrap: 'wrap' as const
    },
    // button-primary (Orange CTA)
    btnPrimary: {
      ...TOKENS.typography.buttonMd,
      padding: `${TOKENS.spacing.md} ${TOKENS.spacing.xl}`,
      borderRadius: TOKENS.rounded.md,
      backgroundColor: TOKENS.colors.primary,
      color: TOKENS.colors.canvas,
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600'
    },
    // button-secondary (Coffee Ink CTA)
    btnSecondary: {
      ...TOKENS.typography.buttonMd,
      padding: `${TOKENS.spacing.md} ${TOKENS.spacing.xl}`,
      borderRadius: TOKENS.rounded.md,
      backgroundColor: TOKENS.colors.ink,
      color: TOKENS.colors.canvas,
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      textAlign: 'center' as const
    },
    // button-tertiary (Outline CTA)
    btnTertiary: {
      ...TOKENS.typography.buttonMd,
      padding: `${TOKENS.spacing.md} ${TOKENS.spacing.xl}`,
      borderRadius: TOKENS.rounded.md,
      backgroundColor: TOKENS.colors.canvas,
      color: TOKENS.colors.ink,
      border: `1px solid ${TOKENS.colors.ink}`,
      cursor: 'pointer',
      fontWeight: '600',
      textAlign: 'center' as const
    },
    // button-text
    btnText: {
      ...TOKENS.typography.buttonSm,
      backgroundColor: 'transparent',
      color: TOKENS.colors.primary,
      border: 'none',
      cursor: 'pointer',
      padding: '0 4px',
      textDecoration: 'underline'
    },
    // card-content (Cream feature surface)
    cardContent: {
      backgroundColor: TOKENS.colors.canvasSoft,
      color: TOKENS.colors.ink,
      padding: TOKENS.spacing.xl,
      borderRadius: TOKENS.rounded.md,
      marginBottom: TOKENS.spacing.xl
    },
    // pricing-card style (Hairline border layout)
    cardHairline: {
      backgroundColor: TOKENS.colors.canvas,
      color: TOKENS.colors.ink,
      border: `1px solid ${TOKENS.colors.ink}`,
      padding: TOKENS.spacing.xl,
      borderRadius: TOKENS.rounded.md,
      marginBottom: TOKENS.spacing.xl
    },
    // text-input
    textInput: {
      ...TOKENS.typography.bodyMd,
      backgroundColor: TOKENS.colors.canvas,
      color: TOKENS.colors.ink,
      border: `1px solid ${TOKENS.colors.ink}`,
      padding: `${TOKENS.spacing.md} ${TOKENS.spacing.lg}`,
      borderRadius: TOKENS.rounded.sm,
      width: '100%',
      boxSizing: 'border-box' as const
    },
    formGroup: {
      marginBottom: TOKENS.spacing.lg
    },
    inputLabel: {
      display: 'block',
      marginBottom: TOKENS.spacing.xs,
      color: TOKENS.colors.ink,
      fontWeight: '600',
      ...TOKENS.typography.bodySm
    }
  };

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <div style={styles.profileBlock}>
          <img 
            src={avatarUrl || 'https://via.placeholder.com/50'} 
            alt="Avatar" 
            style={styles.avatarHeader} 
          />
          <div>
            <h2 style={{ margin: 0, ...TOKENS.typography.displayXs }}>{profile?.full_name || 'User'}</h2>
            <span style={{ color: TOKENS.colors.bodyMid, ...TOKENS.typography.bodySm }}>@{profile?.username || 'username'}</span>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ ...styles.btnTertiary, padding: '8px 16px', ...TOKENS.typography.buttonSm }}
        >
          Keluar
        </button>
      </header>

      <nav style={styles.navContainer}>
        <button onClick={() => router.push('/home')} style={{ ...styles.btnTertiary, flex: 1, padding: '10px' }}>/home</button>
        <button onClick={() => router.push('/profil')} style={{ ...styles.btnSecondary, flex: 1, padding: '10px' }}>/profil</button>
        <button onClick={() => router.push('/progress')} style={{ ...styles.btnTertiary, flex: 1, padding: '10px' }}>/progress</button>
        <button onClick={() => router.push('/exercise')} style={{ ...styles.btnTertiary, flex: 1, padding: '10px' }}>/exercise</button>
      </nav>
      <br />
      <section>
        {/* PANEL PENGATURAN IDENTITAS PROFIL */}
        <div style={styles.cardContent}>
          <h4 style={{ margin: `0 0 ${TOKENS.spacing.lg} 0`, ...TOKENS.typography.displaySubSm }}>Edit Biodata & Foto Profil</h4>
          
          {/* UPLOAD & HAPUS FOTO PROFIL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing.lg, marginBottom: TOKENS.spacing.xl, paddingBottom: TOKENS.spacing.lg, borderBottom: `1px dashed ${TOKENS.colors.bodyMid}` }}>
            <img 
              src={avatarUrl || 'https://via.placeholder.com/80'} 
              alt="Preview Avatar" 
              style={{ width: '72px', height: '72px', borderRadius: TOKENS.rounded.pill, objectFit: 'cover', border: `1px solid ${TOKENS.colors.ink}` }} 
            />
            <div>
              <label style={{ ...styles.btnSecondary, display: 'inline-block', padding: '8px 16px', ...TOKENS.typography.buttonSm }}>
                {isUploadingPhoto ? 'Mengunggah...' : 'Ubah Foto'}
                <input type="file" accept="image/*" onChange={handleUploadPhoto} disabled={isUploadingPhoto} style={{ display: 'none' }} />
              </label>
              {avatarUrl && (
                <button 
                  onClick={handleDeletePhoto}
                  disabled={isUploadingPhoto}
                  style={{ ...styles.btnTertiary, marginLeft: TOKENS.spacing.sm, padding: '8px 16px', ...TOKENS.typography.buttonSm }}
                >
                  Hapus
                </button>
              )}
            </div>
          </div>

          {/* EDIT NAMA LENGKAP & USERNAME */}
          <div style={styles.formGroup}>
            <label style={styles.inputLabel}>Nama Lengkap:</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              style={styles.textInput}
            />
          </div>

          <div style={{ ...styles.formGroup, marginBottom: TOKENS.spacing.xl }}>
            <label style={styles.inputLabel}>Username (@):</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={styles.textInput}
            />
          </div>

          <button 
            onClick={handleUpdateProfileData}
            disabled={isUpdatingProfile}
            style={{ ...styles.btnPrimary, width: '100%' }}
          >
            {isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
          </button>
        </div>

        {/* Manajemen Kontak Sosial Sendiri */}
        <div style={styles.cardContent}>
          <h4 style={{ margin: `0 0 ${TOKENS.spacing.lg} 0`, ...TOKENS.typography.displaySubSm }}>Kontak Anda</h4>
          
          <div style={styles.formGroup}>
            <label style={styles.inputLabel}>WhatsApp:</label>
            <div style={{ display: 'flex', gap: TOKENS.spacing.sm }}>
              <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Contoh: 08123456789" style={styles.textInput} />
              {whatsapp && <button onClick={() => handleDeleteContact('whatsapp')} style={{ ...styles.btnTertiary, padding: '12px' }}>Hapus</button>}
            </div>
          </div>
          
          <div style={{ ...styles.formGroup, marginBottom: TOKENS.spacing.xl }}>
            <label style={styles.inputLabel}>Instagram Username:</label>
            <div style={{ display: 'flex', gap: TOKENS.spacing.sm }}>
              <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Contoh: naufal_aufa" style={styles.textInput} />
              {instagram && <button onClick={() => handleDeleteContact('instagram')} style={{ ...styles.btnTertiary, padding: '12px' }}>Hapus</button>}
            </div>
          </div>
          
          <button onClick={handleSaveContact} disabled={isSavingContact} style={{ ...styles.btnPrimary, width: '100%' }}>
            {isSavingContact ? 'Menyimpan...' : 'Simpan / Perbarui Kontak'}
          </button>
        </div>

        {/* Undangan Masuk */}
        <div style={{ ...styles.cardContent, border: `1px solid ${TOKENS.colors.ink}` }}>
          <h4 style={{ margin: `0 0 ${TOKENS.spacing.lg} 0`, ...TOKENS.typography.displaySubSm }}>📩 Undangan Teman Masuk ({incomingRequests.length})</h4>
          {incomingRequests.length === 0 ? (
            <p style={{ color: TOKENS.colors.bodyMid, fontStyle: 'italic', margin: 0, ...TOKENS.typography.bodySm }}>Tidak ada undangan pertemanan baru.</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {incomingRequests.map((req, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${TOKENS.spacing.sm} 0`, borderBottom: `1px solid ${TOKENS.colors.bodyMid}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing.sm }}>
                    <img src={req.profile_photo || 'https://via.placeholder.com/40'} alt={req.username} style={{ width: '36px', height: '36px', borderRadius: TOKENS.rounded.pill, objectFit: 'cover' }} />
                    <strong style={{ color: TOKENS.colors.ink }}>@{req.username}</strong>
                  </div>
                  <button onClick={() => handleAcceptRequest(req.connectionTableId)} style={{ ...styles.btnPrimary, padding: '8px 16px', ...TOKENS.typography.buttonSm }}>Accept</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Daftar Teman Aktif */}
        <div style={styles.cardHairline}>
          <h4 style={{ margin: `0 0 ${TOKENS.spacing.lg} 0`, ...TOKENS.typography.displaySubSm }}>👥 Status Bebas Asap Teman ({friends.length})</h4>
          {friends.length === 0 ? (
            <p style={{ color: TOKENS.colors.bodyMid, fontStyle: 'italic', margin: 0, ...TOKENS.typography.bodySm }}>Belum memiliki teman terhubung.</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {friends.map((friend, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing.md, padding: `${TOKENS.spacing.md} 0`, borderBottom: `1px solid ${TOKENS.colors.canvasSoft}` }}>
                  <img src={friend.profile_photo || 'https://via.placeholder.com/40'} alt={friend.username} style={{ width: '40px', height: '40px', borderRadius: TOKENS.rounded.pill, objectFit: 'cover', border: `1px solid ${TOKENS.colors.ink}` }} />
                  <div>
                    <strong style={{ display: 'block', color: TOKENS.colors.ink }}>@{friend.username}</strong>
                    <span style={{ ...TOKENS.typography.bodySm, color: TOKENS.colors.body }}>
                      {`🔥 ${friend.streak} | `}
                      {friend.roomId && <button onClick={() => router.push(`/chat?room=${friend.roomId}&name=${friend.username}`)} style={styles.btnText}>chat</button>}
                      {(friend.whatsapp || friend.instagram) && ' | '}
                      {friend.whatsapp && <a href={`https://wa.me/${friend.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: TOKENS.colors.ink, fontWeight: 'bold', textDecoration: 'underline', marginRight: TOKENS.spacing.sm }}>wa</a>}
                      {friend.instagram && <a href={`https://instagram.com/${friend.instagram}`} target="_blank" rel="noopener noreferrer" style={{ color: TOKENS.colors.ink, fontWeight: 'bold', textDecoration: 'underline' }}>ig</a>}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fitur Cari Teman */}
        <div style={styles.cardHairline}>
          <h4 style={{ margin: `0 0 ${TOKENS.spacing.lg} 0`, ...TOKENS.typography.displaySubSm }}>🔍 Cari Teman Baru</h4>
          <div style={{ display: 'flex', gap: TOKENS.spacing.sm, marginBottom: TOKENS.spacing.sm }}>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari username teman..." style={{ ...styles.textInput, flex: 1 }} />
            <button onClick={handleSearchFriend} style={styles.btnSecondary}>Cari</button>
          </div>
          {searchMessage && <p style={{ color: TOKENS.colors.primary, ...TOKENS.typography.bodySm, margin: `${TOKENS.spacing.xs} 0 0 0` }}>{searchMessage}</p>}
          
          {searchResult && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: TOKENS.spacing.md, backgroundColor: TOKENS.colors.canvasSoft, borderRadius: TOKENS.rounded.md, marginTop: TOKENS.spacing.md, border: `1px dashed ${TOKENS.colors.ink}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: TOKENS.spacing.sm }}>
                <img src={searchResult.profile_photo || 'https://via.placeholder.com/40'} alt={searchResult.username} style={{ width: '36px', height: '36px', borderRadius: TOKENS.rounded.pill, objectFit: 'cover' }} />
                <strong style={{ color: TOKENS.colors.ink }}>@{searchResult.username}</strong>
              </div>
              {searchResult.existingConn ? (
                <span style={{ ...TOKENS.typography.bodySm, color: TOKENS.colors.bodyMid, fontStyle: 'italic' }}>
                  {searchResult.existingConn.is_accepted ? 'Sudah Berteman' : 'Permintaan Tertunda'}
                </span>
              ) : (
                <button onClick={() => handleSendRequest(searchResult.id)} style={{ ...styles.btnPrimary, padding: '8px 16px', ...TOKENS.typography.buttonSm }}>Tambah Teman</button>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}