import React, { useState, useEffect, useCallback } from 'react';
import { CopyButton } from '../components/CopyButton';
import { Lock, RefreshCw, ShieldCheck } from 'lucide-react';

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState<number>(18);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');

  const generatePassword = useCallback(() => {
    const sets: string[] = [];
    if (useUpper) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (useLower) sets.push('abcdefghijklmnopqrstuvwxyz');
    if (useNumbers) sets.push('0123456789');
    if (useSymbols) sets.push('!@#$%^&*()_+-=[]{}|;:,.<>?');
    if (!sets.length) { setPassword(''); return; }
    const chars = sets.join('');

    const randomValues = new Uint32Array(length * 2);
    window.crypto.getRandomValues(randomValues);
    const arr: string[] = [];
    for (let i = 0; i < length; i++) {
      if (i < sets.length) {
        arr.push(sets[i][randomValues[i] % sets[i].length]);
      } else {
        arr.push(chars[randomValues[i] % chars.length]);
      }
    }
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randomValues[length + i] % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setPassword(arr.join(''));
  }, [length, useUpper, useLower, useNumbers, useSymbols]);

  useEffect(() => { generatePassword(); }, [generatePassword]);

  const calculateEntropy = (): number => {
    let poolSize = 0;
    if (useUpper) poolSize += 26;
    if (useLower) poolSize += 26;
    if (useNumbers) poolSize += 10;
    if (useSymbols) poolSize += 32;
    if (poolSize === 0) return 0;
    return Math.floor(length * Math.log2(poolSize));
  };

  const entropy = calculateEntropy();
  let strengthLabel = 'Weak';
  let strengthColor = 'text-rose-500';
  let strengthBg = 'bg-rose-500';
  let strengthWidth = 'w-1/4';
  if (entropy > 50) { strengthLabel = 'Moderate'; strengthColor = 'text-amber-500'; strengthBg = 'bg-amber-500'; strengthWidth = 'w-2/4'; }
  if (entropy > 75) { strengthLabel = 'Strong';   strengthColor = 'text-emerald-500'; strengthBg = 'bg-emerald-500'; strengthWidth = 'w-3/4'; }
  if (entropy > 100) { strengthLabel = 'Very Strong'; strengthColor = 'text-cyan-500'; strengthBg = 'bg-cyan-500'; strengthWidth = 'w-full'; }

  const options = [
    { label: 'ABC - Uppercase', checked: useUpper,   onChange: setUseUpper },
    { label: 'abc - Lowercase', checked: useLower,   onChange: setUseLower },
    { label: '123 - Numbers',   checked: useNumbers, onChange: setUseNumbers },
    { label: '!@# - Symbols',   checked: useSymbols, onChange: setUseSymbols },
  ];

  return (
    <div className="space-y-4">
      {/* Result Display */}
      <div className="dark:bg-dark-card bg-white rounded-xl border dark:border-dark-border border-slate-200 p-5 space-y-4">
        {/* Strength bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 dark:text-zinc-400 text-slate-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              Strength:
              <strong className={`font-bold ${strengthColor}`}>{strengthLabel}</strong>
            </span>
            <span className="dark:text-zinc-500 text-slate-500 font-mono">{entropy} bits</span>
          </div>
          <div className="h-1.5 dark:bg-dark-bg bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${strengthBg} ${strengthWidth} rounded-full transition-all duration-500`} />
          </div>
        </div>

        {/* Password display */}
        <div className="dark:bg-dark-bg bg-slate-50 border dark:border-dark-border border-slate-200 rounded-xl px-4 py-3.5 font-mono text-lg text-emerald-500 dark:text-emerald-400 font-bold tracking-widest break-all select-all flex items-center justify-between gap-4">
          <span className="truncate">{password || '-'}</span>
          <CopyButton text={password} label="Copy" className="shrink-0" />
        </div>

        <div className="flex items-center justify-between text-[11px] dark:text-zinc-600 text-slate-400 font-mono">
          <span>{password.length} characters</span>
        </div>

        <button onClick={generatePassword} className="btn-primary w-full justify-center py-2.5">
          <RefreshCw className="w-4 h-4" />
          Generate New Password
        </button>
      </div>

      {/* Controls */}
      <div className="dark:bg-dark-card bg-white rounded-xl border dark:border-dark-border border-slate-200 p-5 space-y-5">
        <p className="section-label">Configuration</p>

        {/* Length */}
        <div className="space-y-2.5">
          <div className="flex justify-between text-xs">
            <span className="dark:text-zinc-400 text-slate-600 font-medium">Length</span>
            <span className="font-mono font-bold text-indigo-500">{length} characters</span>
          </div>
          <input
            type="range" min={6} max={64} value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-1.5 dark:bg-dark-bg bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] dark:text-zinc-700 text-slate-400 font-mono">
            <span>6</span><span>64</span>
          </div>
        </div>

        {/* Charset options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {options.map(opt => (
            <label
              key={opt.label}
              className={`p-3 rounded-xl border cursor-pointer select-none transition-all duration-150 flex items-center gap-2 text-xs font-medium ${
                opt.checked
                  ? 'dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-300 bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'dark:bg-dark-bg dark:border-dark-border dark:text-zinc-500 dark:hover:border-zinc-600 bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={opt.checked}
                onChange={(e) => opt.onChange(e.target.checked)}
                className="rounded text-indigo-500 focus:ring-0 focus:ring-offset-0 dark:bg-dark-card border-current"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
