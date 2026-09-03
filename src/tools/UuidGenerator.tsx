import React, { useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { RefreshCw, KeyRound } from 'lucide-react';
import { Segmented, SegmentedButton } from '../components/DevToolChrome';

export const UuidGenerator: React.FC = () => {
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [uuids, setUuids] = useState<string[]>([]);

  const generateUuidv4 = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleGenerate = React.useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let u = generateUuidv4();
      if (!hyphens) u = u.replace(/-/g, '');
      if (uppercase) u = u.toUpperCase();
      list.push(u);
    }
    setUuids(list);
  }, [count, uppercase, hyphens]);

  React.useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  return (
    <div className="bg-card border border-border rounded-[18px] p-5 sm:p-[22px] space-y-5">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-2 text-xs flex-1 min-w-[180px]">
          <span className="text-muted-foreground font-bold">Quantity</span>
          <input
            type="range"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="flex-1 accent-primary"
          />
          <span className="font-mono text-[13px] font-bold w-8 text-right">{count}</span>
        </div>

        <Segmented>
          <SegmentedButton active={uppercase} onClick={() => setUppercase((v) => !v)}>UPPER</SegmentedButton>
          <SegmentedButton active={hyphens} onClick={() => setHyphens((v) => !v)}>Hyphens</SegmentedButton>
        </Segmented>

        <button onClick={handleGenerate} className="btn-primary text-[13.5px] py-2.5 px-5 rounded-[10px]">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Generate</span>
        </button>
      </div>

      {/* UUID List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <KeyRound className="w-3.5 h-3.5 text-primary" />
            <span>{uuids.length} UUIDs generated</span>
          </div>
          <CopyButton text={uuids.join('\n')} label="Copy all" />
        </div>
        <div className="space-y-2 max-h-[480px] overflow-y-auto">
          {uuids.map((id, index) => (
            <div
              key={index}
              className="px-4 py-3 bg-muted/40 border border-border hover:border-primary/40 rounded-[10px] flex items-center justify-between gap-3 group transition-all duration-150"
            >
              <span className="select-all font-mono text-[14px] truncate">{id}</span>
              <CopyButton text={id} label="Copy" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
