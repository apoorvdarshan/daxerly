"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Receipt from "@/components/Receipt";
import { mockReceipt } from "@/lib/mock-data";

const integrations = [
  {
    name: "GitHub",
    desc: "Commits, PRs, reviews",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "GitLab",
    desc: "Commits, MRs, issues",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 00-.867 0L1.386 9.452.044 13.587a.924.924 0 00.331 1.023L12 23.054l11.625-8.443a.92.92 0 00.33-1.024z" />
      </svg>
    ),
  },
  {
    name: "Linear",
    desc: "Issues, projects, comments",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M1.043 7.265c-.413.413-.796.852-1.043 1.312C.16 12.484 2.612 17.156 6.533 20.3l1.202-1.202c-3.199-2.632-5.24-6.611-5.24-11.068 0-.922.087-1.824.253-2.698L1.043 7.265zm3.467-3.467l-1.87 1.87c1.876-1.04 4.028-1.633 6.32-1.633 5.49 0 10.16 3.388 12.088 8.187l1.733-1.733C20.508 5.456 15.463 2 9.64 2c-1.868 0-3.644.35-5.13.998V7.265zM12 22c5.523 0 10-4.477 10-10 0-2.4-.845-4.604-2.254-6.328L12 13.418l-7.746-7.746A9.955 9.955 0 002 12c0 5.523 4.477 10 10 10z" />
      </svg>
    ),
  },
  {
    name: "Slack",
    desc: "Messages, threads, channels",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.124 2.521a2.528 2.528 0 0 1 2.52-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.52V8.834zm-1.271 0a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zm-2.521 10.124a2.528 2.528 0 0 1 2.521 2.52A2.528 2.528 0 0 1 15.166 24a2.528 2.528 0 0 1-2.521-2.522v-2.52h2.521zm0-1.271a2.528 2.528 0 0 1-2.521-2.521 2.528 2.528 0 0 1 2.521-2.521h6.312A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.312z" />
      </svg>
    ),
  },
  {
    name: "Notion",
    desc: "Pages, databases edited",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L2.58 2.72c-.467.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.886c-.56.047-.747.327-.747.934zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.747 0-.933-.234-1.494-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.22.186c-.094-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.454-.234 4.763 7.28V9.387l-1.214-.14c-.094-.514.28-.886.747-.933zM2.208 1.127L15.89.067c1.68-.14 2.1.093 2.8.607l3.874 2.707c.467.327.607.747.607 1.214v16.08c0 1.027-.373 1.634-1.68 1.727l-15.458.933c-.98.047-1.448-.093-1.962-.747l-3.127-4.054c-.56-.747-.793-1.307-.793-1.96V2.86c0-.84.373-1.54 1.448-1.634z" />
      </svg>
    ),
  },
  {
    name: "Google Calendar",
    desc: "Meetings, time tracked",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.5 3h-3V1.5a.75.75 0 00-1.5 0V3h-6V1.5a.75.75 0 00-1.5 0V3h-3A2.25 2.25 0 002.25 5.25v14.25A2.25 2.25 0 004.5 21.75h15a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0019.5 3zm.75 16.5a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V9h16.5v10.5zm0-12H3.75V5.25a.75.75 0 01.75-.75h3v.75a.75.75 0 001.5 0V4.5h6v.75a.75.75 0 001.5 0V4.5h3a.75.75 0 01.75.75V7.5z" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-xs text-zinc-600 tracking-wider">
            LOADING
          </span>
        </div>
      </div>
    );
  }

  if (session) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background grid-bg relative overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Ambient glow */}
      <div className="fixed top-[-30%] right-[-10%] w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* ── Nav ────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-8 lg:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="daxerly" className="w-5 h-5" />
          <span className="font-display font-bold text-xl tracking-wide text-foreground">
            daxerly
          </span>
        </div>
        <button
          onClick={() => signIn("github")}
          className="font-mono text-xs tracking-wider text-zinc-500 hover:text-accent transition-colors duration-300 uppercase"
        >
          Sign in
        </button>
      </nav>

      {/* ── Hero ───────────────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 lg:px-12 pt-12 lg:pt-24 pb-32">
        <div className="grid lg:grid-cols-[1fr,440px] gap-16 lg:gap-24 items-start">
          {/* Left column */}
          <div className="pt-4 lg:pt-12 stagger">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-accent/40" />
              <span className="font-mono text-[10px] tracking-[0.3em] text-accent/70 uppercase">
                Daily Work Receipts
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight">
              <span className="text-foreground">Your work</span>
              <br />
              <span className="text-foreground">has a</span>
              <br />
              <span className="text-accent">price tag.</span>
            </h1>

            {/* Subhead */}
            <p className="mt-8 text-base sm:text-lg text-zinc-500 max-w-md leading-relaxed font-body">
              Connect your tools. We pull 24 hours of activity and print it as a
              thermal receipt — with an estimated dollar value for everything you
              shipped.
            </p>

            {/* CTA */}
            <div className="mt-12">
              <button
                onClick={() => signIn("github")}
                className="group relative inline-flex items-center gap-3 bg-accent hover:bg-accent-light text-background font-display font-bold text-sm tracking-wide px-8 py-4 transition-all duration-300 hover:shadow-[0_0_40px_rgba(229,164,17,0.15)]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Start with GitHub
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            {/* Integration pills */}
            <div className="mt-16 space-y-3">
              <span className="font-mono text-[9px] tracking-[0.25em] text-zinc-600 uppercase block mb-4">
                Integrations
              </span>
              <div className="flex flex-wrap gap-3">
                {integrations.map((tool) => (
                  <div
                    key={tool.name}
                    className="group flex items-center gap-3 bg-surface/80 border border-surface-border/50 px-4 py-3 hover:border-accent/20 transition-colors duration-300"
                  >
                    <span className="text-zinc-600 group-hover:text-accent transition-colors duration-300">
                      {tool.icon}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-zinc-300">{tool.name}</div>
                      <div className="text-[10px] text-zinc-600">{tool.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — Receipt */}
          <div className="flex justify-center lg:justify-end relative">
            {/* Glow behind receipt */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[300px] h-[500px] bg-accent/[0.04] blur-[80px] rounded-full" />
            </div>

            <div className="relative animate-float receipt-glow">
              <Receipt data={mockReceipt} />
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────── */}
      <footer className="relative z-10 border-t border-surface-border/30 py-8 px-8 lg:px-12">
        <div className="max-w-7xl mx-auto font-mono text-[10px] text-zinc-600 tracking-wider">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="uppercase">
              &copy; 2026 Apoorv Darshan. All rights reserved.
            </span>
            <span className="italic text-zinc-700">
              Proof of work, formatted as a receipt.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href="/privacy" className="hover:text-zinc-400 transition-colors uppercase">Privacy</a>
            <span className="text-zinc-800">|</span>
            <a href="/tos" className="hover:text-zinc-400 transition-colors uppercase">Terms</a>
            <span className="text-zinc-800">|</span>
            <a href="mailto:ad13dtu@gmail.com" className="hover:text-zinc-400 transition-colors">ad13dtu@gmail.com</a>
            <span className="text-zinc-800">|</span>
            <a href="https://x.com/apoorvdarshan" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">X @apoorvdarshan</a>
            <span className="text-zinc-800">|</span>
            <a href="https://github.com/apoorvdarshan/daxerly" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">GitHub</a>
            <span className="text-zinc-800">|</span>
            <a href="https://linkedin.com/in/apoorvdarshan" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
