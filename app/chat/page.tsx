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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fffefb', color: '#201515', fontFamily: '"Inter", sans-serif' }}>
        <p style={{ fontSize: '18px', fontWeight: '500' }}>Memuat obrolan...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fffefb', minHeight: '100vh' }}>
      <main style={{ padding: '4rem 2rem', fontFamily: '"Inter", sans-serif', maxWidth: '800px', margin: '0 auto', color: '#201515' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #c5c0b1', paddingBottom: '1.5rem' }}>
          <button 
            onClick={() => router.push('/profil')} 
            style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #201515', backgroundColor: '#fffefb', color: '#201515', cursor: 'pointer', fontWeight: '600', fontSize: '14.4px' }}
          >
            ⬅ Kembali
          </button>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '500' }}>Obrolan dengan {friendName}</h2>
        </header>

        {/* Chat Area */}
        <div style={{ height: '60vh', overflowY: 'auto', backgroundColor: '#f8f4f0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '12px', marginTop: '2rem' }}>
          {messages.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#939084', margin: 'auto', fontSize: '16px' }}>Belum ada pesan. Sapa temanmu!</p>
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
                        backgroundColor: isMe ? '#201515' : '#fffefb',
                        color: isMe ? '#fffefb' : '#201515',
                        border: isMe ? 'none' : '1px solid #c5c0b1',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        borderBottomRightRadius: isMe ? '0' : '12px',
                        borderBottomLeftRadius: !isMe ? '0' : '12px',
                        fontSize: '16px',
                        lineHeight: '1.5'
                    }}>
                        {msg.message}
                    </div>
                    <div style={{ fontSize: '14px', color: '#939084', marginTop: '6px', textAlign: isMe ? 'right' : 'left' }}>
                        {dapatkanWaktuLokal(msg.time_sent)}
                    </div>
                  </div>
              );
              })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            style={{ flex: 1, padding: '12px 16px', borderRadius: '6px', border: '1px solid #201515', backgroundColor: '#fffefb', color: '#201515', fontSize: '16px', fontFamily: '"Inter", sans-serif' }}
          />
          <button 
            type="submit" 
            style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: '#ff4f00', color: '#fffefb', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '16px', transition: 'opacity 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Kirim
          </button>
        </form>
      </main>
    </div>
  );
}

// 2. Eksport komponen utama sebagai pembungkus Suspense
export default function ChatRoom() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fffefb', color: '#201515', fontFamily: '"Inter", sans-serif' }}>
        <p style={{ fontSize: '18px', fontWeight: '500' }}>Memuat halaman chat...</p>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}