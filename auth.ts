import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import postgres from 'postgres';
import {redis} from "@/app/lib/redis";

const sql = postgres(process.env.POSTGRES_URL!, { max : 10});

async function getUser(email: String): Promise<User | undefined> {
    try {
        const user = await sql<User[]>`Select * from users where email=${email}`;
        return user[0];
    } catch(error){
        console.error('Failed to fetch user: ', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut } = NextAuth({
  // ...authConfig,
  providers: [
    Credentials({
        async authorize(credentials) {
            console.log("authorize: test");
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
        strategy: "jwt", // Très important : force l'usage de l'adapter Redis
        maxAge: 30 * 24 * 60 * 60, // 30 jours en secondes
        updateAge: 24 * 60 * 60, // Mettre à jour toutes les 24h
    },

    secret: process.env.AUTH_SECRET,

    jwt: { encode: async ({ token }) => token ? await new SignJWT(token).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('30d').sign(secret) : '' },

    callbacks: {
        async jwt({ token, user }) {
            // Au moment du login → on ajoute les données user dans le token
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.email = user.email;

                // Crée un ID de session unique
                const sessionId = crypto.randomUUID();

                // Stocke le JWT complet dans Redis (clé = sessionId)
                await redis.set(
                    `session:${sessionId}`,
                    JSON.stringify(token),
                    'EX',
                    60 * 60 * 24 * 7 // même TTL que maxAge
                );

                // Associe user → sessions (pour lister/blacklist)
                await redis.sadd(`user_sessions:${user.id}`, sessionId);

                token.sessionId = sessionId; // on met l'ID dans le JWT
            }
            return token;
        },

        async session({ session, token }) {
            if (token?.id) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.email = token.email as string;
            }
            return session;
        }
    },
    // IMPORTANT : on surcharge le cookie pour ne stocker QUE l'ID de session
    cookies: {
        sessionToken: {
            name: `__Secure-session-id`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        }
    },
    // Optionnel : events pour cleanup Redis
    events: {
        async signOut({ token }) {
            if (token?.sessionId) {
                const sessionId = token.sessionId as string;
                const userId = token.id as string;

                await redis.del(`session:${sessionId}`);
                await redis.srem(`user_sessions:${userId}`, sessionId);
            }
        }
    }
});