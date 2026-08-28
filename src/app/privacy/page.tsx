import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — Seven Appreciation',
  description: 'How Seven Appreciation collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold text-zinc-900 mb-8 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: August 2026</p>

        <div className="prose prose-zinc prose-sm max-w-none space-y-6 text-zinc-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mt-8 mb-3">1. Information We Collect</h2>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account information:</strong> your email address, display name, and profile picture (if provided via Google OAuth).</li>
              <li><strong>Content you create:</strong> appreciation messages, fan stories, letters, comments, uploaded photos, and photocard collection progress.</li>
              <li><strong>Technical data:</strong> IP address (for rate limiting and abuse prevention), browser type, and timestamps of your activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mt-8 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and maintain the community platform.</li>
              <li>To authenticate your identity and manage your account.</li>
              <li>To display your public posts, appreciations, and comments to other community members.</li>
              <li>To enforce our community guidelines and prevent abuse (rate limiting, IP banning, content moderation).</li>
              <li>To improve the platform based on usage patterns.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mt-8 mb-3">3. Google OAuth</h2>
            <p>
              If you sign in with Google, we receive your name, email address, and profile picture from Google.
              We do not access your Google contacts, Gmail, or any other Google services.
              Your Google credentials (passwords, tokens) are never stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mt-8 mb-3">4. Data Storage &amp; Security</h2>
            <p>
              Your data is stored in a secure PostgreSQL database. Passwords (for credential-based accounts) are
              hashed using bcrypt and are never stored in plain text. All connections use TLS encryption.
              We implement security headers including HSTS, CSP, and X-Frame-Options to protect against common web attacks.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mt-8 mb-3">5. Data Sharing</h2>
            <p>
              We do not sell, rent, or share your personal information with third parties for marketing purposes.
              Your data may be shared only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>With your consent.</li>
              <li>To comply with legal obligations or law enforcement requests.</li>
              <li>To protect the safety and security of our users and platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mt-8 mb-3">6. Cookies &amp; Local Storage</h2>
            <p>
              We use essential cookies for authentication (session management via NextAuth.js).
              We use browser localStorage to store your theme preference and guest photocard collection progress.
              We do not use advertising or analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mt-8 mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Withdraw consent for data processing at any time.</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, please contact us through the platform or via email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mt-8 mb-3">8. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. If you delete your account,
              your personal data will be removed. Public posts and comments may be anonymized rather than deleted
              to preserve community discussion context.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mt-8 mb-3">9. Children&apos;s Privacy</h2>
            <p>
              This platform is not intended for children under 13. We do not knowingly collect
              personal information from children under 13. If we learn that we have collected data
              from a child under 13, we will delete that information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-900 mt-8 mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated revision date. Continued use of the platform after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section className="border-t border-zinc-200 pt-6 mt-8">
            <p className="text-zinc-500 text-xs">
              If you have questions about this Privacy Policy, please reach out through our{' '}
              <Link href="/guidelines" className="text-rose-600 hover:underline">Community Guidelines</Link> page.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
