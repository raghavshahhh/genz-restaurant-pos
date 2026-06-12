// Proxy file for Next.js 16 middleware
export { middleware } from './src/middleware';
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};