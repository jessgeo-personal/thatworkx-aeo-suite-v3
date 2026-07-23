import React, { useState } from 'react';
import { Eye, ShieldAlert, Share2, Globe, ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState('visualize');
  const [url, setUrl] = useState('');

  const tabs = [
    {
      id: 'visualize',
      label: 'AI Visualize',
      icon: Eye,
      color: 'cyan',
      glowClass: 'shadow-[0_0_25px_rgba(6,182,212,0.15)] border-cyan-500/50',
      activeBorder: 'border-cyan-400',
      placeholder: 'Enter website URL to see what AI search bots see (e.g. https://yourbrand.com)...',
      buttonText: 'Initiate Scan',
    },
    {
      id: 'optimize',
      label: 'AIOptimize',
      icon: ShieldAlert,
      color: 'amber',
      glowClass: 'shadow-[0_0_25px_rgba(245,158,11,0.15)] border-amber-500/50',
      activeBorder: 'border-amber-400',
      placeholder: 'Enter domain to diagnose accessibility, configure schema & edge workers...',
      buttonText: 'Diagnose Site',
    },
    {
      id: 'socialize',
      label: 'AISocialize',
      icon: Share2,
      color: 'violet',
      glowClass: 'shadow-[0_0_25px_rgba(139,92,246,0.15)] border-violet-500/50',
      activeBorder: 'border-violet-400',
      placeholder: 'Enter brand social route or citation channel to audit (e.g. linkedin.com/company/...)...',
      buttonText: 'Audit Citations',
    }
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  const getBorderColor = () => {
    switch (activeTab) {
      case 'visualize': return 'border-cyan-500/40 focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.25)]';
      case 'optimize': return 'border-amber-500/40 focus-within:border-amber-400 focus-within:shadow-[0_0_20px_rgba(245,158,11,0.25)]';
      case 'socialize': return 'border-violet-500/40 focus-within:border-violet-400 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.25)]';
      default: return 'border-cyan-500/40';
    }
  };

  const getButtonBg = () => {
    switch (activeTab) {
      case 'visualize': return 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_4px_20px_rgba(6,182,212,0.3)] hover:shadow-[0_4px_30px_rgba(6,182,212,0.5)]';
      case 'optimize': return 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.5)]';
      case 'socialize': return 'bg-violet-500 hover:bg-violet-400 text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.5)]';
      default: return 'bg-cyan-500';
    }
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!url) return;
    alert(`Initiating ${activeTab} action for: ${url}`);
  };

  return (
    <div className="relative min-h-screen bg-[#08090C] text-slate-100 font-sans overflow-hidden flex flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      {/* 1. Glow grid and radial gradient mesh background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-r from-cyan-500/10 via-amber-500/5 to-violet-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto w-full z-10">
        
        {/* 2. Top Header Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] sm:text-xs font-semibold tracking-wider text-slate-300 uppercase shadow-xl backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            THE AEO & GEO INFRASTRUCTURE PLATFORM
          </div>
        </div>

        {/* 3. Headline & 4. Subheadline */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none mb-6">
            Educating Brands to be{' '}
            <span className="bg-gradient-to-r from-white via-cyan-400 to-amber-400 bg-clip-text text-transparent">
              AI-Ready, AI-First
            </span>
            , and{' '}
            <span className="bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
              AIOptimized.
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-400 font-medium leading-relaxed">
            Discover how LLMs, answer engines, and agentic bots perceive, compress, and cite your digital presence.
          </p>
        </div>

        {/* 5. Tool Switcher Search Console */}
        <div className={`w-full max-w-4xl mx-auto mb-16 rounded-2xl border bg-slate-950/80 backdrop-blur-xl transition-all duration-500 p-6 ${currentTab.glowClass}`}>
          
          {/* Segmented control pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 ${
                      isActive 
                        ? 'bg-slate-800 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Input Form */}
          <form onSubmit={handleScanSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className={`relative flex-grow flex items-center rounded-xl border bg-slate-900/50 transition-all duration-300 ${getBorderColor()}`}>
              <span className="absolute left-4 text-slate-500 pointer-events-none">
                <Globe className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={currentTab.placeholder}
                className="w-full h-14 pl-12 pr-4 bg-transparent text-slate-100 placeholder-slate-600 font-medium text-sm focus:outline-none rounded-xl"
              />
            </div>
            <button
              type="submit"
              className={`h-14 px-8 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 ${getButtonBg()}`}
            >
              {currentTab.buttonText}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* 6. Three Interactive Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: AI Visualize */}
          <div 
            onClick={() => setActiveTab('visualize')}
            className={`group flex flex-col p-6 rounded-2xl border bg-slate-950/40 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:bg-slate-950/80 hover:-translate-y-1 ${
              activeTab === 'visualize' 
                ? 'border-cyan-500/50 shadow-[0_4px_25px_rgba(6,182,212,0.08)]' 
                : 'border-slate-800 hover:border-cyan-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/30 text-cyan-400">
                <Eye className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-800/30 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                Audit
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
              AI Visualize
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Inspect your web visibility across 4 primary search vectors. Identify structural blocks, content density, and model index status.
            </p>
          </div>

          {/* Card 2: AIOptimize */}
          <div 
            onClick={() => setActiveTab('optimize')}
            className={`group flex flex-col p-6 rounded-2xl border bg-slate-950/40 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:bg-slate-950/80 hover:-translate-y-1 ${
              activeTab === 'optimize' 
                ? 'border-amber-500/50 shadow-[0_4px_25px_rgba(245,158,11,0.08)]' 
                : 'border-slate-800 hover:border-amber-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/30 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/50 border border-amber-800/30 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Treat
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
              AIOptimize
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Remediate vulnerabilities dynamically. Generate Edge workers to bypass hydration blocks and build custom flat-text md maps.
            </p>
          </div>

          {/* Card 3: AISocialize */}
          <div 
            onClick={() => setActiveTab('socialize')}
            className={`group flex flex-col p-6 rounded-2xl border bg-slate-950/40 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:bg-slate-950/80 hover:-translate-y-1 ${
              activeTab === 'socialize' 
                ? 'border-violet-500/50 shadow-[0_4px_25px_rgba(139,92,246,0.08)]' 
                : 'border-slate-800 hover:border-violet-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-violet-950/30 border border-violet-800/30 text-violet-400">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-950/50 border border-violet-800/30 text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                Amplify
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
              AISocialize
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Integrate off-page proof links and social citations into your system manifest schemas to solidify brand attribution.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HeroSection;
