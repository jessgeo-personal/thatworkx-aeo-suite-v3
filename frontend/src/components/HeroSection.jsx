import React, { useState, useEffect } from 'react';
import { Eye, Stethoscope, Share2, Globe, ArrowRight, Sun, Moon, Zap, ExternalLink } from 'lucide-react';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const TOKEN = {
  // Canvas
  canvasDark:  '#0D0E11',
  canvasLight: '#F8FAFC',

  // Card surfaces
  surfaceDark:   '#16181D',
  surfaceLight:  '#FFFFFF',

  // Input containers
  inputDark:   '#1F222A',
  inputLight:  '#F1F5F9',

  // Borders
  borderDark:  'rgba(255,255,255,0.08)',
  borderLight: '#E2E8F0',

  // Text
  textPrimaryDark:    '#F1F5F9',
  textPrimaryLight:   '#0F172A',
  textMutedDark:      '#64748B',
  textMutedLight:     '#475569',
  textSubMutedDark:   '#94A3B8',
  textSubMutedLight:  '#64748B',

  // Muted Tool Accent Tones (per spec)
  rose:   '#9F1239',   // AI Visualize  – Deep Rose Crimson
  amber:  '#B45309',   // AIOptimize    – Safety Amber
  copper: '#9A3412',   // AISocialize   – Burnt Copper

  // Fonts
  fontSans:  "'Plus Jakarta Sans', -apple-system, sans-serif",
  fontMono:  "'JetBrains Mono', 'Space Mono', 'Courier New', monospace",
};

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  {
    id: 'visualize',
    emoji: '👁️',
    icon: Eye,
    label: 'AI Visualize',
    accent: TOKEN.rose,
    accentRgb: '159,18,57',
    placeholder: 'Enter domain URL (e.g. example.com)...',
    cta: 'Initiate Scan',
    subhead: 'Let us show you what AI can see.',
    listItems: [
      '1. Are you blocking out AI?',
      '2. Is your web presence optimized for AI?',
      '3. Is your content AI-Ready?',
      '4. Are you setup to be AI-First?',
    ],
  },
  {
    id: 'optimize',
    emoji: '🩺',
    icon: Stethoscope,
    label: 'AIOptimize',
    accent: TOKEN.amber,
    accentRgb: '180,83,9',
    placeholder: 'Enter domain or URL to optimize...',
    cta: 'Launch Optimizer',
    subhead: "If you already know you are AI-ready, let's show you how to be Optimized for AI.",
    listItems: [
      '• Optimizing for AI-Ready',
      '• Optimizing for AI-First',
    ],
  },
  {
    id: 'socialize',
    emoji: '📣',
    icon: Share2,
    label: 'AISocialize',
    accent: TOKEN.copper,
    accentRgb: '154,52,18',
    placeholder: 'Enter domain or social post URL...',
    cta: 'Check Social Readiness',
    subhead: 'Go further, ensure your social footprint is Optimized for AI.',
    sections: [
      {
        title: 'Is your domain AI-ready for social?',
        items: ['- llms.txt exists', '- Has Author Info', '- Credential mentions', '- External links (Valid)', '- Authority links (valid)', '- LastUpdated'],
      },
      { title: 'Elevate your Social to AI-Ready', items: [] },
    ],
  },
];

const INSTANT_PILLS = ['shopify.com', 'stripe.com', 'airbnb.com'];

// ─── Component ────────────────────────────────────────────────────────────────
const HeroSection = () => {
  const [theme, setTheme]       = useState('dark');
  const [activeTab, setActiveTab] = useState('visualize');
  const [url, setUrl]             = useState('');

  const isDark = theme === 'dark';
  const tok = (dark, light) => isDark ? dark : light;

  // ── Font injection
  useEffect(() => {
    const id = 'hero-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id   = id;
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@600;700&display=swap';
    document.head.appendChild(link);
    return () => { if (document.getElementById(id)) document.head.removeChild(link); };
  }, []);

  // ── URL query param read (bookmark / SSR-capable)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get('tool');
    const u = p.get('url');
    if (t && TABS.find(x => x.id === t)) setActiveTab(t);
    if (u) setUrl(decodeURIComponent(u));
  }, []);

  const currentTab = TABS.find(t => t.id === activeTab);

  // ── Form submit: inject query params for bookmarking
  const handleSubmit = (e, overrideUrl) => {
    e.preventDefault();
    const target = (overrideUrl || url).trim();
    if (!target) return;
    setUrl(target);

    if (activeTab === 'socialize') {
      alert('Thatworkx Browser Extension is required to check AISocialize readiness. Please install the extension from the Chrome Web Store.');
      return;
    }

    const qs = new URLSearchParams({ tool: activeTab, url: target }).toString();
    window.history.pushState({}, '', `${window.location.pathname}?${qs}`);

    // Bridge to existing vanilla-JS scan runner if present
    const mainInput = document.getElementById('target-url');
    if (mainInput) mainInput.value = target;
    const onboardInput = document.getElementById('onboarding-target-url');
    if (onboardInput) onboardInput.value = target;
    if (typeof window.executeOnboardingScan === 'function') {
      window.executeOnboardingScan(new Event('submit'));
    }
  };

  const handlePillClick = (domain) => {
    setUrl(domain);
    handleSubmit(new Event('submit'), domain);
  };

  // ── Dynamic style helpers
  const accentHex  = currentTab.accent;
  const accentRgb  = currentTab.accentRgb;
  const accentGlow = `0 0 22px rgba(${accentRgb},0.22)`;

  const cardBorder = (tab) =>
    activeTab === tab.id
      ? `1px solid ${tab.accent}`
      : `1px solid ${tok(TOKEN.borderDark, TOKEN.borderLight)}`;

  const cardBg = (tab) =>
    activeTab === tab.id
      ? (isDark ? `rgba(${tab.accentRgb},0.06)` : `rgba(${tab.accentRgb},0.04)`)
      : tok('rgba(8,9,12,0.20)', '#FAFAFA');

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden transition-colors duration-500"
      style={{
        backgroundColor: tok(TOKEN.canvasDark, TOKEN.canvasLight),
        color:           tok(TOKEN.textPrimaryDark, TOKEN.textPrimaryLight),
        fontFamily:      TOKEN.fontSans,
      }}
    >
      {/* ── Ambient glow mesh ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? `radial-gradient(ellipse 80% 45% at 50% 0%, rgba(${currentTab.accentRgb},0.09) 0%, transparent 70%)`
            : `radial-gradient(ellipse 80% 45% at 50% 0%, rgba(${currentTab.accentRgb},0.04) 0%, transparent 70%)`,
          transition: 'background 0.6s ease',
        }}
      />
      {/* Dot-grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${tok('rgba(255,255,255,0.04)', 'rgba(0,0,0,0.04)')} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 10%, black 30%, transparent 100%)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════
          TOP HEADER
      ═══════════════════════════════════════════════════════ */}
      <header
        className="relative z-20 w-full px-6 lg:px-10 py-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${tok(TOKEN.borderDark, TOKEN.borderLight)}` }}
      >
        {/* Logo */}
        <span
          className="text-sm font-bold tracking-tight"
          style={{ fontFamily: TOKEN.fontMono, color: tok('#E2E8F0', '#0F172A') }}
        >
          aeo.thatworkx.com
        </span>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(p => p === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl transition-all duration-300 active:scale-95"
          style={{
            border:           `1px solid ${tok(TOKEN.borderDark, TOKEN.borderLight)}`,
            backgroundColor:  tok(TOKEN.surfaceDark, TOKEN.surfaceLight),
            color:            tok('#E2E8F0', '#475569'),
          }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark
            ? <Sun  className="w-4 h-4" style={{ color: TOKEN.amber }} />
            : <Moon className="w-4 h-4" style={{ color: '#6D28D9' }} />}
        </button>
      </header>

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════ */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-10">

          {/* ── Pulsing top badge ── */}
          <div
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{
              fontFamily:      TOKEN.fontMono,
              backgroundColor: tok(TOKEN.surfaceDark, TOKEN.surfaceLight),
              border:          `1px solid ${tok(TOKEN.borderDark, TOKEN.borderLight)}`,
              color:           tok(TOKEN.textSubMutedDark, TOKEN.textSubMutedLight),
              boxShadow:       isDark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {/* Pulsing dot */}
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: '#22C55E' }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: '#16A34A' }}
              />
            </span>
            THE AEO &amp; GEO INFRASTRUCTURE PLATFORM
          </div>

          {/* ── Headline + Subheadline ── */}
          <div className="text-center max-w-3xl">
            <h1
              className="font-extrabold leading-[1.06] tracking-tight mb-5"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.4rem)',
                color:    tok('#FFFFFF', '#0F172A'),
              }}
            >
              Educating Brands to be{' '}
              <span style={{ color: TOKEN.rose }}>AI-Ready</span>
              , AI-First, and{' '}
              <span style={{ color: TOKEN.amber }}>AIOptimized</span>
              .
            </h1>
            <p
              className="text-base sm:text-lg font-medium leading-relaxed"
              style={{ color: tok(TOKEN.textSubMutedDark, TOKEN.textMutedLight) }}
            >
              Discover how LLMs, answer engines, and agentic bots perceive, compress,
              and cite your digital presence.
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════════
              DYNAMIC ACTION CONSOLE CARD
          ═══════════════════════════════════════════════════════ */}
          <div
            className="w-full rounded-2xl p-5 sm:p-7 transition-all duration-500"
            style={{
              backgroundColor: tok(TOKEN.surfaceDark, TOKEN.surfaceLight),
              border:          `1px solid ${tok('rgba(255,255,255,0.07)', TOKEN.borderLight)}`,
              boxShadow:       isDark
                ? `0 32px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04), ${accentGlow}`
                : `0 20px 48px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)`,
              backdropFilter:  'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              transition: 'box-shadow 0.5s ease, background-color 0.5s ease',
            }}
          >
            {/* ── Segmented Switcher Pill (3 tabs) ── */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 p-1.5 rounded-xl"
              style={{
                backgroundColor: tok('rgba(8,9,12,0.45)', TOKEN.inputLight),
                border:          `1px solid ${tok('rgba(255,255,255,0.05)', TOKEN.borderLight)}`,
              }}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className="flex flex-col items-start text-left p-4 sm:p-5 rounded-xl transition-all duration-300 focus:outline-none"
                    style={{
                      background:  cardBg(tab),
                      border:      cardBorder(tab),
                      boxShadow:   isActive ? `0 0 20px rgba(${tab.accentRgb},0.14)` : 'none',
                      minHeight:   '220px',
                      textAlign:   'left',
                    }}
                    aria-pressed={isActive}
                    aria-label={`Select ${tab.label}`}
                  >
                    {/* Tab header row */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <Icon
                        className="w-4 h-4 flex-shrink-0 transition-colors duration-300"
                        style={{ color: isActive ? tab.accent : tok('#475569', '#94A3B8') }}
                      />
                      <span
                        className="text-base font-bold transition-colors duration-300"
                        style={{ color: isActive ? tab.accent : tok('#64748B', '#94A3B8') }}
                      >
                        {tab.label}
                      </span>
                    </div>

                    {/* Subheadline */}
                    <p
                      className="text-xs font-semibold leading-snug mb-3"
                      style={{ color: isActive ? tok('#CBD5E1', '#475569') : tok('#475569', '#94A3B8') }}
                    >
                      {tab.subhead}
                    </p>

                    {/* List items */}
                    {tab.listItems && (
                      <ul className="flex flex-col gap-1 text-left">
                        {tab.listItems.map((item, i) => (
                          <li
                            key={i}
                            className="text-xs font-medium leading-snug"
                            style={{ color: isActive ? tok('#94A3B8', '#64748B') : tok('#374151', '#9CA3AF') }}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* AISocialize nested sections */}
                    {tab.sections && (
                      <div className="flex flex-col gap-2.5 w-full text-left">
                        {tab.sections.map((sect, i) => (
                          <div key={i}>
                            <span
                              className="block text-xs font-bold mb-1"
                              style={{ color: isActive ? tok('#CBD5E1', '#374151') : tok('#4B5563', '#9CA3AF') }}
                            >
                              {sect.title}
                            </span>
                            {sect.items.length > 0 && (
                              <ul className="flex flex-col gap-0.5 pl-1">
                                {sect.items.map((sub, si) => (
                                  <li
                                    key={si}
                                    className="text-xs"
                                    style={{ color: tok('#64748B', '#94A3B8') }}
                                  >
                                    {sub}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── URL Input Form ── */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              {/* Input */}
              <div
                className="relative flex-grow flex items-center rounded-xl transition-all duration-300"
                style={{
                  backgroundColor: tok(TOKEN.inputDark, TOKEN.inputLight),
                  border:          `1px solid ${accentHex}`,
                  boxShadow:       `0 0 0 0px rgba(${accentRgb},0)`,
                }}
              >
                <Globe
                  className="absolute left-4 w-4 h-4 pointer-events-none flex-shrink-0"
                  style={{ color: tok('#475569', '#94A3B8') }}
                />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={currentTab.placeholder}
                  className="w-full h-13 pl-11 pr-4 py-3.5 bg-transparent text-sm font-medium placeholder-slate-500 focus:outline-none rounded-xl"
                  style={{
                    color:       tok('#F1F5F9', '#0F172A'),
                    fontFamily:  TOKEN.fontSans,
                    minHeight:   '52px',
                  }}
                  aria-label="Enter URL to scan"
                />
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-7 font-bold text-sm tracking-wide rounded-xl whitespace-nowrap transition-all duration-300 active:scale-95 hover:brightness-110"
                style={{
                  backgroundColor: accentHex,
                  color:           '#FFFFFF',
                  minHeight:       '52px',
                  boxShadow:       `0 4px 18px rgba(${accentRgb},0.35)`,
                  fontFamily:      TOKEN.fontSans,
                }}
                aria-label={currentTab.cta}
              >
                {currentTab.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* ── AISocialize Extension Badge ── */}
            {activeTab === 'socialize' && (
              <div
                className="flex items-center justify-center gap-1.5 mt-3.5 py-2.5 px-4 rounded-lg text-xs font-semibold w-fit mx-auto border"
                style={{
                  backgroundColor: `rgba(${TABS[2].accentRgb},0.07)`,
                  borderColor:     `rgba(${TABS[2].accentRgb},0.3)`,
                  color:           TOKEN.copper,
                  fontFamily:      TOKEN.fontMono,
                }}
              >
                <Zap className="w-3 h-3 flex-shrink-0" />
                Chrome Extension Required for Post Snippets
                <a
                  href="#install"
                  className="underline ml-1 inline-flex items-center gap-0.5 hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Opening Chrome Web Store extension installer...');
                  }}
                  style={{ color: TOKEN.copper }}
                  aria-label="Install AISocialize Chrome Extension"
                >
                  [Install]
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* ── 1-Click Instant Try Pills ── */}
            <div
              className="flex flex-wrap items-center justify-center gap-2 mt-5 pt-5"
              style={{ borderTop: `1px solid ${tok('rgba(255,255,255,0.05)', TOKEN.borderLight)}` }}
            >
              <span
                className="text-xs font-semibold flex-shrink-0"
                style={{ color: tok('#475569', '#94A3B8'), fontFamily: TOKEN.fontMono }}
              >
                ⚡ Try Instant Scan:
              </span>
              {INSTANT_PILLS.map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => handlePillClick(domain)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 hover:brightness-110"
                  style={{
                    fontFamily:      TOKEN.fontMono,
                    backgroundColor: `rgba(${currentTab.accentRgb},0.10)`,
                    border:          `1px solid rgba(${currentTab.accentRgb},0.25)`,
                    color:           accentHex,
                  }}
                  aria-label={`Run instant scan on ${domain}`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HeroSection;
