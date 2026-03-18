import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks : {
    authorized({ auth, request : {nextUrl}}){
        return true;
    }
  },
  providers : [] // add providers with an empty array for now
} satisfies NextAuthConfig