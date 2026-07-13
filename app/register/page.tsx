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
    <main style={{ padding: '2rem' }}>
      <h2>Daftar Akun Baru</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input type="text" name="fullName" placeholder="Nama Lengkap" onChange={handleChange} required />
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <label>Kapan terakhir merokok?</label>
        <input type="datetime-local" name="lastSmoke" onChange={handleChange} required />
        
        <button type="submit">Daftar</button>
      </form>
      <p>Sudah punya akun? <Link href="/login">Login di sini</Link></p>
    </main>
  );
}