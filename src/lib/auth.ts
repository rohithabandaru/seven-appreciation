import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";
import { checkRateLimit, resetRateLimit, RATE_LIMIT_POLICIES } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { logSecurityEvent } from "@/lib/security-logger";

import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "w1khxVWwDxKqcLWqDD2hnVj8w3pA/ejZ7PvEY6qnaWk=",
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email Address", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email) {
          throw new Error("Missing email");
        }

        const email = credentials.email.toLowerCase();

        const ip = getClientIp(req as unknown as Request);

        const rlCheck = checkRateLimit('login:' + ip, RATE_LIMIT_POLICIES.login);
        if (!rlCheck.allowed) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        const rlEmailCheck = checkRateLimit('login-email:' + email, RATE_LIMIT_POLICIES.loginPerEmail);
        if (!rlEmailCheck.allowed) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        try {
          const banned = await prisma.bannedIP.findUnique({ where: { ip } });
          if (banned) {
            throw new Error("BANNED");
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.message === "BANNED") throw err;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: email,
          }
        });

        if (!user) {
          logSecurityEvent({ event: 'failed_login', ip, email, detail: 'Account not found', endpoint: '/api/auth/login' });
          throw new Error("Account not found. Please sign up first.");
        }

        if (!credentials.password) {
          throw new Error("Missing password");
        }

        if (!user.password) {
          logSecurityEvent({ event: 'failed_login', ip, email, detail: 'No password set (OAuth account)', endpoint: '/api/auth/login' });
          throw new Error("This account uses social login. Please sign in with Google.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          logSecurityEvent({ event: 'failed_login', ip, email, endpoint: '/api/auth/login' });
          throw new Error("Invalid password");
        }

        logSecurityEvent({ event: 'successful_login', ip, email, endpoint: '/api/auth/login' });
        resetRateLimit('login:' + ip);
        resetRateLimit('login-email:' + email);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days session persistence
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.role) {
        session.user.role = token.role as string;
      }
      if (session.user && token.name) {
        session.user.name = token.name as string;
      }
      if (session.user && token.picture) {
        session.user.image = token.picture as string;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign-in: set role from the user object
        token.sub = user.id;
        token.name = user.name;
        token.picture = user.image;
        token.role = 'role' in user ? (user as { role: string }).role : 'user';
        token.roleCheckedAt = Date.now();
      } else if (trigger === "update" && session) {
        // Session update trigger (e.g. from profile page)
        if (session.name) token.name = session.name;
        if (session.image !== undefined) token.picture = session.image;
      } else if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true, name: true, image: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            if (dbUser.name) token.name = dbUser.name;
            if (dbUser.image) token.picture = dbUser.image;
          }
        } catch {
          // If DB lookup fails, keep current role to avoid locking users out
        }
      }
      return token;
    },
  },
};

export async function isDbAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role === 'admin';
  } catch {
    return false;
  }
}
