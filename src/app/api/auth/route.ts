import { supabase } from '../../../lib/supabase';

// Handler login API Next.js App Router
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Cek username dan password default 'ayub' / 'root'
    if (username === 'ayub' && password === 'root') {
      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            username: 'ayub',
            full_name: 'Ayub (Siswa Kelas XII)',
          },
          token: 'cuansiswa_jwt_ayub_session_token',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': 'cuansiswa_session=cuansiswa_jwt_ayub_session_token; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Username atau password salah (gunakan default: ayub / root)' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
