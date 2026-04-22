import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConnectWallet from '@/components/identity/ConnectWallet'
import { getServerT } from '@/lib/i18n/server'

export const metadata = { title: 'Identity · FreelanceHub' }

interface VerificationRow {
  id: string
  credential_type: string
  issuer_did: string
  issued_at: string
  expires_at: string | null
  claim: Record<string, unknown>
}

export default async function IdentityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/settings/identity')

  const t = await getServerT()
  const td = t.settingsPage

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: profile } = await db
    .from('profiles')
    .select('id, username, did, origin_instance')
    .eq('id', user.id)
    .maybeSingle()

  const { data: vcs } = await db
    .from('verifications')
    .select('id, credential_type, issuer_did, issued_at, expires_at, claim')
    .eq('subject_id', user.id)
    .eq('revoked', false)
    .order('issued_at', { ascending: false })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{
          fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em',
          color: 'var(--fh-t1)', marginBottom: 4,
        }}>
          {td.identityTitle}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--fh-t3)', lineHeight: 1.5 }}>
          {td.identitySubtitle}
        </p>
      </div>

      <ConnectWallet currentDid={profile?.did ?? null} />

      <div>
        <div style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t2)', marginBottom: 8 }}>
          {td.credentialsHeading}
        </div>
        {vcs && vcs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(vcs as VerificationRow[]).map(vc => (
              <VcCard key={vc.id} vc={vc} credentialSuffix={td.credentialSuffix} issuedBy={td.issuedBy} />
            ))}
          </div>
        ) : (
          <div style={{
            padding: 16, borderRadius: 12,
            border: '1px dashed var(--fh-border)',
            fontSize: 13, color: 'var(--fh-t4)', textAlign: 'center',
          }}>
            {td.noCredentials}
          </div>
        )}
      </div>
    </div>
  )
}

function VcCard({ vc, credentialSuffix, issuedBy }: { vc: VerificationRow; credentialSuffix: string; issuedBy: string }) {
  const color =
    vc.credential_type === 'identity' ? '#27a644' :
    vc.credential_type === 'skill'    ? '#34d399' :
    vc.credential_type === 'company'  ? '#fb923c' :
    '#8a8f98'

  return (
    <div style={{
      padding: '12px 14px', borderRadius: 12,
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}1a`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>
        {vc.credential_type.slice(0, 3)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 590, color: 'var(--fh-t1)', textTransform: 'capitalize' }}>
          {vc.credential_type} {credentialSuffix}
        </div>
        <div style={{ fontSize: 11, color: 'var(--fh-t4)', marginTop: 1, wordBreak: 'break-all' }}>
          {issuedBy} <span style={{ fontFamily: 'monospace' }}>{vc.issuer_did}</span>
          {' · '}
          {new Date(vc.issued_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
