import React, { useEffect, useRef } from 'react';
import { AD_CONFIG } from '../config/ads';

interface AdBannerProps {
  type: 'leaderboard' | 'sidebar' | 'native' | 'footer';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ type, className = '' }) => {
  const insRef = useRef<HTMLModElement>(null);
  const configs: Record<string, { label: string; dim: string; h: string }> = {
    leaderboard: { label: 'Leaderboard Ad', dim: '728×90 Responsive', h: 'h-[90px]' },
    sidebar:     { label: 'Sidebar Ad', dim: '300×250', h: 'h-[250px]' },
    native:      { label: 'Sponsored', dim: '300×250 Native', h: 'h-[180px]' },
    footer:      { label: 'Footer Ad', dim: '728×90 Responsive', h: 'h-[90px]' },
  };

  const cfg = configs[type] || configs.leaderboard;
  const enabled = AD_CONFIG.enabled && !AD_CONFIG.client.includes('XXXX');
  const slot = enabled ? AD_CONFIG.slots[type] : '';
  const showPlaceholder = AD_CONFIG.showPlaceholders && !enabled;

  useEffect(() => {
    const ins = insRef.current;
    if (!enabled || !ins || ins.dataset.adsbygoogleStatus === 'done') return;
    try {
      (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || [];
      (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.push({});
    } catch {
      /* ad script load nahi hua, chup chap ignore karo */
    }
  }, [enabled]);

  if (!enabled && !showPlaceholder) return null;

  return (
    <div className={`w-full ${className}`}>
      <p className="text-center text-[9px] font-mono uppercase tracking-[0.2em] text-border mb-1 select-none">
        Advertisement
      </p>
      {enabled ? (
        <div className="w-full flex flex-col items-center justify-center overflow-hidden rounded-xl bg-muted/40 border border-border">
          <ins
            ref={insRef}
            className="adsbygoogle w-full"
            style={{ display: 'block', minHeight: cfg.h.replace('h-[', '').replace(']', '') }}
            data-ad-client={AD_CONFIG.client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        <div
          className={`w-full ${cfg.h} rounded-xl border border-dashed bg-muted/40 border-border flex flex-col items-center justify-center relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent pointer-events-none" />
          <span className="text-[11px] font-medium text-muted-foreground/70">{cfg.label}</span>
          <span className="text-[9px] font-mono text-border mt-0.5">[{cfg.dim}]</span>
        </div>
      )}
    </div>
  );
};
