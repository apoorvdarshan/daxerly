import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import SlackProvider from "next-auth/providers/slack";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

const prismaAdapter = PrismaAdapter(prisma);
const originalLinkAccount = prismaAdapter.linkAccount!;
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
prismaAdapter.linkAccount = (account: any) => {
  // Strip provider-specific fields that aren't in our Account schema
  const {
    created_at,
    bot_id,
    workspace_name,
    workspace_icon,
    workspace_id,
    owner,
    duplicated_template_id,
    request_id,
    refresh_token_expires_in,
    ...cleanAccount
  } = account as Record<string, unknown>;
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    SlackProvider({
      clientId: process.env.SLACK_CLIENT_ID ?? "",
      clientSecret: process.env.SLACK_CLIENT_SECRET ?? "",
    }),
    {
      id: "linear",
      name: "Linear",
      type: "oauth",
      authorization: {
        url: "https://linear.app/oauth/authorize",
        params: { scope: "read", response_type: "code" },
      },
      token: "https://api.linear.app/oauth/token",
      userinfo: {
        url: "https://api.linear.app/graphql",
        async request({ tokens }) {
          const res = await fetch("https://api.linear.app/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${tokens.access_token}`,
            },
            body: JSON.stringify({ query: "{ viewer { id name email } }" }),
          });
          const { data } = await res.json();
          return data?.viewer;
        },
      },
      profile(profile) {
        return { id: profile.id, name: profile.name, email: profile.email };
      },
      clientId: process.env.LINEAR_CLIENT_ID ?? "",
      clientSecret: process.env.LINEAR_CLIENT_SECRET ?? "",
    },
    {
      id: "notion",
      name: "Notion",
      type: "oauth",
      authorization: {
        url: "https://api.notion.com/v1/oauth/authorize",
        params: { owner: "user", response_type: "code" },
      },
      token: {
        url: "https://api.notion.com/v1/oauth/token",
        async request({ params, provider }) {
          const res = await fetch("https://api.notion.com/v1/oauth/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${Buffer.from(`${provider.clientId}:${provider.clientSecret}`).toString("base64")}`,
            },
            body: JSON.stringify({
              grant_type: "authorization_code",
              code: params.code,
              redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/notion`,
            }),
          });
          return { tokens: await res.json() };
        },
      },
      userinfo: {
        url: "https://api.notion.com/v1/users/me",
        async request({ tokens }) {
          const res = await fetch("https://api.notion.com/v1/users/me", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
              "Notion-Version": "2022-06-28",
            },
          });
          return res.json();
        },
      },
      profile(profile) {
        return {
          id: profile.bot?.owner?.user?.id || profile.id,
          name: profile.bot?.owner?.user?.name || "Notion User",
          email: profile.bot?.owner?.user?.person?.email || null,
        };
      },
      clientId: process.env.NOTION_CLIENT_ID ?? "",
      clientSecret: process.env.NOTION_CLIENT_SECRET ?? "",
    },
    {
      id: "gitlab",
      name: "GitLab",
      type: "oauth",
      authorization: {
        url: "https://gitlab.com/oauth/authorize",
        params: { scope: "read_user read_api" },
      },
      token: "https://gitlab.com/oauth/token",
      userinfo: "https://gitlab.com/api/v4/user",
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
      clientId: process.env.GITLAB_CLIENT_ID ?? "",
      clientSecret: process.env.GITLAB_CLIENT_SECRET ?? "",
    },
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
          // No user with this email — find any existing user to link to
          // (for cases where GitHub email != Google email)
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
