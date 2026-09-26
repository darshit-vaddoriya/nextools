import React from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onGoHome: () => void;
}

interface State {
  error: Error | null;
}

const RELOAD_KEY = 'nexttool-chunk-reload';

/** Vite / browsers word a failed dynamic import differently; match them all. */
function isChunkError(err: Error): boolean {
  return /dynamically imported module|Importing a module script failed|Failed to fetch|error loading dynamically|ChunkLoadError|Loading chunk/i
    .test(`${err.name} ${err.message}`);
}

/**
 * Catches a view that fails to load, so the header and the tab bar stay usable
 * instead of the whole app unmounting to a blank screen.
 *
 * The common cause is a lazy chunk that cannot be fetched: either the device
 * is offline and that screen was never opened (so the service worker has no
 * copy), or a deploy replaced the hashed file this tab still points at. The
 * second case fixes itself with one reload, which is done automatically.
 * Remount it per route (via `key`) so navigating away clears the error.
 */
export class RouteErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (!isChunkError(error) || !navigator.onLine) return;
    try {
      // Online and a chunk is missing: almost always a new deploy. One reload
      // picks up the new file names; the timestamp stops a reload loop while
      // still allowing it again after a later deploy in the same session.
      const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      if (Date.now() - last > 30_000) {
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        window.location.reload();
      }
    } catch { /* storage blocked: just show the fallback */ }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const offline = typeof navigator !== 'undefined' && !navigator.onLine;
    const chunk = isChunkError(error);

    return (
      <div className="mx-auto max-w-md px-6 py-16 sm:py-24 text-center">
        <span className="mx-auto w-14 h-14 rounded-2xl bg-surface-container text-muted-foreground flex items-center justify-center">
          {offline || chunk ? <WifiOff className="w-6 h-6" /> : <RefreshCw className="w-6 h-6" />}
        </span>
        <h1 className="mt-5 text-xl font-extrabold tracking-tight text-foreground">
          {offline || chunk ? 'This page isn’t available offline yet' : 'Something went wrong'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {offline || chunk
            ? 'This tool hasn’t been saved on your device yet. Reconnect once to open it, or use Settings → “Download for offline” to save every tool.'
            : 'This view hit an unexpected error. Reloading usually fixes it.'}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={this.props.onGoHome}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted"
          >
            <Home className="w-4 h-4" /> Home
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
          >
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      </div>
    );
  }
}
