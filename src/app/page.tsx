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
              Connect your GitHub account. We pull your last 24 hours of activity
              and print it as a thermal receipt — with an estimated dollar value
              for everything you shipped.
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

            {/* Product Hunt */}
            <div className="mt-6">
              <a
                href="https://www.producthunt.com/products/daxerly"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 border border-[#DA552F]/30 hover:border-[#DA552F]/60 bg-[#DA552F]/[0.06] hover:bg-[#DA552F]/10 px-4 py-2.5 transition-all duration-300"
              >
                <svg className="w-3.5 h-3.5 text-[#DA552F]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 4l8 14H4z" />
                </svg>
                <span className="font-mono text-[10px] tracking-wider text-zinc-400 group-hover:text-zinc-200 uppercase transition-colors">
                  Vote on Product&nbsp;Hunt
                </span>
              </a>
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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
            <span className="text-zinc-500 uppercase">Support</span>
            <span className="text-zinc-800">·</span>
            <a href="https://ko-fi.com/apoorvdarshan" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors uppercase">Ko-fi</a>
            <span className="text-zinc-800">|</span>
            <a href="https://paypal.me/apoorvdarshan" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors uppercase">PayPal</a>
            <span className="text-zinc-800">|</span>
            <a href="https://www.producthunt.com/products/daxerly" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors uppercase">Product Hunt</a>
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
