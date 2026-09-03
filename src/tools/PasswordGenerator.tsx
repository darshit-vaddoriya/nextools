import React, { useState, useEffect, useCallback } from 'react';
import { CopyButton } from '../components/CopyButton';
import { RefreshCw } from 'lucide-react';

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
  let strengthColor = 'text-danger';
  let strengthBg = 'bg-danger';
  let strengthPct = '25%';
  if (entropy > 50) { strengthLabel = 'Moderate'; strengthColor = 'text-warning'; strengthBg = 'bg-warning'; strengthPct = '50%'; }
  if (entropy > 75) { strengthLabel = 'Strong';   strengthColor = 'text-success'; strengthBg = 'bg-success'; strengthPct = '75%'; }
  if (entropy > 100) { strengthLabel = 'Very Strong'; strengthColor = 'text-primary'; strengthBg = 'bg-primary'; strengthPct = '100%'; }

  const options = [
    { label: 'Upper', checked: useUpper,   onChange: setUseUpper },
    { label: 'Lower', checked: useLower,   onChange: setUseLower },
    { label: 'Numbers', checked: useNumbers, onChange: setUseNumbers },
    { label: 'Symbols', checked: useSymbols, onChange: setUseSymbols },
  ];

  return (
    <div className="bg-card border border-border rounded-[18px] p-5 sm:p-[22px] space-y-5">
      {/* Password display */}
      <div className="flex items-center gap-3.5 px-5 py-5 rounded-[14px] bg-[var(--devpanel-bg)]">
        <span className="flex-1 font-mono text-lg sm:text-[22px] tracking-[0.03em] text-[color:var(--devpanel-text)] break-all">
          {password || '-'}
        </span>
        <CopyButton text={password} label="Copy" className="shrink-0" />
      </div>

      {/* Strength bar */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={`h-full ${strengthBg} rounded-full transition-all duration-500`} style={{ width: strengthPct }} />
        </div>
        <span className={`text-[12.5px] font-bold ${strengthColor}`}>{strengthLabel}</span>
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono -mt-2">
        <span>{entropy} bits of entropy</span>
        <span>{password.length} characters</span>
      </div>

      {/* Length */}
      <div className="flex items-center gap-3.5">
        <span className="text-[13px] font-bold text-muted-foreground shrink-0">Length</span>
        <input
          type="range" min={6} max={64} value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
          className="flex-1 accent-primary"
        />
        <span className="font-mono text-[13px] font-bold w-7 text-right">{length}</span>
      </div>

      {/* Charset toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {options.map(opt => (
          <button
            key={opt.label}
            type="button"
            onClick={() => opt.onChange(!opt.checked)}
            className={`px-2 py-2.5 rounded-[10px] border text-[13px] font-bold transition-all duration-150 ${
              opt.checked
                ? 'bg-[var(--devpanel-bg)] border-[var(--devpanel-bg)] text-white'
                : 'bg-card border-border text-muted-foreground hover:border-input'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        onClick={generatePassword}
        className="w-full py-3.5 rounded-[10px] bg-[var(--devpanel-bg)] hover:bg-primary text-white text-[14px] font-bold transition-colors duration-150 flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Generate new password
      </button>
    </div>
  );
};
