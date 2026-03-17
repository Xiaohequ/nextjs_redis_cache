import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import postgres from 'postgres';
import {redis} from "@/app/lib/redis";
import type { JWT } from 'next-auth/jwt';

const sql = postgres(process.env.POSTGRES_URL!, { max : 10});
const sessionCookieName =
  process.env.NODE_ENV === 'production' ? '__Secure-session-id' : 'session-id';

async function getUser(email: string): Promise<User | undefined> {
    try {
        const user = await sql<User[]>`Select * from users where email=${email}`;
        return user[0];
    } catch(error){
        console.error('Failed to fetch user: ', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
        async authorize(credentials) {
            const parsedCredentials = z
                .object({ email : z.string().email(), password: z.string().min(6)})
                .safeParse(credentials);

            if(parsedCredentials.success) {
                const {email, password} = parsedCredentials.data;
                const user = await getUser(email);
                if(!user) return null;
                console.log("user is not null");
                // const passwordsMatch = await bcrypt.compare(password, user.password);
                const passwordsMatch = password == "123456"; //TODO
                console.log(`user passwordsMatch: ${passwordsMatch}`);

                if(passwordsMatch) return user;
            }

            console.log("Invalid credentials");
            return null;
        }
    })
  ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 jours en secondes
        updateAge: 24 * 60 * 60, // Mettre à jour toutes les 24h
    },

    secret: process.env.AUTH_SECRET,

    jwt: {
        /**
         * Store only the Redis session id in the cookie.
         * NextAuth will put the return value of `encode()` into the session cookie.
         */
        async encode({ token }) {
            const sessionId = (token as JWT | null)?.sessionId as string | undefined;
            return sessionId ?? '';
        },
        /**
         * Read the session id from the cookie, then hydrate the JWT from Redis.
         */
        async decode({ token }) {
            console.log(`decode: ${token}`)
            if (!token) return null;
            const stored = await redis.get(`session:${token}`);
            if (!stored) return null;
            try {
                return JSON.parse(stored) as JWT;
            } catch {
                return null;
            }
        },
    },

    callbacks: {
        async jwt({ token, user }) {
            // Au moment du login → on ajoute les données user dans le token
            if (user) {
                console.log(`jwt: ${JSON.stringify(user)}`)

                token.id = user.id;
                token.email = user.email;
                token.role = (user as any).role;

                // Crée un ID de session unique
                const sessionId = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

                // Stocke le JWT complet dans Redis (clé = sessionId)
                await redis.set( `session:${sessionId}`, JSON.stringify(token), 'EX', 30 * 24 * 60 * 60 ); // même TTL que session.maxAge

                // Associe user → sessions (pour lister/blacklist)
                await redis.sadd(`user_sessions:${user.id}`, sessionId);

                token.sessionId = sessionId; // on met l'ID dans le JWT
            }
            return token;
        },

        async session({ session, token }) {
            console.log(`session: ${JSON.stringify(session)}`);
            if (token?.id) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role as string;
                session.user.email = token.email as string;
            }
            return session;
        }
    },
    // IMPORTANT : on surcharge le cookie pour ne stocker QUE l'ID de session
    cookies: {
        sessionToken: {
            name: sessionCookieName,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        }
    },
});