// Next.js Middleware untuk proteksi rute internal
// Memeriksa keberadaan cookie session / token 'cuansiswa_session'

export function middleware(request: { cookies: { get: (name: string) => { value?: string } | undefined }; nextUrl: { pathname: string }; url: string }) {
  const session = request.cookies.get('cuansiswa_session');
  const pathname = request.nextUrl.pathname;

  // Jika belum login dan mengakses halaman dashboard, redirect ke /login
  if (!session && pathname !== '/login' && !pathname.startsWith('/api/auth')) {
    // Di Next.js: return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika sudah login dan mengakses /login, redirect ke / (dashboard)
  if (session && pathname === '/login') {
    // Di Next.js: return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
