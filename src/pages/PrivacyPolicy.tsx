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
        className="btn-ghost"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tools</span>
      </button>

      {/* Main Card */}
      <div className="rounded-2xl border border-border bg-card shadow-card p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-border">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-success shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              Zero server uploads · processes in your browser · no login required
            </p>
          </div>
        </div>

        {/* 3 Privacy Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Cpu, title: '100% Client-Side', desc: 'Every tool (PDF, Video, WASM AI, Code formatters) runs locally on your device hardware using JavaScript and WebAssembly.', color: 'text-success', bg: 'bg-success/10' },
            { icon: Lock, title: 'Zero Data Upload', desc: 'Your files, PDFs, videos and code are never sent to an external server. They stay in your browser while you work.', color: 'text-primary', bg: 'bg-primary/10' },
            { icon: HardDrive, title: 'No Account Needed', desc: 'No registration, sign-up, or email addresses are ever required. NextTool is completely free and accessible instantly.', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-5 rounded-xl border border-border bg-muted/50">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-[13px] font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-[13px] text-foreground/80 leading-relaxed pt-4 border-t border-border">
          <div>
            <h3 className="text-[15px] font-bold text-foreground mb-2">1. Data Handling & Security</h3>
            <p>When you use NextTool, processing occurs entirely within your browser environment using modern browser technologies like WebCrypto API, HTML5 Canvas, WebAssembly (FFmpeg, Tesseract), and ONNX WebGPU AI models. No HTTP requests carry your file data to any server.</p>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-foreground mb-2">2. Local Storage Usage</h3>
            <p>NextTool uses <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-mono">localStorage</code> exclusively to preserve your theme preference (Light/Dark/System mode) and recent tools history locally on your computer. It never leaves your computer.</p>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-foreground mb-2">3. Advertising & Monetization</h3>
            <p>To keep all tools free without subscription fees or login walls, NextTool may display advertisements served by Google AdSense. These ads do not have access to your processed files or tool inputs.</p>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-foreground mb-2">4. Third-Party Services</h3>
            <p>NextTool is a static site. The HTML, CSS and JavaScript are served over HTTPS from a content delivery network. No server-side computations or database operations occur, and fonts are self-hosted so no external font services load on your device.</p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="pt-4 border-t border-border text-[11px] text-muted-foreground flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>Last updated: August 1, 2026 • NextTool © 2026</span>
        </div>
      </div>
    </div>
  );
};
