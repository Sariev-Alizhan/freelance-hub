import type { Metadata } from 'next'
import Link from 'next/link'
import { Code2, Zap, Users, Shield, Star, ArrowRight, MessageSquare } from 'lucide-react'

export const metadata: Metadata = {
  title: 'RP Game Development — Hire PAWN, Lua & FiveM Developers | FreelanceHub',
  description: 'Find expert RP game server developers: PAWN scripting for SA:MP/CRMP, Lua & C# for FiveM, Unity C# for mobile RP (GrandMobile, BlackRussia). AI-assisted development tools included.',
  keywords: ['PAWN developer', 'FiveM scripter', 'SA:MP developer', 'RP server developer', 'GrandMobile', 'BlackRussia', 'Arizona RP', 'hire RP developer'],
  openGraph: {
    title: 'RP Game Dev Hub — FreelanceHub',
    description: 'Hire PAWN, Lua, FiveM, Unity developers for your RP server. AI co-pilot included.',
    type: 'website',
  },
}

const STACKS = [
  {
    name: 'SA:MP / CRMP',
    desc: 'Classic RP servers on San Andreas Multiplayer. PAWN scripting, MySQL, PHP admin panels.',
    lang: 'PAWN',
    color: '#ef4444',
    tags: ['PAWN', 'MySQL', 'PHP', 'SA:MP includes', 'Streamer Plugin'],
    demand: 'Very High',
    example: 'Arizona RP, MTA, Advance RP',
  },
  {
    name: 'FiveM (GTA5)',
    desc: 'Modern GTA5 multiplayer framework with 3M+ concurrent players. Lua + C# + JavaScript.',
    lang: 'Lua / C#',
    color: '#7170ff',
    tags: ['Lua', 'C#', 'JavaScript', 'ESX', 'QBCore', 'oxmysql'],
    demand: 'Critical',
    example: 'ESX servers, QBCore, custom frameworks',
  },
  {
    name: 'RageMP (GTA5)',
    desc: 'TypeScript/JavaScript based GTA5 multiplayer. Modern async architecture.',
    lang: 'TypeScript',
    color: '#f59e0b',
    tags: ['TypeScript', 'JavaScript', 'C#', 'MySQL', 'PostgreSQL'],
    demand: 'High',
    example: 'GTA World, Project Godfather',
  },
  {
    name: 'Mobile RP (Unity)',
    desc: 'Mobile RP games built on Unity. C# client + PHP/Node.js backend + MySQL.',
    lang: 'C# / Unity',
    color: '#22c55e',
    tags: ['Unity', 'C#', 'PHP', 'Node.js', 'MySQL', 'REST API'],
    demand: 'Very High',
    example: 'GrandMobile, BlackRussia, MTA Mobile',
  },
  {
    name: 'MTA:SA',
    desc: 'Multi Theft Auto: San Andreas. Lua scripting with full OOP support.',
    lang: 'Lua',
    color: '#06b6d4',
    tags: ['Lua', 'MySQL', 'JavaScript'],
    demand: 'Medium',
    example: 'Race, roleplay, freeroam servers',
  },
]

const ROLES = [
  { role: 'PAWN Scripter',      desc: 'SA:MP/CRMP systems: factions, economy, properties, jobs, admin systems',  price: '5,000–50,000₸',   icon: '⌨️' },
  { role: 'FiveM Developer',    desc: 'ESX/QBCore resources, custom frameworks, full server setup',                 price: '15,000–150,000₸', icon: '🎮' },
  { role: 'Unity C# Developer', desc: 'Mobile RP game client features, UI, networking, gameplay mechanics',         price: '20,000–200,000₸', icon: '📱' },
  { role: 'Server Admin',       desc: 'VPS setup, MySQL optimization, server monitoring, security patches',         price: '3,000–30,000₸',   icon: '🖥️' },
  { role: 'Web Panel Dev',      desc: 'Admin panels, player stats websites, voting/donation systems (Laravel/PHP)', price: '8,000–80,000₸',   icon: '🌐' },
  { role: 'Game Designer',      desc: 'RP economy balancing, faction systems design, map design with 0.3DL/MTA',   price: '5,000–40,000₸',   icon: '🗺️' },
  { role: 'Community Manager',  desc: 'Discord/Telegram moderation, event organization, server announcements',      price: '2,000–20,000₸',   icon: '👥' },
  { role: '3D / Skin Artist',   desc: 'Custom skins, vehicles, map objects for SA:MP/FiveM/MTA',                   price: '3,000–30,000₸',   icon: '🎨' },
]

const AI_FEATURES = [
  { title: 'PAWN Code Assistant', desc: 'Generates SA:MP/CRMP code from description. Knows all SA:MP natives, streamer plugin API, MySQL connector functions.', tag: 'SA:MP · CRMP' },
  { title: 'Lua / FiveM AI',      desc: 'Writes FiveM resources from scratch. Understands ESX, QBCore, ox_lib. Generates server.lua + client.lua + fxmanifest.lua.', tag: 'FiveM · RageMP' },
  { title: 'Bug Detector',        desc: 'Paste your .pwn or .lua file → AI finds memory leaks, infinite loops, SQL injection risks, performance bottlenecks.', tag: 'All platforms' },
  { title: 'Script Documentation',desc: 'AI reads your codebase → generates full documentation in RU/EN. Essential before hiring a new developer.', tag: 'PAWN · Lua · C#' },
  { title: 'Economy Balancer',    desc: 'Describe your RP economy → AI calculates optimal salary/price ratios, spawn item costs, business profitability.', tag: 'Game Design' },
  { title: 'MySQL Optimizer',     desc: 'Analyzes your RP server database schema → suggests indexes, fixes N+1 queries, improves query performance.', tag: 'All platforms' },
]

export default function RPDevPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#05050f', color: '#e0e0ff', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── HERO ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0a1e 0%, #0f0520 50%, #050510 100%)',
        borderBottom: '1px solid #1e1e3a',
        padding: 'clamp(48px, 8vw, 96px) 24px clamp(40px, 6vw, 72px)',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(#7170ff 1px, transparent 1px), linear-gradient(90deg, #7170ff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Glow */}
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, #7170ff18 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#ef444418', color: '#ef4444', fontWeight: 700, letterSpacing: '0.06em' }}>
              🎮 RP GAME DEV HUB
            </span>
            <span style={{ fontSize: 11, color: '#4b4b7a' }}>· AI-Powered</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800,
            letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #a0a0ff 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Hire RP Developers.<br />Ship Faster with AI.
          </h1>

          <p style={{ fontSize: 'clamp(14px, 2vw, 17px)', color: '#8b8bbb', lineHeight: 1.7, maxWidth: 580, margin: '0 0 32px' }}>
            The only freelance platform specialized in RP game servers.
            PAWN for SA:MP · Lua for FiveM · C# for RageMP · Unity for Mobile RP.
            AI co-pilot trained on every RP framework included.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              href="/freelancers?category=rp-dev"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 10, background: '#7170ff',
                color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none',
              }}
            >
              Find RP Developer <ArrowRight size={16} />
            </Link>
            <Link
              href="/orders/new?category=rp-dev"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 10,
                background: 'transparent', border: '1px solid #1e1e3a',
                color: '#d4d4f0', fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}
            >
              Post RP Job
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, marginTop: 40, flexWrap: 'wrap' }}>
            {[
              { v: '5', u: 'Platforms', s: 'SA:MP · FiveM · RageMP · MTA · Unity' },
              { v: '8+', u: 'RP Roles', s: 'Scripter, admin, designer, artist...' },
              { v: 'AI', u: 'Co-pilot', s: 'PAWN, Lua, C# — trained on RP code' },
            ].map(s => (
              <div key={s.u}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#7170ff' }}>{s.v}</span>
                <span style={{ fontSize: 13, color: '#8b8bbb', marginLeft: 6 }}>{s.u}</span>
                <div style={{ fontSize: 11, color: '#4b4b7a', marginTop: 2 }}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px' }}>

        {/* ── PLATFORM STACKS ── */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 6 }}>
            Every RP Platform Covered
          </h2>
          <p style={{ fontSize: 14, color: '#6b6b9b', marginBottom: 28 }}>
            From classic SA:MP servers to modern FiveM and mobile RP games — we have specialists for all.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {STACKS.map(s => (
              <div
                key={s.name}
                style={{
                  background: '#111118', border: `1px solid ${s.color}28`,
                  borderRadius: 14, padding: '20px 22px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>{s.name}</span>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 700,
                    background: `${s.color}18`, color: s.color,
                  }}>
                    {s.demand}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#6b6b9b', lineHeight: 1.6, margin: '0 0 12px' }}>{s.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {s.tags.map(t => (
                    <span key={t} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#1a1a2e', color: '#8b8bbb', fontWeight: 500 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: '#4b4b7a', margin: '10px 0 0' }}>Examples: {s.example}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ROLES ── */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 6 }}>
            Find the Right Specialist
          </h2>
          <p style={{ fontSize: 14, color: '#6b6b9b', marginBottom: 28 }}>
            All RP development roles in one place. All rates in ₸ (KZT).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {ROLES.map(r => (
              <Link
                key={r.role}
                href={`/freelancers?q=${encodeURIComponent(r.role)}`}
                style={{
                  display: 'flex', gap: 12, padding: '16px 18px',
                  background: '#111118', border: '1px solid #1e1e3a',
                  borderRadius: 12, textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{r.icon}</span>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#e0e0ff' }}>{r.role}</p>
                  <p style={{ margin: '0 0 6px', fontSize: 11, color: '#6b6b9b', lineHeight: 1.5 }}>{r.desc}</p>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#7170ff' }}>{r.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── AI CO-PILOT ── */}
        <section style={{ marginBottom: 72 }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1030 0%, #0f1525 100%)',
            border: '1px solid #2e2060', borderRadius: 20, padding: 'clamp(24px, 4vw, 44px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Zap size={18} style={{ color: '#7170ff' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7170ff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                AI Co-Pilot — RP Dev Pro
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 700, color: '#f0f0ff', letterSpacing: '-0.03em', margin: '0 0 10px' }}>
              AI trained on RP game development
            </h2>
            <p style={{ fontSize: 14, color: '#8b8bbb', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 600 }}>
              Describe what you need in Russian or English → AI generates working PAWN/Lua/C# code.
              Finds bugs. Explains functions. Optimizes SQL queries. Available 24/7.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12, marginBottom: 32 }}>
              {AI_FEATURES.map(f => (
                <div key={f.title} style={{ background: '#ffffff08', borderRadius: 12, padding: '16px 18px', border: '1px solid #ffffff10' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e0e0ff' }}>{f.title}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#7170ff20', color: '#9090ff' }}>{f.tag}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#6b6b9b', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link
                href="/premium?module=rp-dev"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 10, background: '#7170ff',
                  color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none',
                }}
              >
                Get RP Dev Pro — $29/mo <ArrowRight size={14} />
              </Link>
              <span style={{ fontSize: 13, color: '#6b6b9b', display: 'flex', alignItems: 'center' }}>
                7-day free trial · Cancel anytime
              </span>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 32 }}>
            How it works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { step: '01', icon: <MessageSquare size={20} />, title: 'Describe your task', desc: 'Post a job: "Need SA:MP faction system, PAWN, MySQL. Budget 30,000₸"', color: '#7170ff' },
              { step: '02', icon: <Users size={20} />, title: 'Get responses', desc: 'Verified RP developers respond within 2 hours. Compare portfolios and rates.', color: '#06b6d4' },
              { step: '03', icon: <Code2 size={20} />, title: 'Work with AI', desc: 'Use AI co-pilot alongside your developer. Speed up development 3×.', color: '#22c55e' },
              { step: '04', icon: <Shield size={20} />, title: 'Pay safely', desc: 'Escrow holds payment. Released only when you approve the work.', color: '#f59e0b' },
              { step: '05', icon: <Star size={20} />, title: 'Review & repeat', desc: 'Rate your developer. Build your trusted RP dev team over time.', color: '#e879f9' },
            ].map(s => (
              <div key={s.step} style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: `${s.color}14`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 14px', color: s.color,
                }}>
                  {s.icon}
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: '0.06em' }}>{s.step}</p>
                <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#e0e0ff' }}>{s.title}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#6b6b9b', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{
          textAlign: 'center', padding: 'clamp(32px, 5vw, 56px) 24px',
          background: '#111118', border: '1px solid #1e1e3a', borderRadius: 20,
        }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 800, color: '#f0f0ff', letterSpacing: '-0.04em', margin: '0 0 12px' }}>
            Your RP server deserves the best developer
          </h2>
          <p style={{ fontSize: 14, color: '#6b6b9b', margin: '0 0 28px' }}>
            Join 50,000+ RP developers and server owners who use FreelanceHub
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/auth/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 10, background: '#7170ff',
                color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none',
              }}
            >
              Join Free <ArrowRight size={15} />
            </Link>
            <Link
              href="/freelancers?category=rp-dev"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 10,
                background: 'transparent', border: '1px solid #1e1e3a',
                color: '#d4d4f0', fontSize: 15, fontWeight: 600, textDecoration: 'none',
              }}
            >
              Browse Developers
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
