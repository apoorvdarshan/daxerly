"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Receipt from "@/components/Receipt";
import { mockReceipt } from "@/lib/mock-data";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-accent font-bold text-2xl tracking-wider font-mono">
            DAXERLY
          </span>
        </div>
        <button
          onClick={() => signIn("github")}
          className="bg-accent hover:bg-accent-light text-black font-bold px-6 py-2 rounded-lg text-sm transition-colors"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-8 pt-16 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Copy */}
          <div className="pt-8">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Your daily work,
              <br />
              <span className="text-accent">receipted.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-400 max-w-lg leading-relaxed">
              Connect your tools. Pull your activity. Get a beautiful thermal
              receipt showing what you shipped and what it&apos;s worth.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => signIn("github")}
                className="bg-accent hover:bg-accent-light text-black font-bold px-8 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Connect GitHub to Start
              </button>
            </div>

            <div className="mt-12 flex items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                GitHub
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Slack
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Google Calendar
              </div>
            </div>
          </div>

          {/* Right: Receipt Preview */}
          <div className="flex justify-center pt-4">
            <div className="transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <Receipt data={mockReceipt} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-light py-8 px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-sm text-gray-600">
          <span className="font-mono">DAXERLY</span>
          <span>Proof of work, formatted as a receipt.</span>
        </div>
      </footer>
    </div>
  );
}
