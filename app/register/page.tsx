'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    lastSmoke: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Konversi tanggal ke standar ISO agar cocok dengan format database
    const lastSmokeISO = new Date(formData.lastSmoke).toISOString();

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          fullName: formData.fullName,
          name: formData.fullName,
          nama: formData.fullName,
          username: formData.username,
          last_smoke: lastSmokeISO
        }
      }
    });

    if (error) {
      alert('Gagal daftar: ' + error.message);
    } else {
      alert('Registrasi berhasil! Silakan login.');
      router.push('/login'); // Langsung arahkan ke halaman login
    }
  };

  return (
    <div style={{ backgroundColor: '#fffefb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: '"Inter", sans-serif' }}>
      <main style={{ width: '100%', maxWidth: '450px', backgroundColor: '#f8f4f0', padding: '32px', borderRadius: '12px', color: '#201515' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '500', margin: '0 0 8px 0', letterSpacing: '-0.6px' }}>Daftar Akun Baru</h2>
        <p style={{ color: '#605d52', fontSize: '16px', margin: '0 0 24px 0' }}>Mulai perjalanan transformatif Anda hari ini.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <input 
              type="text" 
              name="fullName" 
              placeholder="Nama Lengkap" 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #201515', backgroundColor: '#fffefb', color: '#201515', boxSizing: 'border-box', fontSize: '16px' }}
            />
          </div>

          <div>
            <input 
              type="text" 
              name="username" 
              placeholder="Username" 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #201515', backgroundColor: '#fffefb', color: '#201515', boxSizing: 'border-box', fontSize: '16px' }}
            />
          </div>

          <div>
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #201515', backgroundColor: '#fffefb', color: '#201515', boxSizing: 'border-box', fontSize: '16px' }}
            />
          </div>

          <div>
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #201515', backgroundColor: '#fffefb', color: '#201515', boxSizing: 'border-box', fontSize: '16px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '16px', fontWeight: '600', color: '#36342e' }}>Kapan terakhir merokok?</label>
            <input 
              type="datetime-local" 
              name="lastSmoke" 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #201515', backgroundColor: '#fffefb', color: '#201515', boxSizing: 'border-box', fontSize: '16px', fontFamily: '"Inter", sans-serif' }}
            />
          </div>
          
          <button 
            type="submit" 
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#ff4f00', color: '#fffefb', fontSize: '18px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', transition: 'background-color 0.2s ease' }}
          >
            Daftar
          </button>
        </form>

        <div style={{ borderTop: '1px solid #c5c0b1', marginTop: '24px', paddingTop: '16px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '16px', color: '#605d52' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: '#ff4f00', fontWeight: '600', textDecoration: 'none' }}>
              Login di sini
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}