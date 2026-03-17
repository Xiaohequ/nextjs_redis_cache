import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks : {
    authorized({ auth, request : {nextUrl}}){
        // Laisse le middleware/protected layouts gérer l'accès.
        console.log(`authorized (edge): user = ${JSON.stringify(auth?.user)}, path = ${nextUrl.pathname}`);
        return true;
    }
  },
  providers : [] // add providers with an empty array for now
} satisfies NextAuthConfig