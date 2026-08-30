import React, { useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { RefreshCw, KeyRound } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-4  bg-card rounded-xl border  border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2 text-xs">
            <span className=" text-muted-foreground font-medium">Quantity:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-16    bg-muted border-border text-foreground border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-center"
            />
          </div>

          <label className="flex items-center gap-1.5 text-xs  text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded   border-border text-primary focus:ring-0 focus:ring-offset-0"
            />
            <span>Uppercase</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs  text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="rounded   border-border text-primary focus:ring-0 focus:ring-offset-0"
            />
            <span>Include Hyphens</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleGenerate} className="btn-primary text-xs py-1.5 px-3">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New</span>
          </button>
          <CopyButton text={uuids.join('\n')} label="Copy All" />
        </div>
      </div>

      {/* UUID List */}
      <div className=" bg-card rounded-xl border  border-border overflow-hidden">
        <div className="px-4 py-2.5  bg-muted border-b  border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold  text-muted-foreground">
            <KeyRound className="w-3.5 h-3.5 text-primary" />
            <span>{uuids.length} UUIDs Generated</span>
          </div>
        </div>
        <div className="p-3 space-y-2 max-h-[480px] overflow-y-auto">
          {uuids.map((id, index) => (
            <div
              key={index}
              className="px-3 py-2.5   bg-muted border-border hover:border-primary/40 border rounded-xl flex items-center justify-between gap-3 group transition-all duration-150"
            >
              <span className="text-emerald-500  select-all font-mono text-[12.5px] font-semibold truncate">
                {id}
              </span>
              <CopyButton text={id} label="Copy" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
