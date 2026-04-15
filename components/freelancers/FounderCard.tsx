// FounderCard — shows the founder's extended profile (career, skills, langs, projects)
// Displayed on the freelancer profile page when userId matches FOUNDER_USER_ID env var

const TIMELINE = [
  { year: '2026', icon: '🌐', label: 'FreelanceHub',          desc: 'Launched a global decentralised freelance platform. 0% commission, AI-powered — built entirely solo from scratch.' },
  { year: '2025', icon: '🎮', label: 'GrandGames — Deputy Director', desc: 'Deputy Director at GrandGames (Almaty). Game development strategy and company growth.' },
  { year: '2024', icon: '🕹', label: 'RedPadGames — Dustland', desc: 'Frontend Game Developer at RedPadGames (Almaty). Built gameplay UI for Dustland using Unreal Engine 5.' },
  { year: '2023', icon: '🤖', label: 'SITS & AI Journey',     desc: 'Founded Sariyev IT Solutions. Deep dive into Claude AI, GPT, Telegram bots, automation and prompt engineering.' },
]

const SKILLS = ['Next.js 16', 'TypeScript', 'React 19', 'Supabase', 'Claude AI', 'Python', 'Telegram Bots', 'C++', 'Unreal Engine 5', 'PostgreSQL']

const LANGUAGES = [
  { flag: '🇰🇿', lang: 'Kazakh',     level: 'Native' },
  { flag: '🇷🇺', lang: 'Russian',    level: 'Native' },
  { flag: '🇬🇧', lang: 'English',    level: 'Fluent'  },
  { flag: '🇹🇷', lang: 'Turkish',    level: 'Advanced'},
  { flag: '🇰🇷', lang: 'Korean',     level: 'Learning'},
  { flag: '🤖', lang: 'AI/Prompting',level: 'Expert'  },
]

const PROJECTS = [
  { name: 'FreelanceHub',  url: 'https://www.freelance-hub.kz',                              desc: 'Global freelance platform',             emoji: '🌐' },
  { name: 'Tengri Yurt',   url: 'https://tengri-yurt.kz',                                    desc: 'Central Asian culture & business hub',   emoji: '🏕' },
  { name: 'SITS',          url: 'https://www.instagram.com/sariyev.it.solutions/?hl=ru',      desc: 'IT company — Almaty',                   emoji: '🏢' },
  { name: 'FreelanceHubBot', url: 'https://t.me/FreelanceHubKZBot',                         desc: 'Telegram notifications bot',             emoji: '🤖' },
]

export default function FounderCard() {
  return (
    <div
      style={{
        borderRadius: 20, overflow: 'hidden',
        border: '1px solid rgba(113,112,255,0.25)',
        background: 'linear-gradient(135deg, rgba(113,112,255,0.04) 0%, rgba(56,189,248,0.03) 100%)',
      }}
    >
      {/* Header banner */}
      <div style={{
        padding: '18px 24px',
        background: 'linear-gradient(135deg, rgba(113,112,255,0.12) 0%, rgba(39,166,68,0.07) 100%)',
        borderBottom: '1px solid rgba(113,112,255,0.15)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #7170ff, #27a644)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          🚀
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#7170ff', letterSpacing: '-0.01em', margin: 0 }}>
            Founder of FreelanceHub
          </p>
          <p style={{ fontSize: 12, color: 'var(--fh-t4)', margin: 0 }}>
            Built this platform · SITS Sariyev IT Solutions · Almaty, Kazakhstan
          </p>
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Bio */}
        <p style={{ fontSize: 14, color: 'var(--fh-t2)', lineHeight: 1.7, margin: 0 }}>
          Developer, entrepreneur, and AI enthusiast from Almaty. Building tools that give everyone equal access to digital opportunity — regardless of geography, language, or currency. Graduated from Kazakh-Turkish High School, Issyk.
        </p>

        {/* Career timeline */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16, margin: '0 0 16px' }}>
            Career
          </p>
          <div style={{ position: 'relative', paddingLeft: 18 }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 5, top: 10, bottom: 10, width: 1, background: 'rgba(113,112,255,0.2)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {TIMELINE.map((entry, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  {/* Dot */}
                  <div style={{
                    position: 'absolute', left: -14, top: 6, width: 8, height: 8, borderRadius: '50%',
                    background: i === 0 ? '#7170ff' : 'var(--fh-surface-2)',
                    border: `2px solid ${i === 0 ? '#7170ff' : 'rgba(113,112,255,0.3)'}`,
                  }} />
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{entry.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 650, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }}>
                          {entry.label}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: i === 0 ? '#7170ff' : 'var(--fh-t4)',
                          padding: '1px 7px', borderRadius: 4,
                          background: i === 0 ? 'rgba(113,112,255,0.12)' : 'var(--fh-surface-2)',
                        }}>
                          {entry.year}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--fh-t4)', lineHeight: 1.6, margin: '4px 0 0' }}>
                        {entry.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, margin: '0 0 10px' }}>
            Tech Stack
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {SKILLS.map(s => (
              <span key={s} style={{
                padding: '4px 10px', borderRadius: 7, fontSize: 12, fontWeight: 510,
                background: 'rgba(113,112,255,0.08)', color: '#7170ff',
                border: '1px solid rgba(113,112,255,0.2)',
              }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, margin: '0 0 10px' }}>
            Languages
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
            {LANGUAGES.map(l => (
              <div key={l.lang} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 8,
                background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)',
              }}>
                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{l.flag}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 590, color: 'var(--fh-t1)', lineHeight: 1.2 }}>{l.lang}</p>
                  <p style={{ margin: 0, fontSize: 10, color: 'var(--fh-t4)' }}>{l.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, margin: '0 0 10px' }}>
            Projects
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8 }}>
            {PROJECTS.map(p => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px', borderRadius: 10, textDecoration: 'none',
                  background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)',
                  display: 'flex', flexDirection: 'column', gap: 4,
                  transition: 'border-color 0.15s',
                }}
              >
                <span style={{ fontSize: 20 }}>{p.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 650, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }}>{p.name}</span>
                <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{p.desc}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
