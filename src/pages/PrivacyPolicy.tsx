import React from 'react';
import { ShieldCheck, Lock, HardDrive, Cpu, ArrowLeft, Layers } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Breadcrumb */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-xl border transition-colors dark:bg-dark-card dark:border-dark-border dark:text-zinc-300 dark:hover:bg-dark-hover bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tools</span>
      </button>

      {/* Main Card */}
      <div className="rounded-2xl border p-6 sm:p-8 space-y-8 dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b dark:border-dark-border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-[13px] dark:text-zinc-400 text-slate-500 mt-1">
              Zero server uploads · processes in your browser · no login required
            </p>
          </div>
        </div>

        {/* 3 Privacy Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Cpu, title: '100% Client-Side', desc: 'Every tool (PDF, Video, WASM AI, Code formatters) runs locally on your device hardware using JavaScript and WebAssembly.', color: 'text-emerald-500', bg: 'dark:bg-emerald-500/10 bg-emerald-50' },
            { icon: Lock, title: 'Zero Data Upload', desc: 'Your files, PDFs, videos and code are never sent to an external server. They stay in your browser while you work.', color: 'text-indigo-500', bg: 'dark:bg-indigo-500/10 bg-indigo-50' },
            { icon: HardDrive, title: 'No Account Needed', desc: 'No registration, sign-up, or email addresses are ever required. NexTools is completely free and accessible instantly.', color: 'text-sky-500', bg: 'dark:bg-sky-500/10 bg-sky-50' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-5 rounded-xl border dark:bg-dark-bg/50 dark:border-dark-border bg-slate-50 border-slate-200">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-[13px] font-bold dark:text-white text-slate-900 mb-1">{item.title}</h3>
                <p className="text-[12px] dark:text-zinc-400 text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-[13px] dark:text-zinc-300 text-slate-600 leading-relaxed pt-4 border-t dark:border-dark-border border-slate-200">
          <div>
            <h3 className="text-[15px] font-bold dark:text-white text-slate-900 mb-2">1. Data Handling & Security</h3>
            <p>When you use NexTools, processing occurs entirely within your browser environment using modern browser technologies like WebCrypto API, HTML5 Canvas, WebAssembly (FFmpeg, Tesseract), and ONNX WebGPU AI models. No HTTP requests carry your file data to any server.</p>
          </div>

          <div>
            <h3 className="text-[15px] font-bold dark:text-white text-slate-900 mb-2">2. Local Storage Usage</h3>
            <p>NexTools uses <code className="px-1.5 py-0.5 rounded dark:bg-dark-bg bg-slate-100 text-xs font-mono">localStorage</code> exclusively to preserve your theme preference (Dark/Light mode) and recent tools history locally on your computer. It never leaves your computer.</p>
          </div>

          <div>
            <h3 className="text-[15px] font-bold dark:text-white text-slate-900 mb-2">3. Advertising & Monetization</h3>
            <p>To keep all tools free without subscription fees or login walls, NexTools may display advertisements served by Google AdSense. These ads do not have access to your processed files or tool inputs.</p>
          </div>

          <div>
            <h3 className="text-[15px] font-bold dark:text-white text-slate-900 mb-2">4. Third-Party Services</h3>
            <p>NexTools is a static site. The HTML, CSS and JavaScript are served over HTTPS from a content delivery network. No server-side computations or database operations occur, and fonts are self-hosted so no external font services load on your device.</p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="pt-4 border-t dark:border-dark-border border-slate-200 text-[11px] dark:text-zinc-600 text-slate-400 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>Last updated: August 1, 2026 • NexTools © 2026</span>
        </div>
      </div>
    </div>
  );
};
