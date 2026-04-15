import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — FreelanceHub',
  description: 'Terms and conditions for using the FreelanceHub platform.',
}

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using FreelanceHub ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. These terms apply to all visitors, registered users, clients, and freelancers.`,
  },
  {
    title: '2. Description of Service',
    body: `FreelanceHub is an online marketplace that connects clients who need freelance services with independent professionals ("freelancers"). The Platform provides tools for posting orders, submitting proposals, communicating, and completing transactions. FreelanceHub itself is not a party to any agreement between clients and freelancers.`,
  },
  {
    title: '3. User Accounts',
    body: `You must create an account to use most features. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during registration and keep it up to date. Accounts are personal and may not be transferred to another person.`,
  },
  {
    title: '4. Freelancer Obligations',
    body: `Freelancers agree to: (a) deliver work that meets the specifications described in accepted orders; (b) communicate promptly with clients; (c) represent their skills and experience honestly; (d) not solicit clients to pay outside the Platform during active engagements; (e) comply with all applicable laws, including tax obligations in their jurisdiction.`,
  },
  {
    title: '5. Client Obligations',
    body: `Clients agree to: (a) provide clear, complete project briefs; (b) review and respond to submitted work in a timely manner; (c) pay agreed amounts upon satisfactory delivery; (d) not request work that violates laws or third-party rights; (e) not attempt to circumvent Platform fees by diverting freelancers to off-platform payment.`,
  },
  {
    title: '6. Payments and Fees',
    body: `The Platform is currently in early access and does not charge service fees. Payments between clients and freelancers are agreed upon directly. FreelanceHub recommends milestone-based payments: 30–50% upfront, the remainder upon delivery. The Platform is not responsible for payment disputes or non-payment between parties.`,
  },
  {
    title: '7. AI-Powered Features',
    body: `The Platform offers AI-assisted features including smart search, resume building, contract drafting, and agent matching. These features are provided "as-is" and are intended as decision-support tools only. AI-generated content should be reviewed by users before use. FreelanceHub does not guarantee the accuracy, legality, or fitness of AI-generated output.`,
  },
  {
    title: '8. Prohibited Conduct',
    body: `You may not: (a) post false, misleading, or fraudulent content; (b) harass, abuse, or threaten other users; (c) attempt to gain unauthorized access to any system or data; (d) use automated bots or scrapers without written permission; (e) post spam or unsolicited commercial messages; (f) impersonate any person or entity; (g) upload malicious code or content that violates any law.`,
  },
  {
    title: '9. Intellectual Property',
    body: `Work product delivered by a freelancer to a client becomes the property of the client upon full payment, unless otherwise agreed in writing between the parties. Freelancers retain ownership of their portfolios, profiles, and any tools or templates they created independently. FreelanceHub retains all rights to the Platform's design, brand, and technology.`,
  },
  {
    title: '10. Limitation of Liability',
    body: `To the maximum extent permitted by applicable law, FreelanceHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of the Platform. Our total liability for any claim shall not exceed the fees paid by you to FreelanceHub in the 12 months preceding the claim.`,
  },
  {
    title: '11. Dispute Resolution',
    body: `Disputes between clients and freelancers are the responsibility of the parties involved. FreelanceHub may, at its sole discretion, provide mediation assistance but is under no obligation to resolve disputes. Any disputes with FreelanceHub itself shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be subject to the laws of the Republic of Kazakhstan.`,
  },
  {
    title: '12. Termination',
    body: `FreelanceHub reserves the right to suspend or terminate any account at any time for violation of these Terms or for any other reason at our discretion. You may delete your account at any time from your dashboard. Termination does not affect obligations arising before the termination date.`,
  },
  {
    title: '13. Changes to Terms',
    body: `We may update these Terms from time to time. When we do, we will update the date at the bottom of this page and, for significant changes, notify registered users by email or in-app notification. Continued use of the Platform after changes constitutes acceptance of the new Terms.`,
  },
  {
    title: '14. Contact',
    body: `For questions about these Terms, contact us via Telegram at @zhanmate or through the community channels listed in the footer.`,
  },
]

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <div
          className="inline-flex items-center gap-2 mb-4 rounded-full px-3 py-1"
          style={{ background: 'rgba(94,106,210,0.08)', border: '1px solid rgba(94,106,210,0.2)' }}
        >
          <span style={{ fontSize: '11px', fontWeight: 590, color: '#7170ff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Legal</span>
        </div>
        <h1
          style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '12px' }}
        >
          Terms of Service
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--fh-t4)', fontWeight: 400 }}>
          Last updated: April 15, 2026 · Effective immediately for new users
        </p>
      </div>

      {/* Intro callout */}
      <div
        className="mb-10 rounded-xl p-4"
        style={{ background: 'rgba(94,106,210,0.05)', border: '1px solid rgba(94,106,210,0.15)' }}
      >
        <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.7 }}>
          These Terms govern your use of FreelanceHub — a freelance marketplace for the CIS region.
          Please read them carefully. By using our platform you agree to these terms.
          If you have questions, reach out via{' '}
          <a
            href="https://t.me/zhanmate"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#7170ff', textDecoration: 'none' }}
          >
            Telegram
          </a>.
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
          href="/privacy"
          className="hover:underline"
          style={{ fontSize: '13px', color: '#7170ff', fontWeight: 510, textDecoration: 'none' }}
        >
          Privacy Policy →
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
