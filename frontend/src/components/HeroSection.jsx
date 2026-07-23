import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, Share2, Globe, ArrowRight, Sun, Moon, Sparkles, ExternalLink } from 'lucide-react';

const HeroSection = () => {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('visualize');
  const [url, setUrl] = useState('');

  // Dynamically import fonts inside useEffect for self-containment
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=Space+Grotesk:wght@700;800&family=Space+Mono:wght@700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const tabs = [
    {
      id: 'visualize',
      label: 'AI Visualize',
      icon: Eye,
      color: 'cyan',
      placeholder: 'Enter domain URL (e.g., example.com)...',
      buttonText: 'Initiate Scan',
      subhead: "Let show you what AI can see.",
      listItems: [
        "1. Are you blocking out AI?",
        "2. Is your web presence optimized for AI?",
        "3. Is your content AI-Ready?",
        "4. Are you setup to be AI-First?"
      ]
    },
    {
      id: 'optimize',
      label: 'AIOptimize',
      icon: ShieldAlert,
      color: 'amber',
      placeholder: 'Enter domain or URL to optimize...',
      buttonText: 'Launch Optimizer',
      subhead: "IF you already know that you are AI-ready, lets show you how to be Optimized for AI.",
      listItems: [
        "• Optimizing for AI-Ready",
        "• Optimizing for AI-First"
      ]
    },
    {
      id: 'socialize',
      label: 'AISocialize',
      icon: Share2,
      color: 'violet',
      placeholder: 'Enter domain or social post URL...',
      buttonText: 'Check Social Readiness',
      subhead: "Go further, ensure your social footprint is Optimized for AI",
      sections: [
        {
          title: "Is your domain AI-ready for social?",
          items: [
            "- llms.txt exists",
            "- Has Author Info",
            "- Credential mentions",
            "- External links(Valid)",
            "- Authority links(valid)",
            "- LastUpdated"
          ]
        },
        {
          title: "Elevate your Social to AI-Ready",
          items: []
        }
      ]
    }
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  const getBorderColor = () => {
    if (theme === 'dark') {
      switch (activeTab) {
        case 'visualize': return 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.25)]';
        case 'optimize': return 'border-amber-500/40 focus-within:border-amber-400 focus-within:shadow-[0_0_20px_rgba(245,158,11,0.25)]';
        case 'socialize': return 'border-violet-500/40 focus-within:border-violet-400 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.25)]';
        default: return 'border-cyan-500/40';
      }
    } else {
      switch (activeTab) {
        case 'visualize': return 'border-cyan-500/20 focus-within:border-cyan-500 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.15)]';
        case 'optimize': return 'border-amber-500/20 focus-within:border-amber-500 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.15)]';
        case 'socialize': return 'border-violet-500/20 focus-within:border-violet-500 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.15)]';
        default: return 'border-cyan-500/20';
      }
    }
  };

  const getButtonBg = () => {
    switch (activeTab) {
      case 'visualize': return 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_4px_20px_rgba(6,182,212,0.25)]';
      case 'optimize': return 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_4px_20px_rgba(245,158,11,0.25)]';
      case 'socialize': return 'bg-violet-500 hover:bg-violet-400 text-white shadow-[0_4px_20px_rgba(139,92,246,0.25)]';
      default: return 'bg-cyan-500';
    }
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!url) return;
    
    if (activeTab === 'socialize') {
      alert('Thatworkx Browser Extension is required to check AISocialize readiness. Please install the extension from the Chrome Web Store to proceed.');
      return;
    }
    
    // Inject parameters into URL for bookmark capability and routing
    const queryUrl = `/scan?tool=${activeTab}&url=${encodeURIComponent(url)}`;
    window.location.href = queryUrl;
  };

  return (
    <div 
      className="relative min-h-screen font-['Plus_Jakarta_Sans'] overflow-hidden flex flex-col px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-500"
      style={{ backgroundColor: theme === 'dark' ? '#08090C' : '#FAFAFA', color: theme === 'dark' ? '#F1F5F9' : '#0F172A' }}
    >
      {/* Glow mesh background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293706_1px,transparent_1px),linear-gradient(to_bottom,#1f293706_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] pointer-events-none" />
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] blur-[140px] rounded-full pointer-events-none transition-opacity duration-700" 
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(90deg, rgba(6,182,212,0.08) 0%, rgba(245,158,11,0.04) 50%, rgba(139,92,246,0.06) 100%)' 
            : 'linear-gradient(90deg, rgba(6,182,212,0.04) 0%, rgba(245,158,11,0.02) 50%, rgba(139,92,246,0.03) 100%)'
        }}
      />

      {/* TOP HEADER */}
      <header className="relative max-w-5xl mx-auto w-full z-20 flex justify-between items-center py-4 mb-12 border-b" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }}>
        {/* Logo high-tech monospace */}
        <div className="font-['Space_Mono'] text-sm tracking-tight font-bold">
          aeo.thatworkx.com
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl border transition-all duration-300 active:scale-95 shadow-sm"
          style={{ 
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
            backgroundColor: theme === 'dark' ? '#111318' : '#FFFFFF',
            color: theme === 'dark' ? '#E2E8F0' : '#475569'
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-500" />}
        </button>
      </header>

      <div className="relative max-w-5xl mx-auto w-full z-10 flex-grow flex flex-col justify-center">
        
        {/* Top Header Badge */}
        <div className="flex justify-center mb-8">
          <div 
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full font-['Space_Mono'] text-[11px] font-bold tracking-wider uppercase shadow-md backdrop-blur-md"
            style={{
              backgroundColor: theme === 'dark' ? '#111318' : '#FFFFFF',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
              color: theme === 'dark' ? '#94A3B8' : '#475569'
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            THE AEO & GEO INFRASTRUCTURE PLATFORM
          </div>
        </div>

        {/* Headline & Subheadline */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-['Space_Grotesk'] font-extrabold tracking-tight leading-none mb-6"
            style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
          >
            Educating Brands to be{' '}
            <span className="text-[#06B6D4]">
              AI-Ready
            </span>
            , AI-First, and{' '}
            <span className="text-[#F59E0B]">
              AIOptimized
            </span>
            .
          </h1>
          <p className="text-base sm:text-lg text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
            Discover how LLMs, answer engines, and agentic bots perceive, compress, and cite your digital presence.
          </p>
        </div>

        {/* Tool Switcher Search Console Card */}
        <div 
          className="w-full max-w-4xl mx-auto rounded-2xl border backdrop-blur-xl transition-all duration-500 p-6 shadow-xl"
          style={{
            backgroundColor: theme === 'dark' ? '#111318' : '#FFFFFF',
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
            boxShadow: theme === 'dark' 
              ? '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)' 
              : '0 20px 40px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)'
          }}
        >
          
          {/* Segmented control tabs switcher */}
          <div className="flex justify-center mb-8">
            <div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full p-2 rounded-2xl"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(8,9,12,0.4)' : '#F1F5F9',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0'}`
              }}
            >
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                let activeBorderClass = '';
                if (isActive) {
                  if (tab.id === 'visualize') activeBorderClass = 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.12)] bg-[#13161c]';
                  else if (tab.id === 'optimize') activeBorderClass = 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.12)] bg-[#13161c]';
                  else if (tab.id === 'socialize') activeBorderClass = 'border-violet-500/60 shadow-[0_0_20px_rgba(139,92,246,0.12)] bg-[#13161c]';
                }

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-start text-left p-6 rounded-xl border transition-all duration-300 min-height-[280px] ${
                      isActive 
                        ? activeBorderClass
                        : 'border-transparent bg-slate-900/30 hover:bg-slate-900/50'
                    }`}
                    style={{
                      borderColor: isActive ? undefined : (theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#E2E8F0'),
                      backgroundColor: isActive ? undefined : (theme === 'dark' ? 'rgba(8,9,12,0.2)' : '#FFFFFF'),
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <IconComponent className={`w-5 h-5 ${isActive ? (tab.id === 'visualize' ? 'text-cyan-400' : tab.id === 'optimize' ? 'text-amber-400' : 'text-violet-400') : 'text-slate-500'}`} />
                      <span className={`font-['Space_Grotesk'] text-lg font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {tab.label}
                      </span>
                    </div>

                    <p className={`text-xs mb-4 font-semibold leading-relaxed ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {tab.subhead}
                    </p>

                    {tab.listItems && (
                      <ul className="space-y-1.5 text-[11px] text-slate-400 font-medium">
                        {tab.listItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {tab.sections && (
                      <div className="space-y-3.5 text-[11px] text-slate-400 font-medium w-full">
                        {tab.sections.map((sect, idx) => (
                          <div key={idx} className="space-y-1">
                            <span className="font-bold text-slate-300 block">{sect.title}</span>
                            {sect.items.length > 0 && (
                              <ul className="space-y-0.5 pl-3 list-none">
                                {sect.items.map((sub, sIdx) => (
                                  <li key={sIdx} className="text-slate-400">
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
          </div>

          {/* Search Input Form */}
          <form onSubmit={handleScanSubmit} className="flex flex-col sm:flex-row gap-3">
            <div 
              className={`relative flex-grow flex items-center rounded-xl border transition-all duration-300 ${getBorderColor()}`}
              style={{ backgroundColor: theme === 'dark' ? 'rgba(8,9,12,0.4)' : '#FAFAFA' }}
            >
              <span className="absolute left-4 text-slate-500 pointer-events-none">
                <Globe className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={currentTab.placeholder}
                className="w-full h-14 pl-12 pr-4 bg-transparent placeholder-slate-500 font-medium text-sm focus:outline-none rounded-xl"
                style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}
              />
            </div>
            <button
              type="submit"
              className={`h-14 px-8 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 hover:scale-[1.02] ${getButtonBg()}`}
            >
              {currentTab.buttonText}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Socialize dynamic badge */}
          {activeTab === 'socialize' && (
            <div 
              className="flex items-center justify-center gap-1.5 mt-4 py-2.5 px-4 font-semibold rounded-lg text-xs w-fit mx-auto shadow-sm border"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.03)',
                borderColor: theme === 'dark' ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)',
                color: '#8B5CF6'
              }}
            >
              ⚡ Chrome Extension Required for Snippet Generation 
              <a 
                href="#install" 
                className="underline ml-1 inline-flex items-center gap-0.5 hover:text-violet-400"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Opening Chrome Web Store extension installer...');
                }}
              >
                [Install Extension]
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HeroSection;
