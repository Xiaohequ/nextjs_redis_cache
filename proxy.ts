import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { redis } from '@/app/lib/redis';
import { jwtVerify } from 'jose';
import {NextRequest, NextResponse} from "next/server";

export default NextAuth(authConfig).auth;

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('__Secure-session-id')?.value;

  if (!sessionId) {
    // Pas de session → redirect login si route protégée
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    // Récupère le vrai token depuis Redis
    const storedToken = await redis.get(`session:${sessionId}`);
    if (!storedToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Optionnel : vérifie la signature (double sécurité)
    const { payload } = await jwtVerify(storedToken, secret);

    // Tu peux ajouter le user dans les headers pour les Server Components / Route Handlers
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.id as string);
    return response;
  } catch (err) {
    console.error('Invalid session', err);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  // https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};