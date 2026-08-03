import React, { useState } from 'react';
import { HelpCircle, Code, ShieldCheck, Terminal, Award, Layers, ChevronRight } from 'lucide-react';

const BentoGrid = () => {
  const [activeCodeTab, setActiveCodeTab] = useState('curl');
  const [previewMode, setPreviewMode] = useState('markdown');

  const codeSnippets = {
    curl: `curl -X POST https://aeo.thatworkx.com/api/scan \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer AEO_TOKEN_123" \\
  -d '{"targetUrl": "https://yourbrand.com"}'`,
    node: `const axios = require('axios');

axios.post('https://aeo.thatworkx.com/api/scan', {
  targetUrl: 'https://yourbrand.com'
}, {
  headers: { 'Authorization': 'Bearer AEO_TOKEN_123' }
}).then(res => console.log(res.data));`
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-20 px-4">
      {/* Section Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          Technical Capabilities at a Glance
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Explore how the Thatworkx AEO Suite audits and treats your digital footprint for AI crawlers.
        </p>
      </div>

      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Item 1: What is AEO? (Col span 2) */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-md hover:border-slate-700/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-3">
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">What is AEO?</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">What is Answer Engine Optimization (AEO)?</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-4 text-left">
              Make your standard human-facing pages instantly readable for AI engines—without heavy markup bloat, high token costs, or hidden core facts.
            </p>

            <div className="space-y-3 text-left mb-4">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <h4 className="text-xs font-bold text-white">Token-Efficient DOM & Layout</h4>
                <p className="text-[11px] text-slate-400 mt-1">Standard website markup is streamlined so search agents and LLM crawlers parse content without burning through excessive token budgets or visual wrapper bloat.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <h4 className="text-xs font-bold text-white">Direct Entity & Content Visibility</h4>
                <p className="text-[11px] text-slate-400 mt-1">Essential pages, services, pricing, and business details are immediately accessible and clearly surfaced using clean semantic markup and unambiguous structured schema.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <h4 className="text-xs font-bold text-white">RAG-Ready Information Density</h4>
                <p className="text-[11px] text-slate-400 mt-1">Content is formatted into logical, high-density text chunks with precise Q&A headers for instant Retrieval-Augmented Generation (RAG) extraction by AI answer engines.</p>
              </div>
            </div>
          </div>

          {/* Code Box Placed Below Text (Stacked Layout matching Tab 2 container styling) */}
          <div className="text-left mt-2">
            <div className="p-3 bg-slate-950/90 border border-slate-800/80 rounded-xl font-mono">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[10px]">
                <span className="font-bold text-slate-300">DOM-to-Token Streamline</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 font-bold">HTML ➔ MD</span>
              </div>
              <pre className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`<!-- Raw Bloated HTML -->
<div class="site-wrapper flex-col padding-24">
  <h1 class="text-4xl text-gray-900">What is Answer Engine Optimization?</h1>
  <p class="leading-relaxed">AEO optimizes digital assets so AI systems can cite them directly.</p>
</div>

<!-- Clean Markdown Token Stream -->
# What is Answer Engine Optimization?

AEO optimizes digital assets so AI systems can cite them directly.

--- [RAG Chunk Boundary | Entity: AEO Definition] ---`}
              </pre>
            </div>
          </div>
        </div>

        {/* Item 3: Live Sample Report (Col span 2) */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-md hover:border-slate-700/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-violet-400">
                <Code className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Live Sample Report</span>
              </div>
              
              {/* Tab Selector */}
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button 
                  onClick={() => setPreviewMode('markdown')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${previewMode === 'markdown' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                >
                  Raw Markdown
                </button>
                <button 
                  onClick={() => setPreviewMode('ai')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${previewMode === 'ai' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                >
                  AI Interpretation
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">How AI Agents Read Your Data</h3>
          </div>

          <div className="mt-2 text-left">
            {previewMode === 'markdown' ? (
              <pre className="p-3 bg-slate-950/80 border border-slate-800/60 rounded-xl font-mono text-[10px] text-slate-400 overflow-x-auto">
{`# Corporate Attributes (/ai-context.md)
* Legal Name: Thatworkx LLC
* NAICS Code: 541511 (Programming)
* Active EEAT Verification: https://yourbrand.com/EEAT-proof.json`}
              </pre>
            ) : (
              <div className="p-3 bg-slate-950/80 border border-slate-800/60 rounded-xl text-[11px] text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-bold">🤖 GPTBot summary parsed:</span>
                <p className="mt-1 text-slate-400">
                  Entity is verified as <strong className="text-white">Thatworkx LLC</strong> under software services NAICS-541511. Trust anchors are established via external JSON signature. Low hallucination index.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Item 4: Our Services (Col span 1) */}
        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-md hover:border-slate-700/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Our Services</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated Audit Suite</h3>
          </div>
          
          <ul className="space-y-2.5 my-3 text-left">
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <span className="text-emerald-500">✓</span> Automated sitemap audits
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <span className="text-emerald-500">✓</span> Synthetic bot crawling
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-300">
              <span className="text-emerald-500">✓</span> Citation tracking & rank mapping
            </li>
          </ul>
          
          <button className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 mt-2">
            View All Features
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item 5: Enterprise API Access (Col span 2) */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-md hover:border-slate-700/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Terminal className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Enterprise API Access</span>
              </div>
              
              {/* Code Tab selectors */}
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button 
                  onClick={() => setActiveCodeTab('curl')}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded ${activeCodeTab === 'curl' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                >
                  cURL
                </button>
                <button 
                  onClick={() => setActiveCodeTab('node')}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded ${activeCodeTab === 'node' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                >
                  Node.js
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automate Scans Programmatically</h3>
          </div>

          <div className="mt-2 text-left">
            <pre className="p-3 bg-slate-950/90 border border-slate-800/60 rounded-xl font-mono text-[9px] sm:text-[10px] text-slate-400 overflow-x-auto max-h-[120px]">
              {codeSnippets[activeCodeTab]}
            </pre>
          </div>
        </div>

        {/* Item 6: Fair Use & Capabilities (Col span 1) */}
        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-md hover:border-slate-700/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-yellow-400 mb-3">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Fair Use & Capabilities</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Fair Usage & API Limits</h3>
          </div>

          <div className="space-y-2.5 my-3 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Free Guest Scan limit</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300">5 / day</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Pro Crawl Depth cap</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300">50 / scan</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Headless browser rendering</span>
              <span className="px-2.5 py-0.5 rounded bg-cyan-950/30 border border-cyan-800/30 font-bold text-[9px] text-cyan-400 uppercase">PRO/ENT Only</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BentoGrid;
