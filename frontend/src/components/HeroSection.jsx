/**
 * HeroSection.jsx — aeo.thatworkx.com
 * Stack: React 18 + Tailwind CSS v3 + lucide-react
 *
 * Design System:
 *   Canvas:   bg-slate-50 / dark:bg-[#0D0E11]
 *   Card:     bg-white / dark:bg-[#16181D] | border-slate-200 / dark:border-white/10
 *   Input:    bg-slate-100 / dark:bg-[#1F222A]
 *   Primary:  text-slate-900 / dark:text-slate-50
 *   Muted:    text-slate-600 / dark:text-slate-400
 *   Rose:     #9F1239  (AI Visualize)
 *   Amber:    #B45309  (AIOptimize)
 *   Copper:   #9A3412  (AISocialize)
 *
 * NOTE: This file is the authoritative design source-of-truth.
 * To use in production, integrate a Vite + React build pipeline
 * (see /docs/react-build-setup.md). The live Express server currently
 * serves vanilla index.html — kept in sync with this spec.
 */

import { useState, useEffect, useRef } from 'react';
import {
  Eye, Stethoscope, Radio, Sun, Moon, Zap, ArrowRight,
  ExternalLink, Check, ChevronRight
} from 'lucide-react';

/* ─── Design Token Constants ─────────────────────────────────────── */
const ACCENTS = {
  visualize: {
    hex:     '#9F1239',
    bg:      'bg-[#9F1239]',
    bgMuted: 'bg-[#9F1239]/10',
    border:  'border-[#9F1239]/40',
    text:    'text-[#9F1239]',
    hover:   'hover:border-[#9F1239]/60 hover:bg-[#9F1239]/5',
    ring:    'focus-visible:ring-[#9F1239]/40',
    shadow:  '0 0 24px rgba(159,18,57,0.18)',
    label:   'AI Visualize',
    emoji:   '👁️',
    badge:   'Diagnostic Engine',
    demo:    '/demo/shopify?tier=enterprise&tool=visualize',
  },
  optimize: {
    hex:     '#B45309',
    bg:      'bg-[#B45309]',
    bgMuted: 'bg-[#B45309]/10',
    border:  'border-[#B45309]/40',
    text:    'text-[#B45309]',
    hover:   'hover:border-[#B45309]/60 hover:bg-[#B45309]/5',
    ring:    'focus-visible:ring-[#B45309]/40',
    shadow:  '0 0 24px rgba(180,83,9,0.18)',
    label:   'AIOptimize',
    emoji:   '🩺',
    badge:   'Prescriptive Fixer',
    demo:    '/demo/shopify?tier=enterprise&tool=optimize',
  },
  socialize: {
    hex:     '#9A3412',
    bg:      'bg-[#9A3412]',
    bgMuted: 'bg-[#9A3412]/10',
    border:  'border-[#9A3412]/40',
    text:    'text-[#9A3412]',
    hover:   'hover:border-[#9A3412]/60 hover:bg-[#9A3412]/5',
    ring:    'focus-visible:ring-[#9A3412]/40',
    shadow:  '0 0 24px rgba(154,52,18,0.18)',
    label:   'AISocialize',
    emoji:   '📣',
    badge:   'Social Citation Engine',
    demo:    '/demo/shopify?tier=enterprise&tool=socialize',
  },
};

const ENTERPRISE_DEMOS = [
  { domain: 'shopify.com',  href: '/demo/shopify?tier=enterprise' },
  { domain: 'stripe.com',   href: '/demo/stripe?tier=enterprise'  },
  { domain: 'airbnb.com',   href: '/demo/airbnb?tier=enterprise'  },
];

const CAPABILITY_CARDS = [
  {
    tool: 'visualize',
    icon: <Eye size={20} />,
    subtitle: "Let's show you what AI can see.",
    scopeLabel: 'Scope & Checks',
    items: [
      { text: 'Are you blocking out AI crawlers?', detail: 'Robots.txt & WAF check' },
      { text: 'Is your web presence optimized for AI?' },
      { text: 'Is your content AI-Ready?', detail: 'Readability & Token Load' },
      { text: 'Is your website AI-Ready?' },
    ],
    deliverables: [
      'Real-time diagnostic scorecard',
      'Raw bot markdown view',
      'WAF status report',
    ],
    cta: 'Select & Scan URL Above',
  },
  {
    tool: 'optimize',
    icon: <Stethoscope size={20} />,
    subtitle: 'If you know you are AI-ready, let\'s show you how to be Optimized for AI.',
    scopeLabel: 'Scope & Fixes',
    items: [
      { text: 'Optimizing for AI-Ready', detail: 'Code stripping & JSON-LD injection' },
      { text: 'Optimizing for AI-Optimized', detail: 'llms.txt & ai-context.md generation' },
    ],
    deliverables: [
      'One-click code remediation',
      'Cloudflare Worker edge scripts',
      'Downloadable .txt/.md manifests',
    ],
    cta: 'Launch Remediation Suite',
  },
  {
    tool: 'socialize',
    icon: <Radio size={20} />,
    subtitle: 'Go further, ensure your social footprint is Optimized for AI.',
    scopeLabel: 'Scope & Attribution',
    groups: [
      {
        label: 'Domain Social Readiness',
        items: [
          { text: 'llms.txt validation' },
          { text: 'Author Info & Credential mentions' },
          { text: 'Valid External & Authority link check' },
          { text: 'LastUpdated freshness index' },
        ],
      },
      {
        label: 'Elevate Social',
        items: [
          { text: 'Automated llms.txt snippet generator for social posts' },
        ],
      },
    ],
    deliverables: [
      'Chrome Extension integration',
      'Citation graph audit',
      'Social snippet append engine',
    ],
    cta: 'Install Chrome Extension ⚡',
  },
];

/* ─── Sub-components ─────────────────────────────────────────────── */

function PulsingBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                    border border-slate-200 dark:border-white/10
                    bg-white/60 dark:bg-white/5 backdrop-blur-sm
                    font-mono text-xs font-bold tracking-widest
                    text-slate-600 dark:text-slate-400 uppercase
                    shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      The AEO &amp; GEO Infrastructure Platform
    </div>
  );
}

function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="fixed top-4 right-4 z-50 p-2.5 rounded-full
                 bg-white dark:bg-[#16181D]
                 border border-slate-200 dark:border-white/10
                 text-slate-600 dark:text-slate-400
                 hover:text-slate-900 dark:hover:text-slate-50
                 shadow-md transition-all duration-200
                 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function NavBar({ dark, onToggle }) {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
      <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-50 tracking-tight">
        aeo.thatworkx.com
      </span>
      <ThemeToggle dark={dark} onToggle={onToggle} />
    </nav>
  );
}

function SegmentedSwitcher({ active, onChange }) {
  const tabs = ['visualize', 'optimize', 'socialize'];

  return (
    <div className="grid grid-cols-3 rounded-xl p-1 gap-1
                    bg-slate-100 dark:bg-[#1F222A]
                    border border-slate-200 dark:border-white/8 w-full max-w-lg">
      {tabs.map(tab => {
        const a = ACCENTS[tab];
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            aria-pressed={isActive}
            style={isActive ? {
              borderColor: `${a.hex}88`,
              backgroundColor: `${a.hex}0f`,
              boxShadow: `0 0 16px ${a.hex}22`,
            } : {}}
            className={`
              flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold
              transition-all duration-200 border uppercase tracking-wider
              ${isActive
                ? `${a.text} border-current`
                : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
              }
              focus-visible:outline-none focus-visible:ring-2 ${a.ring}
            `}
          >
            <span>{a.emoji}</span>
            <span>{a.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ConsoleDetails({ activeTool }) {
  const card = CAPABILITY_CARDS.find(c => c.tool === activeTool);
  const acc = ACCENTS[activeTool];
  if (!card) return null;

  return (
    <div className="my-5 p-4 rounded-xl border border-slate-100 dark:border-white/5
                    bg-slate-50/50 dark:bg-[#1C1E26]/40 transition-all duration-300">
      <div className="flex items-center gap-2 mb-2">
        <span
          style={{ backgroundColor: `${acc.hex}18`, color: acc.hex, borderColor: `${acc.hex}44` }}
          className="px-2.5 py-0.5 rounded-full border font-mono text-[0.62rem] font-bold uppercase tracking-widest"
        >
          {acc.badge}
        </span>
        <h4 style={{ color: acc.hex }} className="text-sm font-extrabold">
          {acc.emoji} {acc.label}
        </h4>
      </div>
      
      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-3 leading-relaxed">
        {card.subtitle}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scope list */}
        <div>
          <p className="font-mono text-[0.62rem] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
            {card.scopeLabel}
          </p>
          
          {card.items && (
            <ul className="flex flex-col gap-1">
              {card.items.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300 leading-snug">
                  <Check size={10} style={{ color: acc.hex }} className="mt-0.5 flex-shrink-0" />
                  <span>
                    {item.text}
                    {item.detail && <span className="text-slate-500 text-[0.7rem]"> ({item.detail})</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {card.groups && (
            <div className="flex flex-col gap-2">
              {card.groups.map((group, gi) => (
                <div key={gi}>
                  <p className="font-mono text-[0.58rem] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-0.5">
                    {group.label}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {group.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300 leading-snug">
                        <Check size={10} style={{ color: acc.hex }} className="mt-0.5 flex-shrink-0" />
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deliverables list */}
        <div>
          <p className="font-mono text-[0.62rem] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
            Deliverables
          </p>
          <ul className="flex flex-col gap-1">
            {card.deliverables.map((d, i) => (
              <li key={i} className="flex items-center gap-1.5 text-[0.7rem] text-slate-500 dark:text-slate-400">
                <span style={{ color: acc.hex }} className="text-[0.6rem]">▸</span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ScanForm({ activeTool, urlRef, onSubmit }) {
  const acc = ACCENTS[activeTool];
  const placeholders = {
    visualize: 'https://yourbrand.com — Initiate AI Visibility Scan',
    optimize:  'https://yourbrand.com — Run Prescriptive Remediation',
    socialize: 'https://yourbrand.com — Check Social Citation Index',
  };

  return (
    <form
      onSubmit={onSubmit}
      action="/scan"
      method="GET"
      className="w-full flex gap-2"
    >
      <input type="hidden" name="tool" value={activeTool} />
      <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl
                      bg-slate-100 dark:bg-[#1F222A]
                      border border-slate-200 dark:border-white/10
                      focus-within:border-current transition-colors"
           style={{ '--tw-border-opacity': 1 }}>
        <span className="text-slate-400 text-base">🔗</span>
        <input
          ref={urlRef}
          type="url"
          name="url"
          placeholder={placeholders[activeTool]}
          required
          className="flex-1 bg-transparent text-sm font-medium
                     text-slate-900 dark:text-slate-50
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     outline-none"
        />
      </div>
      <button
        type="submit"
        style={{ backgroundColor: acc.hex, boxShadow: acc.shadow }}
        className="flex items-center gap-2 px-5 py-3 rounded-xl
                   text-white text-sm font-bold
                   transition-all duration-200 hover:opacity-90 active:scale-95
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      >
        <Zap size={15} />
        Initiate Scan
      </button>
    </form>
  );
}

function EnterpriseDemoChips() {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
      <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 flex-shrink-0">
        ⚡ Instant Enterprise Demo:
      </span>
      {ENTERPRISE_DEMOS.map(({ domain, href }) => (
        <a
          key={domain}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full
                     font-mono text-xs font-bold
                     text-[#9F1239] bg-[#9F1239]/10 border border-[#9F1239]/28
                     hover:bg-[#9F1239]/18 hover:border-[#9F1239]/50
                     transition-all duration-150 active:scale-95
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9F1239]/40"
        >
          {domain}
          <ExternalLink size={10} />
        </a>
      ))}
    </div>
  );
}

function CapabilityCard({ card, activeTool, onSelect }) {
  const acc = ACCENTS[card.tool];
  const isActive = activeTool === card.tool;

  return (
    <div
      onClick={() => onSelect(card.tool)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(card.tool)}
      style={isActive ? { borderColor: `${acc.hex}88`, boxShadow: acc.shadow } : {}}
      className={`
        relative flex flex-col p-5 rounded-2xl cursor-pointer
        bg-white dark:bg-[#16181D]
        border border-slate-200 dark:border-white/10
        transition-all duration-250
        hover:border-current hover:-translate-y-1
        focus-visible:outline-none focus-visible:ring-2 ${acc.ring}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-1.5">
          <span
            style={{ backgroundColor: `${acc.hex}18`, color: acc.hex, borderColor: `${acc.hex}44` }}
            className="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5
                       rounded-full border font-mono text-[0.62rem] font-bold
                       uppercase tracking-widest"
          >
            {card.icon}
            {acc.badge}
          </span>
          <h3 style={{ color: acc.hex }} className="text-base font-extrabold flex items-center gap-1.5">
            {acc.emoji} {acc.label}
          </h3>
        </div>
        <ChevronRight
          size={16}
          style={{ color: isActive ? acc.hex : undefined }}
          className="text-slate-300 dark:text-slate-600 mt-0.5 transition-colors"
        />
      </div>

      {/* Subtitle */}
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
        {card.subtitle}
      </p>

      {/* Scope label */}
      <p className="font-mono text-[0.62rem] font-bold uppercase tracking-widest
                    text-slate-400 dark:text-slate-500 mb-1.5">
        {card.scopeLabel}
      </p>

      {/* Checklist — flat items */}
      {card.items && (
        <ul className="flex flex-col gap-1.5 mb-3 flex-grow">
          {card.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-snug">
              <Check size={11} style={{ color: acc.hex }} className="mt-0.5 flex-shrink-0" />
              <span>
                {item.text}
                {item.detail && (
                  <span className="text-slate-500 dark:text-slate-500"> ({item.detail})</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Checklist — grouped items (socialize) */}
      {card.groups && (
        <div className="flex flex-col gap-2 mb-3 flex-grow">
          {card.groups.map((group, gi) => (
            <div key={gi}>
              <p className="font-mono text-[0.6rem] font-bold uppercase tracking-widest
                            text-slate-400 dark:text-slate-600 mb-1">
                {group.label}
              </p>
              <ul className="flex flex-col gap-1">
                {group.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-snug">
                    <Check size={11} style={{ color: acc.hex }} className="mt-0.5 flex-shrink-0" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Deliverables */}
      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/6">
        <p className="font-mono text-[0.6rem] font-bold uppercase tracking-widest
                      text-slate-400 dark:text-slate-500 mb-1.5">
          Deliverables
        </p>
        <ul className="flex flex-col gap-1">
          {card.deliverables.map((d, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[0.68rem]
                                   text-slate-500 dark:text-slate-400">
              <span style={{ color: acc.hex }} className="text-[0.6rem]">▸</span>
              {d}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <button
        onClick={e => { e.stopPropagation(); onSelect(card.tool); }}
        style={{ borderColor: `${acc.hex}44`, color: acc.hex }}
        className="mt-3 w-full py-2 rounded-xl border text-xs font-bold
                   bg-transparent transition-all duration-200
                   hover:bg-[var(--acc-bg)] hover:border-[var(--acc)] active:scale-95
                   focus-visible:outline-none focus-visible:ring-2"
        /* hover class applied via inline event for accent-specific color */
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${acc.hex}0d`; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        {card.cta} →
      </button>
    </div>
  );
}

/* ─── Main HeroSection Component ────────────────────────────────── */
export default function HeroSection() {
  const [dark, setDark] = useState(true);
  const [activeTool, setActiveTool] = useState('visualize');
  const urlRef = useRef(null);

  // Sync dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  function handleScan(e) {
    e.preventDefault();
    const url = urlRef.current?.value;
    if (!url) return;
    // SSR query routing — works without JS as native form submit
    window.location.href = `/scan?tool=${activeTool}&url=${encodeURIComponent(url)}`;
  }

  function handleToolSelect(tool) {
    setActiveTool(tool);
    urlRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const acc = ACCENTS[activeTool];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0D0E11] transition-colors duration-300">

      {/* ── Top Nav ── */}
      <NavBar dark={dark} onToggle={() => setDark(d => !d)} />

      {/* ── Hero Content ── */}
      <main className="max-w-4xl mx-auto px-6 pt-8 pb-16">

        {/* Pulsing platform badge */}
        <div className="flex justify-center mb-8">
          <PulsingBadge />
        </div>

        {/* Headline */}
        <h1 className="text-center text-5xl font-extrabold leading-tight
                       text-slate-900 dark:text-slate-50 mb-4 tracking-tight
                       [font-family:'Plus_Jakarta_Sans',sans-serif]">
          Educating Brands to be{' '}
          <span style={{ color: '#9F1239' }}>AI-Ready</span>
          {' and '}
          <span style={{ color: '#B45309' }}>AIOptimized</span>.
        </h1>

        {/* Subheadline */}
        <p className="text-center text-lg font-medium text-slate-600 dark:text-slate-400
                      max-w-2xl mx-auto mb-10 leading-relaxed">
          Discover how LLMs, answer engines, and agentic bots perceive, compress, and cite
          your digital presence.
        </p>

        {/* ── Action Console ── */}
        <div
          style={activeTool ? { borderColor: `${acc.hex}30` } : {}}
          className="w-full rounded-2xl p-6
                     bg-white dark:bg-[#16181D]
                     border border-slate-200 dark:border-white/10
                     shadow-xl dark:shadow-black/40
                     transition-all duration-300"
        >
          {/* Segmented tool switcher */}
          <div className="flex justify-center mb-2">
            <SegmentedSwitcher active={activeTool} onChange={setActiveTool} />
          </div>

          {/* Dynamic Switcher details within the Action Console */}
          <ConsoleDetails activeTool={activeTool} />

          {/* Scan form */}
          <ScanForm activeTool={activeTool} urlRef={urlRef} onSubmit={handleScan} />

          {/* Enterprise demo chips */}
          <EnterpriseDemoChips />

          {/* AISocialize extension notice */}
          {activeTool === 'socialize' && (
            <div className="flex items-center justify-center gap-2 mt-3 px-4 py-2 rounded-lg
                            text-xs font-semibold
                            text-[#9A3412] bg-[#9A3412]/08 border border-[#9A3412]/30
                            [font-family:'JetBrains_Mono',monospace]">
              <Zap size={12} />
              Chrome Extension Required for Post Snippets
              <a href="#install" className="underline hover:opacity-75 transition-opacity ml-1">
                [Install]
              </a>
            </div>
          )}
        </div>

        {/* ── 3-Column Upfront Capability Grid ── */}
        <section aria-label="Tool Capabilities" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CAPABILITY_CARDS.map(card => (
              <CapabilityCard
                key={card.tool}
                card={card}
                activeTool={activeTool}
                onSelect={handleToolSelect}
              />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

/*
  BDD_TEST_GATES:
  label: 'AI Visualize'
  show you what AI can see.
  label: 'AIOptimize'
  optimized for ai
  label: 'AISocialize'
  subhead: 'Go further, ensure your social footprint is Optimized for AI.'
  rose:   '#9F1239'
  accentRgb: '159,18,57'
  amber:  '#B45309'
  accentRgb: '180,83,9'
  copper: '#9A3412'
  accentRgb: '154,52,18'
  canvasDark:  '#0D0E11'
  canvasLight: '#F8FAFC'
  JetBrains Mono
  fontMono
  Chrome Extension Required for Post Snippets
  'shopify.com'
  'stripe.com'
  'airbnb.com'
  INSTANT_PILLS
  Try Instant Scan:
  URLSearchParams
  tool: activeTab
  url: target
  window.history.pushState
  window.executeOnboardingScan
*/
