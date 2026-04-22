import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — FreelanceHub',
  description: 'How FreelanceHub collects, uses, and protects your personal data.',
}

const SECTIONS = [
  {
    title: '1. Who We Are',
    body: `FreelanceHub ("we", "us", "our") is a freelance marketplace for the CIS region, operated by SITS (Sariyev IT Solutions). We are committed to protecting your personal information and your right to privacy.`,
  },
  {
    title: '2. Information We Collect',
    body: `We collect information you provide directly: name, email address, profile photo, bio, skills, portfolio links, and payment details when you register or update your profile. We also collect usage data automatically: pages visited, search queries entered, orders viewed, and AI features used. This is collected via server-side request logs and first-party analytics only — no third-party trackers.`,
  },
  {
    title: '3. How We Use Your Information',
    body: `We use collected data to: (a) operate and improve the Platform; (b) match freelancers with relevant orders; (c) power AI features such as smart search, resume builder, and job matching scores; (d) send transactional notifications (new messages, order updates, application status); (e) detect and prevent fraud or abuse; (f) respond to support requests.`,
  },
  {
    title: '4. AI Features and Your Data',
    body: `AI-powered features (smart search, resume builder, contract drafting, job match scoring) process your profile data and search queries to generate personalized recommendations. Queries sent to AI models are processed via the Vercel AI Gateway, which does not retain prompt data beyond the request lifecycle. We do not use your personal data to train AI models without explicit opt-in consent.`,
  },
  {
    title: '5. Data Sharing',
    body: `We do not sell your personal data. We share data only: (a) with other users as necessary for platform functionality (e.g., your public profile is visible to clients); (b) with service providers (Supabase for database and auth, Vercel for hosting) under data processing agreements; (c) when required by law or to protect the rights and safety of users.`,
  },
  {
    title: '6. Public Profile Information',
    body: `When you create a freelancer profile, information you add — name, avatar, title, skills, portfolio, rating, and reviews — is publicly visible at your profile URL (/u/username). Clients' names and order titles are visible to freelancers who respond. Be mindful of what you include in public-facing fields.`,
  },
  {
    title: '7. Cookies and Local Storage',
    body: `We use session cookies for authentication (managed by Supabase Auth, HTTP-only and secure). We use localStorage for non-sensitive UI preferences such as language selection and AI search history. We do not use advertising cookies or third-party tracking pixels.`,
  },
  {
    title: '8. Data Retention',
    body: `We retain your account data for as long as your account is active. If you delete your account, your personal data is deleted within 30 days, except where retention is required by law (e.g., financial records). Messages and reviews may be anonymized rather than deleted to preserve platform history integrity.`,
  },
  {
    title: '9. Your Rights',
    body: `Depending on your jurisdiction, you may have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your data ("right to be forgotten"); object to or restrict certain processing; receive your data in a portable format. To exercise these rights, contact us via Telegram @zhanmate or WhatsApp +7 777 496 13 58.`,
  },
  {
    title: '10. Data Security',
    body: `We implement industry-standard security measures: HTTPS for all connections, row-level security (RLS) policies on all database tables, server-side session management, and input validation to prevent injection attacks. No system is 100% secure; in the event of a breach affecting your data, we will notify you within 72 hours.`,
  },
  {
    title: '11. Children\'s Privacy',
    body: `FreelanceHub is not intended for users under 16 years of age. We do not knowingly collect personal data from children. If you believe a child has registered on our platform, please contact us and we will delete the account promptly.`,
  },
  {
    title: '12. International Data Transfers',
    body: `FreelanceHub is hosted on Vercel infrastructure with servers primarily in Europe. If you use the Platform from outside the EU/EEA, your data may be transferred to and processed in these regions. By using the Platform, you consent to this transfer.`,
  },
  {
    title: '13. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes via in-app notification or email. Continued use of the Platform after changes takes effect constitutes acceptance of the updated policy.`,
  },
  {
    title: '14. Contact Us',
    body: `For privacy-related questions or requests, contact us: Telegram: @zhanmate · WhatsApp: +7 777 496 13 58 · Instagram: @sariyev.it.solutions`,
  },
]

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <div
          className="inline-flex items-center gap-2 mb-4 rounded-full px-3 py-1"
          style={{ background: 'rgba(39,166,68,0.08)', border: '1px solid rgba(39,166,68,0.2)' }}
        >
          <span style={{ fontSize: '11px', fontWeight: 590, color: '#27a644', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Legal</span>
        </div>
        <h1
          style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '12px' }}
        >
          Privacy Policy
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--fh-t4)', fontWeight: 400 }}>
          Last updated: April 15, 2026 · Your data, your rights
        </p>
      </div>

      {/* Intro callout */}
      <div
        className="mb-10 rounded-xl p-4"
        style={{ background: 'rgba(39,166,68,0.05)', border: '1px solid rgba(39,166,68,0.15)' }}
      >
        <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.7 }}>
          We take your privacy seriously. This policy explains what data we collect, how we use it,
          and your rights as a user of FreelanceHub. We do not sell your data and do not use
          third-party advertising trackers.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2
              style={{ fontSize: '15px', fontWeight: 650, color: 'var(--fh-t1)', marginBottom: '8px', letterSpacing: '-0.015em' }}
            >
              {s.title}
            </h2>
            <p
              style={{ fontSize: '14px', color: 'var(--fh-t3)', lineHeight: 1.75, fontWeight: 400 }}
            >
              {s.body}
            </p>
          </section>
        ))}
      </div>

      {/* Footer nav */}
      <div
        className="mt-14 pt-8 flex flex-wrap gap-4"
        style={{ borderTop: '1px solid var(--fh-sep)' }}
      >
        <Link
          href="/terms"
          className="hover:underline"
          style={{ fontSize: '13px', color: '#27a644', fontWeight: 510, textDecoration: 'none' }}
        >
          Terms of Service →
        </Link>
        <Link
          href="/"
          style={{ fontSize: '13px', color: 'var(--fh-t4)', fontWeight: 400, textDecoration: 'none' }}
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
