import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CopyButton } from '../../components/CopyButton';
import { Select } from '../../components/Select';
import {
  KeyRound, ShieldCheck, FileDigit, Dices, Lock, Upload, RefreshCw, Unlock, AlertTriangle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Passphrase Generator                                                */
/* ------------------------------------------------------------------ */

const WORDLIST = [
  'apple', 'anchor', 'arrow', 'autumn', 'avocado', 'badge', 'baker', 'balloon', 'bamboo', 'basket',
  'beacon', 'bear', 'berry', 'bicycle', 'birch', 'blanket', 'blossom', 'bolt', 'bottle', 'boulder',
  'bramble', 'breeze', 'bridge', 'bright', 'brook', 'bubble', 'bucket', 'bugle', 'cabin', 'camel',
  'candle', 'canyon', 'captain', 'caramel', 'carrot', 'castle', 'cedar', 'cement', 'ceramic', 'chalk',
  'charm', 'cheese', 'cherry', 'chimney', 'circle', 'clover', 'cloud', 'clover', 'coast', 'cobalt',
  'coconut', 'comet', 'compass', 'copper', 'coral', 'cotton', 'cradle', 'crane', 'crater', 'cricket',
  'crown', 'crystal', 'dagger', 'daisy', 'dawn', 'delta', 'desert', 'diamond', 'dolphin', 'dragon',
  'drift', 'drum', 'eagle', 'ember', 'emerald', 'engine', 'falcon', 'feather', 'fence', 'fern',
  'ferry', 'field', 'finch', 'fire', 'flame', 'flint', 'forest', 'fossil', 'fountain', 'fox',
  'frost', 'galaxy', 'garden', 'gazelle', 'ginger', 'glacier', 'glass', 'globe', 'gold', 'granite',
  'grape', 'gravel', 'guitar', 'harbor', 'harvest', 'hawk', 'hazel', 'heather', 'hickory', 'honey',
  'horizon', 'hunter', 'iceberg', 'indigo', 'island', 'ivory', 'jade', 'jasper', 'jungle', 'kettle',
  'kingdom', 'kite', 'lagoon', 'lantern', 'laurel', 'lemon', 'leopard', 'lily', 'lime', 'lion',
  'lobster', 'lotus', 'lumber', 'lunar', 'magnet', 'maple', 'marble', 'marigold', 'meadow', 'meteor',
  'mint', 'mirror', 'mist', 'monarch', 'moon', 'moose', 'moss', 'mountain', 'mustang', 'nebula',
  'nectar', 'needle', 'night', 'nutmeg', 'oasis', 'ocean', 'olive', 'onyx', 'opal', 'orange',
  'orbit', 'orchid', 'osprey', 'otter', 'owl', 'palace', 'panda', 'panther', 'papaya', 'parrot',
  'pearl', 'pebble', 'pelican', 'penguin', 'pepper', 'phoenix', 'pigeon', 'pilot', 'pine', 'planet',
  'plum', 'polar', 'poppy', 'prairie', 'prism', 'quartz', 'quiver', 'rabbit', 'raccoon', 'rainbow',
  'raven', 'reef', 'ribbon', 'river', 'robin', 'rocket', 'rose', 'ruby', 'saddle', 'saffron',
  'sage', 'salmon', 'sand', 'sapphire', 'scout', 'shadow', 'shark', 'shell', 'shore', 'silver',
  'sky', 'sloth', 'smoke', 'snow', 'sparrow', 'spice', 'spring', 'spruce', 'star', 'steel',
  'stone', 'storm', 'summer', 'summit', 'sunset', 'swan', 'thistle', 'thunder', 'tiger', 'timber',
  'topaz', 'tower', 'trail', 'tulip', 'tundra', 'turtle', 'valley', 'velvet', 'violet', 'vortex',
  'walnut', 'walrus', 'whale', 'willow', 'winter', 'wolf', 'wren', 'zebra', 'zephyr', 'zenith',
];

function secureRandomInt(max: number): number {
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  return arr[0] % max;
}

export const PassphraseGeneratorTool: React.FC = () => {
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [includeNumber, setIncludeNumber] = useState(true);
  const [capitalize, setCapitalize] = useState(true);
  const [passphrase, setPassphrase] = useState('');

  const generate = useCallback(() => {
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      let w = WORDLIST[secureRandomInt(WORDLIST.length)];
      if (capitalize) w = w[0].toUpperCase() + w.slice(1);
      words.push(w);
    }
    if (includeNumber) {
      words.push(String(secureRandomInt(100)));
    }
    setPassphrase(words.join(separator));
  }, [wordCount, separator, includeNumber, capitalize]);

  useEffect(() => { generate(); }, [generate]);

  const entropy = Math.log2(WORDLIST.length) * wordCount + (includeNumber ? Math.log2(100) : 0);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="bg-muted border border-border rounded-xl px-4 py-3.5 font-mono text-lg text-emerald-500 font-bold tracking-wide break-all select-all flex items-center justify-between gap-4">
          <span className="truncate">{passphrase || '-'}</span>
          <CopyButton text={passphrase} label="Copy" className="shrink-0" />
        </div>
        <p className="text-[11px] text-muted-foreground font-mono">~{Math.round(entropy)} bits of entropy</p>
        <button onClick={generate} className="btn-primary w-full justify-center py-2.5">
          <RefreshCw className="w-4 h-4" />
          Generate New Passphrase
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Configuration</p>
        </div>
        <div className="space-y-2.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-medium">Word Count</span>
            <span className="font-mono font-bold text-primary">{wordCount}</span>
          </div>
          <input
            type="range" min={3} max={8} value={wordCount}
            onChange={(e) => setWordCount(parseInt(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Separator</p>
            <Select
              value={separator}
              options={[
                { value: '-', label: 'Hyphen (-)' },
                { value: '_', label: 'Underscore (_)' },
                { value: '.', label: 'Dot (.)' },
                { value: ' ', label: 'Space' },
                { value: '', label: 'None' },
              ]}
              onChange={setSeparator}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <label className={`p-3 rounded-xl border cursor-pointer select-none flex items-center gap-2 text-xs font-medium ${includeNumber ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
            <input type="checkbox" checked={includeNumber} onChange={(e) => setIncludeNumber(e.target.checked)} className="rounded text-primary" />
            Append Number
          </label>
          <label className={`p-3 rounded-xl border cursor-pointer select-none flex items-center gap-2 text-xs font-medium ${capitalize ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
            <input type="checkbox" checked={capitalize} onChange={(e) => setCapitalize(e.target.checked)} className="rounded text-primary" />
            Capitalize Words
          </label>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Password Strength                                                   */
/* ------------------------------------------------------------------ */

export const PasswordStrengthTool: React.FC = () => {
  const [password, setPassword] = useState('');

  const analysis = useMemo(() => {
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

    const entropy = password.length > 0 && poolSize > 0 ? password.length * Math.log2(poolSize) : 0;
    const guessesPerSecond = 10_000_000_000; // 10 billion / sec offline attack
    const combinations = Math.pow(2, entropy);
    const secondsToCrack = combinations / guessesPerSecond / 2; // average case

    let label = 'Very Weak';
    let color = 'text-rose-500';
    let bg = 'bg-rose-500';
    let width = 'w-1/5';
    if (entropy > 28) { label = 'Weak'; color = 'text-orange-500'; bg = 'bg-orange-500'; width = 'w-2/5'; }
    if (entropy > 45) { label = 'Fair'; color = 'text-amber-500'; bg = 'bg-amber-500'; width = 'w-3/5'; }
    if (entropy > 65) { label = 'Good'; color = 'text-cyan-500'; bg = 'bg-cyan-500'; width = 'w-4/5'; }
    if (entropy > 90) { label = 'Strong'; color = 'text-emerald-500'; bg = 'bg-emerald-500'; width = 'w-full'; }

    return { entropy, secondsToCrack, label, color, bg, width };
  }, [password]);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return 'instantly';
    if (seconds < 1) return 'instantly';
    const units: [number, string][] = [
      [60, 'seconds'], [60, 'minutes'], [24, 'hours'], [365, 'days'], [100, 'years'], [Infinity, 'centuries'],
    ];
    let value = seconds;
    let unitLabel = 'seconds';
    for (const [factor, label] of units) {
      if (value < factor) { unitLabel = label; break; }
      value /= factor;
      unitLabel = label;
    }
    if (unitLabel === 'centuries' && value > 1e6) return 'longer than the age of the universe';
    return `~${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unitLabel}`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Enter Password</p>
        </div>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-base font-mono"
          placeholder="Type a password to analyze…"
          autoComplete="off"
        />
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Strength: <strong className={`font-bold ${analysis.color}`}>{analysis.label}</strong></span>
          <span className="text-muted-foreground font-mono">{Math.round(analysis.entropy)} bits</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={`h-full ${analysis.bg} ${analysis.width} rounded-full transition-all duration-500`} />
        </div>
        <div className="bg-muted border border-border rounded-lg px-3 py-2.5 text-sm">
          <span className="text-muted-foreground">Estimated crack time (offline, 10B guesses/sec): </span>
          <span className="font-mono font-bold text-foreground">{formatTime(analysis.secondsToCrack)}</span>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* File Checksum                                                       */
/* ------------------------------------------------------------------ */

async function digestHex(algo: 'SHA-256' | 'SHA-1', data: ArrayBuffer): Promise<string> {
  const hashBuffer = await window.crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const FileChecksumTool: React.FC = () => {
  const [fileName, setFileName] = useState('');
  const [sha256, setSha256] = useState('');
  const [sha1, setSha1] = useState('');
  const [compareValue, setCompareValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const [h256, h1] = await Promise.all([digestHex('SHA-256', buffer), digestHex('SHA-1', buffer)]);
      setSha256(h256);
      setSha1(h1);
    } finally {
      setLoading(false);
    }
  };

  const matchStatus = useMemo(() => {
    if (!compareValue.trim()) return null;
    const normalized = compareValue.trim().toLowerCase();
    if (normalized === sha256.toLowerCase() || normalized === sha1.toLowerCase()) return true;
    return false;
  }, [compareValue, sha256, sha1]);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FileDigit className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Select File</p>
        </div>
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-8 cursor-pointer hover:border-primary/50 transition-colors">
          <Upload className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{fileName || 'Click to choose a file'}</span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
          />
        </label>
        {loading && <p className="text-xs text-muted-foreground">Computing hashes…</p>}
      </div>

      {(sha256 || sha1) && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">SHA-256</p>
            <div className="bg-muted border border-border rounded-lg px-3 py-2.5 text-xs font-mono break-all flex items-center justify-between gap-2">
              <span className="truncate">{sha256}</span>
              <CopyButton text={sha256} className="shrink-0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">SHA-1</p>
            <div className="bg-muted border border-border rounded-lg px-3 py-2.5 text-xs font-mono break-all flex items-center justify-between gap-2">
              <span className="truncate">{sha1}</span>
              <CopyButton text={sha1} className="shrink-0" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground italic">MD5 is not included — it requires a third-party library which this tool avoids.</p>

          <div className="space-y-1.5 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground font-medium">Compare Against</p>
            <input
              value={compareValue}
              onChange={(e) => setCompareValue(e.target.value)}
              className="input-base font-mono"
              placeholder="Paste a hash to compare…"
            />
            {matchStatus !== null && (
              <p className={`text-xs font-bold ${matchStatus ? 'text-emerald-500' : 'text-rose-500'}`}>
                {matchStatus ? 'Match' : 'Mismatch'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Random String Generator                                             */
/* ------------------------------------------------------------------ */

export const RandomStringTool: React.FC = () => {
  const [length, setLength] = useState(16);
  const [useLetters, setUseLetters] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<string[]>([]);

  const generate = useCallback(() => {
    const sets: string[] = [];
    if (useLetters) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
    if (useDigits) sets.push('0123456789');
    if (useSymbols) sets.push('!@#$%^&*()_+-=[]{}|;:,.<>?');
    if (!sets.length) { setResults([]); return; }
    const chars = sets.join('');
    const out: string[] = [];
    for (let c = 0; c < count; c++) {
      const randomValues = new Uint32Array(length);
      window.crypto.getRandomValues(randomValues);
      let str = '';
      for (let i = 0; i < length; i++) str += chars[randomValues[i] % chars.length];
      out.push(str);
    }
    setResults(out);
  }, [length, useLetters, useDigits, useSymbols, count]);

  useEffect(() => { generate(); }, [generate]);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Dices className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Configuration</p>
        </div>
        <div className="space-y-2.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-medium">Length</span>
            <span className="font-mono font-bold text-primary">{length}</span>
          </div>
          <input
            type="range" min={4} max={128} value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <label className={`p-3 rounded-xl border cursor-pointer select-none flex items-center gap-2 text-xs font-medium ${useLetters ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
            <input type="checkbox" checked={useLetters} onChange={(e) => setUseLetters(e.target.checked)} className="rounded text-primary" />
            Letters
          </label>
          <label className={`p-3 rounded-xl border cursor-pointer select-none flex items-center gap-2 text-xs font-medium ${useDigits ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
            <input type="checkbox" checked={useDigits} onChange={(e) => setUseDigits(e.target.checked)} className="rounded text-primary" />
            Digits
          </label>
          <label className={`p-3 rounded-xl border cursor-pointer select-none flex items-center gap-2 text-xs font-medium ${useSymbols ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
            <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} className="rounded text-primary" />
            Symbols
          </label>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">Output Count</p>
          <input
            type="number" min={1} max={50} value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
            className="input-base font-mono w-24"
          />
        </div>
        <button onClick={generate} className="btn-primary w-full justify-center py-2.5">
          <RefreshCw className="w-4 h-4" />
          Generate
        </button>
      </div>

      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={i} className="bg-muted border border-border rounded-lg px-3 py-2.5 font-mono text-sm break-all select-all flex items-center justify-between gap-3">
            <span className="truncate">{r}</span>
            <CopyButton text={r} className="shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Secure Notes                                                        */
/* ------------------------------------------------------------------ */

const SECURE_NOTES_KEY = 'secure-notes-v1';

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: 150_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function base64ToBuf(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export const SecureNotesTool: React.FC = () => {
  const [passphrase, setPassphrase] = useState('');
  const [noteText, setNoteText] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [hasSavedNote, setHasSavedNote] = useState<boolean>(() => !!localStorage.getItem(SECURE_NOTES_KEY));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleUnlock = async () => {
    setError('');
    const raw = localStorage.getItem(SECURE_NOTES_KEY);
    if (!raw) { setUnlocked(true); return; }
    setBusy(true);
    try {
      const { salt, iv, ciphertext } = JSON.parse(raw);
      const key = await deriveKey(passphrase, base64ToBuf(salt));
      const plainBuf = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToBuf(iv) as unknown as BufferSource },
        key,
        base64ToBuf(ciphertext) as unknown as BufferSource
      );
      setNoteText(new TextDecoder().decode(plainBuf));
      setUnlocked(true);
    } catch {
      setError('Incorrect passphrase or corrupted data.');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!passphrase) { setError('Set a passphrase first.'); return; }
    setBusy(true);
    setError('');
    try {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(passphrase, salt);
      const cipherBuf = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv as unknown as BufferSource },
        key,
        new TextEncoder().encode(noteText)
      );
      localStorage.setItem(SECURE_NOTES_KEY, JSON.stringify({
        salt: bufToBase64(salt), iv: bufToBase64(iv), ciphertext: bufToBase64(cipherBuf),
      }));
      setHasSavedNote(true);
    } finally {
      setBusy(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(SECURE_NOTES_KEY);
    setHasSavedNote(false);
    setNoteText('');
    setPassphrase('');
    setUnlocked(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-warning/5 border border-warning/20">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-warning leading-relaxed">
          This note is encrypted with AES-GCM (key derived via PBKDF2) and stored only in this browser's localStorage.
          Nothing is uploaded anywhere. <strong>If you lose your passphrase, the note cannot be recovered.</strong>
        </p>
      </div>

      {!unlocked ? (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary shrink-0" />
            <p className="section-label">{hasSavedNote ? 'Unlock Note' : 'Create Secure Note'}</p>
          </div>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="input-base font-mono"
            placeholder="Enter passphrase…"
          />
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <button onClick={handleUnlock} disabled={busy} className="btn-primary w-full justify-center py-2.5">
            <Unlock className="w-4 h-4" />
            {hasSavedNote ? 'Unlock' : 'Start'}
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary shrink-0" />
            <p className="section-label">Note Content</p>
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={8}
            className="textarea-base font-mono"
            placeholder="Write your secret note here…"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={busy} className="btn-primary flex-1 justify-center py-2.5">
              <Lock className="w-4 h-4" />
              Save & Encrypt
            </button>
            <button onClick={handleClear} className="btn-secondary py-2.5 px-4">
              Delete Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
