import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

const prismaAdapter = PrismaAdapter(prisma);
const originalLinkAccount = prismaAdapter.linkAccount!;
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
prismaAdapter.linkAccount = (account: any) => {
  // Strip provider-specific fields that aren't in our Account schema
  const { refresh_token_expires_in, ...cleanAccount } =
    account as Record<string, unknown>;
  return originalLinkAccount(cleanAccount as any);
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
};

export const authOptions: NextAuthOptions = {
  adapter: prismaAdapter,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Allow linking accounts with different emails to the same user
      // If user already exists with this email, allow sign-in
      // If user doesn't exist but there's a session, link the account
      if (account) {
        const existingAccount = await prisma.account.findFirst({
          where: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        });
        if (existingAccount) return true;

        // If this is a new provider connection and we have a logged-in user,
        // link it to the existing user instead of creating a new one
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (!existingUser && user.email) {
          // No user with this email — link this account to the currently
          // signed-in user's session, if any
          const sessions = await prisma.session.findMany({
            where: { expires: { gt: new Date() } },
            include: { user: true },
            take: 1,
            orderBy: { expires: "desc" },
          });
          if (sessions.length > 0) {
            const targetUser = sessions[0].user;
            await prisma.account.create({
              data: {
                userId: targetUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state as string | null,
              },
            });
            // Also save the connection
            if (account.access_token) {
              await prisma.connection.upsert({
                where: {
                  userId_provider: {
                    userId: targetUser.id,
                    provider: account.provider,
                  },
                },
                update: {
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token ?? null,
                  expiresAt: account.expires_at
                    ? new Date(account.expires_at * 1000)
                    : null,
                  scope: account.scope ?? null,
                },
                create: {
                  userId: targetUser.id,
                  provider: account.provider,
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token ?? null,
                  expiresAt: account.expires_at
                    ? new Date(account.expires_at * 1000)
                    : null,
                  scope: account.scope ?? null,
                },
              });
            }
            // Redirect back to dashboard instead of letting NextAuth create a new user
            return "/dashboard";
          }
        }
      }
      return true;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.access_token && user.id) {
        try {
          await prisma.connection.upsert({
            where: {
              userId_provider: {
                userId: user.id,
                provider: account.provider,
              },
            },
            update: {
              accessToken: account.access_token,
              refreshToken: account.refresh_token ?? null,
              expiresAt: account.expires_at
                ? new Date(account.expires_at * 1000)
                : null,
              scope: account.scope ?? null,
            },
            create: {
              userId: user.id,
              provider: account.provider,
              accessToken: account.access_token,
              refreshToken: account.refresh_token ?? null,
              expiresAt: account.expires_at
                ? new Date(account.expires_at * 1000)
                : null,
              scope: account.scope ?? null,
            },
          });
        } catch (e) {
          console.error("Failed to save connection:", e);
        }
      }
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
