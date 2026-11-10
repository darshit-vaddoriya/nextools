import React, { useEffect } from 'react';
import { ToolBody } from '../App';
import { ToastProvider } from '../components/Toast';
import { TOOLS } from '../config/tools';
import { EMBED_SITE } from '../config/embeds';

/**
 * A tool on its own, for an <iframe> on someone else's site: no header, nav,
 * ads or analytics, just the tool and a credit line that opens the full tool.
 */
const Embed: React.FC<{ toolId: string }> = ({ toolId }) => {
  const tool = TOOLS.find(t => t.id === toolId);

  // Tells the host page our height, for sites that want to size the iframe to
  // fit. Harmless when nothing listens; the snippet works without it.
  useEffect(() => {
    if (window.parent === window) return;
    let last = 0;
    const send = () => {
      const height = Math.ceil(document.documentElement.scrollHeight);
      if (height === last) return;
      last = height;
      window.parent.postMessage({ type: 'nexttool:embed-height', toolId, height }, '*');
    };
    const ro = new ResizeObserver(send);
    ro.observe(document.body);
    send();
    return () => ro.disconnect();
  }, [toolId]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col gap-3 p-3 sm:p-4">
        <main className="flex-1 min-w-0">
          <ToolBody toolId={toolId} />
        </main>
        <footer className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border pt-2.5 text-[12px] text-muted-foreground">
          <span>Runs in your browser. Nothing you type is uploaded.</span>
          <a
            href={`${EMBED_SITE}/tool/${toolId}?utm_source=embed&utm_medium=widget`}
            target="_blank"
            rel="noopener"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            {tool ? `${tool.name} by ` : ''}<strong>NextTool</strong> ↗
          </a>
        </footer>
      </div>
    </ToastProvider>
  );
};

export default Embed;
