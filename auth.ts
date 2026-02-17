import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

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
  ...authConfig,
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
  ]
});