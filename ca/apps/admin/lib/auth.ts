import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@workspace/db";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface User {
    role: string;
    department: string;
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      department: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    department: string;
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

          // Only allow officers and admins in admin app
          if (user.role === "citizen") {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department || "",
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
        token.department = user.department;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.department = token.department as string;
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