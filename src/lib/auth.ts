import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import SlackProvider from "next-auth/providers/slack";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
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
      if (account && user.id) {
        // Store the connection tokens for later API access
        if (account.access_token) {
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
        }
      }
      return true;
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
