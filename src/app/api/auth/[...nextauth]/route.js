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
            membershipStatus: user.membershipStatus,
            membershipExpiry: user.membershipExpiry,
            isMembershipActive: user.isMembershipActive(),
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
        token.membershipStatus = user.membershipStatus;
        token.membershipExpiry = user.membershipExpiry;
        token.isMembershipActive = user.isMembershipActive;
      }
      
      // Refresh membership data from database on every token access
      if (token.id && !user) {
        try {
          await connect();
          const dbUser = await Member.findById(token.id);
          if (dbUser) {
            token.membershipStatus = dbUser.membershipStatus;
            token.membershipExpiry = dbUser.membershipExpiry;
            token.isMembershipActive = dbUser.isMembershipActive();
            token.role = dbUser.role;
            token.isAdmin = dbUser.isAdmin;
          }
        } catch (error) {
          console.error("Error refreshing token with latest member data:", error);
        }
      }
      
      // Also check membership expiry based on current token data
      if (token.id && token.membershipExpiry) {
        const expiryDate = new Date(token.membershipExpiry);
        const now = new Date();
        token.isMembershipActive = token.membershipStatus === 'active' && expiryDate > now;
      }
      
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.isAdmin = token.isAdmin;
      session.user.membershipStatus = token.membershipStatus;
      session.user.membershipExpiry = token.membershipExpiry;
      session.user.isMembershipActive = token.isMembershipActive;
      return session;
    },
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});

export const { GET, POST } = handlers;
