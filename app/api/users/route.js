import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY

// Inisialisasi client Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

// Format Next.js App Router yang benar untuk method GET
export async function GET() {
  try {
    const { data, error } = await supabase.from('profile').select('*')
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 })
  }
}