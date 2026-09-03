import React, { useState, useEffect, useCallback } from 'react';
import { CopyButton } from '../components/CopyButton';
import { errorMessage } from '../utils/errorMessage';
import { AlertTriangle, ShieldCheck, ShieldX } from 'lucide-react';
import { DarkPanel, WhitePanel } from '../components/DevToolChrome';

export const JwtDecoder: React.FC = () => {
  const [token, setToken] = useState<string>(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  );
  const [header, setHeader] = useState<Record<string, unknown> | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const base64UrlDecode = useCallback((str: string) => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return atob(base64);
  }, []);

  const decodeJwt = useCallback(() => {
    if (!token.trim()) { setHeader(null); setPayload(null); setError(null); return; }
    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) throw new Error('JWT must contain exactly 3 parts separated by dots.');
      setHeader(JSON.parse(base64UrlDecode(parts[0])));
      setPayload(JSON.parse(base64UrlDecode(parts[1])));
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'Invalid JWT structure'));
      setHeader(null);
      setPayload(null);
    }
  }, [token, base64UrlDecode]);

  useEffect(() => { decodeJwt(); }, [token, decodeJwt]);

  const expInfo = payload?.exp
    ? (() => {
        const d = new Date(Number(payload.exp) * 1000);
        return { dateString: d.toLocaleString(), isExpired: d.getTime() < Date.now() };
      })()
    : null;

  return (
    <div className="space-y-3.5">
      {/* Token Input */}
      <DarkPanel label="Encoded token">
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          spellCheck={false}
          placeholder="Paste JWT token here…"
          rows={4}
          className="w-full h-[100px] bg-transparent p-4 text-[13px] font-mono text-[color:var(--devpanel-text)] placeholder:text-[color:var(--devpanel-label)] resize-none focus:outline-none leading-relaxed outline-none break-all"
        />
      </DarkPanel>

      {/* Error */}
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Expiry status */}
      {expInfo && (
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 font-medium ${
          expInfo.isExpired
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-success'
        }`}>
          {expInfo.isExpired
            ? <ShieldX className="w-4 h-4 shrink-0" />
            : <ShieldCheck className="w-4 h-4 shrink-0" />
          }
          <span>
            Expiration: <strong>{expInfo.dateString}</strong>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              expInfo.isExpired ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {expInfo.isExpired ? 'EXPIRED' : 'ACTIVE'}
            </span>
          </span>
        </div>
      )}

      {/* Dual Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Header */}
        <WhitePanel
          label="Header"
          headerRight={<CopyButton text={JSON.stringify(header, null, 2)} />}
          className="h-[300px] lg:h-[360px]"
        >
          <pre className="flex-1 p-4 overflow-auto font-mono text-[13px] whitespace-pre-wrap leading-relaxed">
            {header
              ? JSON.stringify(header, null, 2)
              : <span className="text-muted-foreground font-sans italic text-xs">Decoded header appears here…</span>
            }
          </pre>
        </WhitePanel>

        {/* Payload */}
        <WhitePanel
          label="Payload"
          headerRight={
            <div className="flex items-center gap-2">
              {expInfo && (
                <span className={`text-[11.5px] font-bold px-2.5 py-0.5 rounded-full ${
                  expInfo.isExpired ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                }`}>
                  {expInfo.isExpired ? 'EXPIRED' : 'ACTIVE'}
                </span>
              )}
              <CopyButton text={JSON.stringify(payload, null, 2)} />
            </div>
          }
          className="h-[300px] lg:h-[360px]"
        >
          <pre className="flex-1 p-4 overflow-auto font-mono text-[13px] whitespace-pre-wrap leading-relaxed">
            {payload
              ? JSON.stringify(payload, null, 2)
              : <span className="text-muted-foreground font-sans italic text-xs">Decoded payload appears here…</span>
            }
          </pre>
        </WhitePanel>
      </div>
    </div>
  );
};
