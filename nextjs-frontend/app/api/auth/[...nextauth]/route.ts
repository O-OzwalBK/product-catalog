import NextAuth from "next-auth";
import { authOptions } from "@/auth"; // Check path points to your src/auth.ts

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
