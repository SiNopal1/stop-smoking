'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Memaksa halaman tetap dinamis di sisi server
export const dynamic = 'force-dynamic';

// 1. Pindahkan seluruh logika utama chat ke komponen internal ini
function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room'); // Ini adalah ID dari tabel connection
  const friendName = searchParams.get('name') || 'Teman';

  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

        const { data: chatHistory, error } = await supabase
            .from('chat')
            .select('*')
            .eq('id', roomId)
            .order('time_sent', { ascending: true });

        if (!error && chatHistory) setMessages(chatHistory);
        setLoading(false);

        const uniqueChannelName = `room_${roomId}_${Math.random().toString(36).substring(7)}`;

        const channel = supabase
            .channel(uniqueChannelName)
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
    setNewMessage('');

    const tempMsg = {
      chat_id: Math.random().toString(),
      id: roomId,
      sender: userId,
      message: msgText,
      time_sent: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    const { error } = await supabase
      .from('chat')
      .insert({
        id: roomId,
        sender: userId,
        message: msgText,
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

      <div style={{ height: '60vh', overflowY: 'auto', backgroundColor: '#f9f9f9', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', margin: 'auto' }}>Belum ada pesan. Sapa temanmu!</p>
        ) : (
            messages.map((msg) => {
            const isMe = msg.sender === userId;

            const dapatkanWaktuLokal = (timeStr: string) => {
                if (!timeStr) return '';
                let formatUtc = timeStr;
                if (!formatUtc.endsWith('Z') && !formatUtc.includes('+')) {
                  formatUtc = formatUtc.replace(' ', 'T') + 'Z';
                }
                return new Date(formatUtc).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });
            };

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
                <div style={{ fontSize: '10px', color: '#888', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                    {dapatkanWaktuLokal(msg.time_sent)}
                </div>
                </div>
            );
            })
        )}
        <div ref={messagesEndRef} />
      </div>

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

// 2. Eksport komponen utama sebagai pembungkus Suspense
export default function ChatRoom() {
  return (
    <Suspense fallback={<p style={{ textAlign: 'center', marginTop: '2rem' }}>Memuat halaman chat...</p>}>
      <ChatContent />
    </Suspense>
  );
}