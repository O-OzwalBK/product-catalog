// import NextAuth from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import { loginUser } from "@/lib/api";

// export const {
//   handlers: { GET, POST },
//   auth,
//   signIn,
//   signOut,
// } = NextAuth({
//   providers: [
//     Credentials({
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;
//         try {
//           const { user, token } = await loginUser({
//             email: credentials.email as string,
//             password: credentials.password as string,
//           });
//           // Whatever is returned here becomes `user` in the jwt() callback below.
//           return {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             backendToken: token,
//           };
//         } catch {
//           return null; // wrong credentials → NextAuth treats this as a failed login
//         }
//       },
//     }),
//   ],
//   session: { strategy: "jwt" }, // no session table needed — mirrors the backend's own stateless JWT approach
//   callbacks: {
//     async jwt({ token, user }) {
//       // `user` only exists on the initial sign-in call — persist the backend
//       // token into NextAuth's own JWT so it survives across requests.
//       if (user)
//         token.backendToken = (user as { backendToken: string }).backendToken;
//       return token;
//     },
//     async session({ session, token }) {
//       session.backendToken = token.backendToken as string;
//       return session;
//     },
//   },
//   pages: { signIn: "/login" },
// });

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginUser } from "@/lib/api";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const { user, token } = await loginUser({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            backendToken: token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.backendToken = user.backendToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.backendToken = token.backendToken;
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.AUTH_SECRET,
};