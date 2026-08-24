import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Daxerly",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-8 py-16 font-mono text-sm leading-relaxed">
        <Link
          href="/"
          className="text-[10px] tracking-[0.3em] text-zinc-600 uppercase hover:text-zinc-400 transition-colors"
        >
          &larr; Back to Daxerly
        </Link>

        <h1 className="text-2xl font-bold mt-8 mb-2 tracking-tight text-gray-100">
          Privacy Policy
        </h1>
        <p className="text-zinc-500 text-xs mb-12">
          Last updated: July 1, 2026
        </p>

        <section className="space-y-8 text-zinc-400">
          <div>
            <h2 className="text-gray-100 font-semibold mb-2">1. Introduction</h2>
            <p>
              Daxerly (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is operated by Apoorv Darshan. This Privacy
              Policy explains how we collect, use, and protect your information when you use
              our service at daxerly.apoorvdarshan.com.
            </p>
          </div>

          <div>
            <h2 className="text-gray-100 font-semibold mb-2">2. Information We Collect</h2>
            <p className="mb-2">We collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong className="text-zinc-300">Account information:</strong> name, email address,
                and profile details provided during sign-up via OAuth.
              </li>
              <li>
                <strong className="text-zinc-300">Integration data:</strong> when you connect third-party
                services (currently GitHub), we access activity data such as commits, pull
                requests, and issues to generate your daily work receipts.
              </li>
              <li>
                <strong className="text-zinc-300">Usage data:</strong> we collect basic usage analytics
                such as pages visited and features used to improve the service.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-gray-100 font-semibold mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>To generate daily work receipts summarizing your activity across connected tools.</li>
              <li>To authenticate your identity and manage your account.</li>
              <li>To improve and maintain the service.</li>
              <li>To communicate with you about your account or service changes.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-gray-100 font-semibold mb-2">4. Data Storage &amp; Security</h2>
            <p>
              Your data is stored in a secure database. We use industry-standard security measures
              including encryption in transit and at rest. OAuth tokens for third-party integrations
              are stored securely and used only to fetch your activity data.
            </p>
          </div>

          <div>
            <h2 className="text-gray-100 font-semibold mb-2">5. Third-Party Services</h2>
            <p>
              We integrate with the following third-party service: GitHub. It has its own
              privacy policy. We only access the data necessary to provide our service and do
              not sell your data to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-gray-100 font-semibold mb-2">6. Data Retention</h2>
            <p>
              We retain your account data and generated receipts for as long as your account is
              active. You may request deletion of your account and all associated data at any time
              by contacting us.
            </p>
          </div>

          <div>
            <h2 className="text-gray-100 font-semibold mb-2">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Disconnect any third-party integration at any time.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-gray-100 font-semibold mb-2">8. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use
              third-party tracking cookies.
            </p>
          </div>

          <div>
            <h2 className="text-gray-100 font-semibold mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              significant changes by posting the new policy on this page with an updated date.
            </p>
          </div>

          <div>
            <h2 className="text-gray-100 font-semibold mb-2">10. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, contact us at{" "}
              <a
                href="mailto:ad13dtu@gmail.com"
                className="text-zinc-300 underline hover:text-white transition-colors"
              >
                ad13dtu@gmail.com
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
