import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginUser } from "@/lib/api";

declare module "next-auth" {
  interface User {
    id: string;
    role?: "user" | "merchant";
    backendToken?: string;
  }

  interface Session {
    backendToken?: string;
    user: {
      id: string;
      role?: "user" | "merchant";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    role?: "user" | "merchant";
    backendToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
    role?: "user" | "merchant";
  }
}

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
          const response = await loginUser({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          return {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            backendToken: response.token,
            role: response.user.role,
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
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.backendToken = token.backendToken;
        session.user.role = token.role as "user" | "merchant";
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.AUTH_SECRET,
};
