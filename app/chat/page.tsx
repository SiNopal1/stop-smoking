'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Beritahu Next.js untuk selalu me-render halaman ini di sisi server saat diakses (bukan saat build)
export const dynamic = 'force-dynamic';

export default function ChatRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room'); // Ini adalah ID dari tabel connection
  const friendName = searchParams.get('name') || 'Teman';

  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah saat ada pesan baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!roomId) {
      alert("Ruang obrolan tidak valid!");
      router.push('/profil');
      return;
    }

    const initChat = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/');
            return;
        }
        setUserId(user.id);

        // 1. Ambil riwayat chat sebelumnya
        const { data: chatHistory, error } = await supabase
            .from('chat')
            .select('*')
            .eq('id', roomId)
            .order('time_sent', { ascending: true });

        if (!error && chatHistory) setMessages(chatHistory);
        setLoading(false);

        // Tambahkan string acak agar nama channel selalu unik tiap kali useEffect ke-trigger
        const uniqueChannelName = `room_${roomId}_${Math.random().toString(36).substring(7)}`;

        // 2. Berlangganan (Subscribe) ke pesan baru secara real-time
        const channel = supabase
            .channel(uniqueChannelName) // <-- UBAH DI SINI: Gunakan nama unik
            .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'chat', filter: `id=eq.${roomId}` },
            (payload) => {
                if (payload.new.sender !== user.id) {
                setMessages((prev) => [...prev, payload.new]);
                }
            }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    initChat();
  }, [roomId, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    const msgText = newMessage;
    setNewMessage(''); // Kosongkan input secara optimis

    // Data pesan sementara (optimistic UI)
    const tempMsg = {
      chat_id: Math.random().toString(), // ID sementara
      id: roomId,
      sender: userId,
      message: msgText,
      time_sent: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    // Masukkan ke database
    const { error } = await supabase
      .from('chat')
      .insert({
        id: roomId,
        sender: userId,
        message: msgText,
        // time_sent akan otomatis terisi secara default di Supabase (now())
      });

    if (error) {
      alert("Gagal mengirim pesan");
      console.error(error);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Memuat obrolan...</p>;

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <button onClick={() => router.push('/profil')} style={{ cursor: 'pointer', padding: '5px 10px' }}>⬅ Kembali</button>
        <h2 style={{ margin: 0 }}>Obrolan dengan {friendName}</h2>
      </header>

      {/* Area Chat */}
        <div style={{ height: '60vh', overflowY: 'auto', backgroundColor: '#f9f9f9', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', margin: 'auto' }}>Belum ada pesan. Sapa temanmu!</p>
        ) : (
            messages.map((msg) => {
            const isMe = msg.sender === userId;

            // --- LOGIC PERBAIKAN WAKTU DI SINI ---
            const dapatkanWaktuLokal = (timeStr: string) => {
                if (!timeStr) return '';
                
                // Jika string tidak diakhiri 'Z' dan tidak punya penanda timezone (+07 / +00)
                // Kita tempelkan 'Z' secara paksa agar JavaScript tahu ini adalah UTC murni.
                let formatUtc = timeStr;
                if (!formatUtc.endsWith('Z') && !formatUtc.includes('+')) {
                // Ganti spasi menjadi 'T' jika format dari database berupa "YYYY-MM-DD HH:mm:ss"
                formatUtc = formatUtc.replace(' ', 'T') + 'Z';
                }

                return new Date(formatUtc).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
                });
            };
            // -------------------------------------

            return (
                <div key={msg.chat_id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                <div style={{
                    backgroundColor: isMe ? '#e6f7ff' : '#fff',
                    border: `1px solid ${isMe ? '#91d5ff' : '#ddd'}`,
                    padding: '10px',
                    borderRadius: '8px',
                    borderBottomRightRadius: isMe ? '0' : '8px',
                    borderBottomLeftRadius: !isMe ? '0' : '8px'
                }}>
                    {msg.message}
                </div>
                
                {/* Tampilkan waktu yang sudah dikonversi dengan fungsi di atas */}
                <div style={{ fontSize: '10px', color: '#888', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                    {dapatkanWaktuLokal(msg.time_sent)}
                </div>
                </div>
            );
            })
        )}
        <div ref={messagesEndRef} />
        </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ketik pesan..."
          style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '20px', backgroundColor: '#1890ff', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Kirim
        </button>
      </form>
    </main>
  );
}