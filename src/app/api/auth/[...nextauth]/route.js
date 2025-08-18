import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connect } from "@/lib/mongodb/mongoose";
import { Member } from "@/lib/models/member.model";
import bcrypt from "bcrypt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connect();

          const user = await Member.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("No user found with this email.");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error("Incorrect password.");
          }

          return {
            id: user._id.toString(),
            name: user.fullName,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/members-login", // custom login page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.isAdmin = token.isAdmin;
      return session;
    },
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});

export const { GET, POST } = handlers;
