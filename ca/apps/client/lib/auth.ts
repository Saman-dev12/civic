import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@workspace/db";
import bcrypt from "bcryptjs";

// Extend NextAuth User type to include 'role'
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.isActive) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Only allow citizens in client app
          if (user.role !== "citizen") {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}