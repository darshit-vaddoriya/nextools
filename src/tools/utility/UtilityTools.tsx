import React, { useEffect, useMemo, useState } from 'react';
import { CopyButton } from '../../components/CopyButton';
import { Select } from '../../components/Select';
import {
  Ruler, Clock, Timer, Cake, Percent, Activity, Landmark, Calculator, Receipt, BookType, Hash,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Unit Converter                                                      */
/* ------------------------------------------------------------------ */

type UnitCategory = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed';

const UNIT_FACTORS: Record<Exclude<UnitCategory, 'temperature'>, Record<string, number>> = {
  length: {
    Meters: 1, Kilometers: 1000, Centimeters: 0.01, Millimeters: 0.001,
    Miles: 1609.344, Yards: 0.9144, Feet: 0.3048, Inches: 0.0254, 'Nautical Miles': 1852,
  },
  weight: {
    Kilograms: 1, Grams: 0.001, Milligrams: 0.000001, 'Metric Tons': 1000,
    Pounds: 0.45359237, Ounces: 0.028349523125, Stone: 6.35029318,
  },
  area: {
    'Square Meters': 1, 'Square Kilometers': 1_000_000, 'Square Feet': 0.09290304,
    'Square Yards': 0.83612736, Acres: 4046.8564224, Hectares: 10000, 'Square Miles': 2_589_988.110336,
  },
  volume: {
    Liters: 1, Milliliters: 0.001, 'Cubic Meters': 1000, Gallons: 3.785411784,
    Quarts: 0.946352946, Pints: 0.473176473, 'Cups (US)': 0.2365882365, 'Fluid Ounces (US)': 0.0295735296875,
  },
  speed: {
    'Meters/sec': 1, 'Kilometers/hour': 0.277777778, 'Miles/hour': 0.44704, Knots: 0.514444444, 'Feet/sec': 0.3048,
  },
};

const TEMP_UNITS = ['Celsius', 'Fahrenheit', 'Kelvin'];

function convertTemperature(value: number, from: string, to: string): number {
  if (from === to) return value;
  let celsius: number;
  if (from === 'Celsius') celsius = value;
  else if (from === 'Fahrenheit') celsius = (value - 32) * (5 / 9);
  else celsius = value - 273.15;

  if (to === 'Celsius') return celsius;
  if (to === 'Fahrenheit') return celsius * (9 / 5) + 32;
  return celsius + 273.15;
}

export const UnitConverterTool: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const units = category === 'temperature' ? TEMP_UNITS : Object.keys(UNIT_FACTORS[category]);
  const [fromUnit, setFromUnit] = useState<string>(units[0]);
  const [toUnit, setToUnit] = useState<string>(units[1] ?? units[0]);
  const [fromValue, setFromValue] = useState<string>('1');

  useEffect(() => {
    const u = category === 'temperature' ? TEMP_UNITS : Object.keys(UNIT_FACTORS[category]);
    setFromUnit(u[0]);
    setToUnit(u[1] ?? u[0]);
  }, [category]);

  const result = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num)) return '';
    if (category === 'temperature') {
      return convertTemperature(num, fromUnit, toUnit).toFixed(4).replace(/\.?0+$/, '');
    }
    const factors = UNIT_FACTORS[category];
    if (!factors[fromUnit] || !factors[toUnit]) return '';
    const base = num * factors[fromUnit];
    const converted = base / factors[toUnit];
    return converted.toPrecision(10).replace(/\.?0+$/, '').replace(/\.?0+e/, 'e');
  }, [fromValue, fromUnit, toUnit, category]);

  const categories: { value: UnitCategory; label: string }[] = [
    { value: 'length', label: 'Length' },
    { value: 'weight', label: 'Weight' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'area', label: 'Area' },
    { value: 'volume', label: 'Volume' },
    { value: 'speed', label: 'Speed' },
  ];

  const unitOptions = units.map((u) => ({ value: u, label: u }));

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Category</p>
        </div>
        <Select
          value={category}
          options={categories}
          onChange={(v) => setCategory(v as UnitCategory)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
          <p className="section-label">From</p>
          <Select value={fromUnit} options={unitOptions} onChange={setFromUnit} />
          <input
            type="number"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            className="input-base font-mono"
            placeholder="Enter value"
          />
        </div>
        <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
          <p className="section-label">To</p>
          <Select value={toUnit} options={unitOptions} onChange={setToUnit} />
          <div className="bg-muted border border-border rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-primary break-all min-h-[42px] flex items-center justify-between gap-2">
            <span className="truncate">{result || '-'}</span>
            <CopyButton text={result} className="shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Timezone Converter                                                  */
/* ------------------------------------------------------------------ */

const COMMON_TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Africa/Cairo', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Bangkok', 'Asia/Shanghai',
  'Asia/Tokyo', 'Asia/Seoul', 'Australia/Sydney', 'Pacific/Auckland',
];

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const TimezoneConverterTool: React.FC = () => {
  const [dateTime, setDateTime] = useState<string>(toDatetimeLocalValue(new Date()));
  const [sourceTz, setSourceTz] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');

  // Interpret the entered local wall-clock time as if it were in sourceTz.
  const utcInstant = useMemo(() => {
    const [datePart, timePart] = dateTime.split('T');
    if (!datePart || !timePart) return null;
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm] = timePart.split(':').map(Number);

    // Find the UTC timestamp that, when formatted in sourceTz, matches the entered wall clock.
    let guess = Date.UTC(y, m - 1, d, hh, mm);
    for (let i = 0; i < 3; i++) {
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: sourceTz, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
      });
      const parts = fmt.formatToParts(new Date(guess));
      const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
      const observed = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') === 24 ? 0 : get('hour'), get('minute'));
      const diff = Date.UTC(y, m - 1, d, hh, mm) - observed;
      guess += diff;
    }
    return guess;
  }, [dateTime, sourceTz]);

  const tzOptions = COMMON_TIMEZONES.map((tz) => ({ value: tz, label: tz.replace('_', ' ') }));

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Source Date & Time</p>
        </div>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="input-base font-mono"
        />
        <p className="section-label">Source Timezone</p>
        <Select value={sourceTz} options={tzOptions} onChange={setSourceTz} />
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-2">
        <p className="section-label">Equivalent Times</p>
        <div className="space-y-1.5">
          {utcInstant === null ? (
            <p className="text-sm text-muted-foreground">Enter a valid date/time.</p>
          ) : (
            COMMON_TIMEZONES.map((tz) => {
              const formatted = new Intl.DateTimeFormat('en-US', {
                timeZone: tz, dateStyle: 'medium', timeStyle: 'short',
              }).format(new Date(utcInstant));
              return (
                <div key={tz} className="flex items-center justify-between gap-3 bg-muted border border-border rounded-lg px-3 py-2 text-sm">
                  <span className="text-muted-foreground font-medium truncate">{tz.replace('_', ' ')}</span>
                  <span className="font-mono font-semibold text-foreground shrink-0">{formatted}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Timestamp Converter                                                 */
/* ------------------------------------------------------------------ */

export const TimestampConverterTool: React.FC = () => {
  const [unit, setUnit] = useState<'seconds' | 'milliseconds'>('seconds');
  const [timestamp, setTimestamp] = useState<string>(String(Math.floor(Date.now() / 1000)));
  const [humanDate, setHumanDate] = useState<string>(toDatetimeLocalValue(new Date()));

  const dateFromTimestamp = useMemo(() => {
    const num = Number(timestamp);
    if (isNaN(num)) return null;
    const ms = unit === 'seconds' ? num * 1000 : num;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }, [timestamp, unit]);

  const timestampFromDate = useMemo(() => {
    const d = new Date(humanDate);
    if (isNaN(d.getTime())) return '';
    return unit === 'seconds' ? String(Math.floor(d.getTime() / 1000)) : String(d.getTime());
  }, [humanDate, unit]);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary shrink-0" />
            <p className="section-label">Unit</p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setUnit('seconds')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${unit === 'seconds' ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}
            >Seconds</button>
            <button
              onClick={() => setUnit('milliseconds')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${unit === 'milliseconds' ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}
            >Milliseconds</button>
          </div>
        </div>
        <button
          onClick={() => {
            const now = Date.now();
            setTimestamp(unit === 'seconds' ? String(Math.floor(now / 1000)) : String(now));
            setHumanDate(toDatetimeLocalValue(new Date(now)));
          }}
          className="btn-secondary w-full justify-center py-2"
        >
          Use Current Time
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
          <p className="section-label">Unix Timestamp</p>
          <input
            type="text"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="input-base font-mono"
          />
          <div className="bg-muted border border-border rounded-lg px-3 py-2.5 text-sm font-mono font-semibold text-foreground break-all">
            {dateFromTimestamp ? dateFromTimestamp.toString() : 'Invalid timestamp'}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
          <p className="section-label">Human Readable Date</p>
          <input
            type="datetime-local"
            value={humanDate}
            onChange={(e) => setHumanDate(e.target.value)}
            className="input-base font-mono"
          />
          <div className="bg-muted border border-border rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-primary flex items-center justify-between gap-2">
            <span className="truncate">{timestampFromDate || '-'}</span>
            <CopyButton text={timestampFromDate} className="shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Age Calculator                                                      */
/* ------------------------------------------------------------------ */

export const AgeCalculatorTool: React.FC = () => {
  const [birthDate, setBirthDate] = useState<string>('');

  const age = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const now = new Date();
    if (isNaN(birth.getTime()) || birth > now) return null;

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalMs = now.getTime() - birth.getTime();
    const totalDays = Math.floor(totalMs / 86_400_000);
    const totalHours = Math.floor(totalMs / 3_600_000);

    return { years, months, days, totalDays, totalHours };
  }, [birthDate]);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Cake className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Date of Birth</p>
        </div>
        <input
          type="date"
          value={birthDate}
          max={toDatetimeLocalValue(new Date()).split('T')[0]}
          onChange={(e) => setBirthDate(e.target.value)}
          className="input-base font-mono"
        />
      </div>

      {age && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 text-center space-y-1">
            <p className="text-2xl font-extrabold text-primary">{age.years}</p>
            <p className="text-xs text-muted-foreground font-medium">Years</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center space-y-1">
            <p className="text-2xl font-extrabold text-primary">{age.months}</p>
            <p className="text-xs text-muted-foreground font-medium">Months</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center space-y-1">
            <p className="text-2xl font-extrabold text-primary">{age.days}</p>
            <p className="text-xs text-muted-foreground font-medium">Days</p>
          </div>
          <div className="bg-muted border border-border rounded-xl p-3.5 flex items-center justify-between sm:col-span-3">
            <span className="text-sm text-muted-foreground font-medium">Total Days Lived</span>
            <span className="font-mono font-bold text-foreground">{age.totalDays.toLocaleString()}</span>
          </div>
          <div className="bg-muted border border-border rounded-xl p-3.5 flex items-center justify-between sm:col-span-3">
            <span className="text-sm text-muted-foreground font-medium">Total Hours Lived</span>
            <span className="font-mono font-bold text-foreground">{age.totalHours.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Percentage Calculator                                               */
/* ------------------------------------------------------------------ */

export const PercentageCalcTool: React.FC = () => {
  const [x1, setX1] = useState('10');
  const [y1, setY1] = useState('100');

  const [x2, setX2] = useState('25');
  const [y2, setY2] = useState('200');

  const [x3, setX3] = useState('100');
  const [y3, setY3] = useState('150');

  const res1 = useMemo(() => {
    const a = parseFloat(x1), b = parseFloat(y1);
    return isNaN(a) || isNaN(b) ? '' : ((a / 100) * b).toFixed(4).replace(/\.?0+$/, '');
  }, [x1, y1]);

  const res2 = useMemo(() => {
    const a = parseFloat(x2), b = parseFloat(y2);
    return isNaN(a) || isNaN(b) || b === 0 ? '' : ((a / b) * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
  }, [x2, y2]);

  const res3 = useMemo(() => {
    const a = parseFloat(x3), b = parseFloat(y3);
    if (isNaN(a) || isNaN(b) || a === 0) return '';
    const change = ((b - a) / a) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(4).replace(/\.?0+$/, '')}%`;
  }, [x3, y3]);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">X% of Y</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">What is</span>
          <input value={x1} onChange={(e) => setX1(e.target.value)} type="number" className="input-base w-24 font-mono" />
          <span className="text-muted-foreground">% of</span>
          <input value={y1} onChange={(e) => setY1(e.target.value)} type="number" className="input-base w-28 font-mono" />
          <span className="text-muted-foreground">?</span>
        </div>
        <div className="bg-muted border border-border rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-primary flex items-center justify-between">
          <span>{res1 || '-'}</span>
          <CopyButton text={res1} />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <p className="section-label">X is what % of Y</p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input value={x2} onChange={(e) => setX2(e.target.value)} type="number" className="input-base w-24 font-mono" />
          <span className="text-muted-foreground">is what % of</span>
          <input value={y2} onChange={(e) => setY2(e.target.value)} type="number" className="input-base w-28 font-mono" />
          <span className="text-muted-foreground">?</span>
        </div>
        <div className="bg-muted border border-border rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-primary flex items-center justify-between">
          <span>{res2 || '-'}</span>
          <CopyButton text={res2} />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <p className="section-label">Percentage Change</p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">From</span>
          <input value={x3} onChange={(e) => setX3(e.target.value)} type="number" className="input-base w-24 font-mono" />
          <span className="text-muted-foreground">to</span>
          <input value={y3} onChange={(e) => setY3(e.target.value)} type="number" className="input-base w-28 font-mono" />
        </div>
        <div className="bg-muted border border-border rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-primary flex items-center justify-between">
          <span>{res3 || '-'}</span>
          <CopyButton text={res3} />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* BMI Calculator                                                      */
/* ------------------------------------------------------------------ */

export const BmiCalculatorTool: React.FC = () => {
  const [isMetric, setIsMetric] = useState(true);
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('65');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('7');
  const [weightLb, setWeightLb] = useState('143');

  const bmi = useMemo(() => {
    let hM: number, wKg: number;
    if (isMetric) {
      hM = parseFloat(heightCm) / 100;
      wKg = parseFloat(weightKg);
    } else {
      const totalInches = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
      hM = totalInches * 0.0254;
      wKg = (parseFloat(weightLb) || 0) * 0.45359237;
    }
    if (!hM || !wKg || hM <= 0) return null;
    return wKg / (hM * hM);
  }, [isMetric, heightCm, weightKg, heightFt, heightIn, weightLb]);

  const category = useMemo(() => {
    if (bmi === null) return { label: '-', color: 'text-muted-foreground', markerBorder: 'border-t-muted-foreground' };
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-cyan-500', markerBorder: 'border-t-cyan-500' };
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-500', markerBorder: 'border-t-emerald-500' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-500', markerBorder: 'border-t-amber-500' };
    return { label: 'Obese', color: 'text-rose-500', markerBorder: 'border-t-rose-500' };
  }, [bmi]);

  const BMI_SCALE_MIN = 10;
  const BMI_SCALE_MAX = 40;
  const markerPct = bmi === null
    ? null
    : Math.min(100, Math.max(0, ((bmi - BMI_SCALE_MIN) / (BMI_SCALE_MAX - BMI_SCALE_MIN)) * 100));

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary shrink-0" />
            <p className="section-label">Units</p>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setIsMetric(true)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${isMetric ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>Metric</button>
            <button onClick={() => setIsMetric(false)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${!isMetric ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>Imperial</button>
          </div>
        </div>

        {isMetric ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">Height (cm)</p>
              <input value={heightCm} onChange={(e) => setHeightCm(e.target.value)} type="number" className="input-base font-mono" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">Weight (kg)</p>
              <input value={weightKg} onChange={(e) => setWeightKg(e.target.value)} type="number" className="input-base font-mono" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">Feet</p>
              <input value={heightFt} onChange={(e) => setHeightFt(e.target.value)} type="number" className="input-base font-mono" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">Inches</p>
              <input value={heightIn} onChange={(e) => setHeightIn(e.target.value)} type="number" className="input-base font-mono" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">Weight (lb)</p>
              <input value={weightLb} onChange={(e) => setWeightLb(e.target.value)} type="number" className="input-base font-mono" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border p-5 text-center space-y-1">
        <p className="text-3xl font-extrabold text-primary">{bmi ? bmi.toFixed(1) : '-'}</p>
        <p className={`text-sm font-bold ${category.color}`}>{category.label}</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <p className="section-label">Where you fall on the scale</p>
        <div className="relative pt-5">
          {markerPct !== null && (
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
              style={{ left: `${markerPct}%` }}
            >
              <span className={`text-[10px] font-bold font-mono ${category.color}`}>{bmi!.toFixed(1)}</span>
              <div className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${category.markerBorder}`} />
            </div>
          )}
          <div className="flex h-2.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500" style={{ width: `${((18.5 - BMI_SCALE_MIN) / (BMI_SCALE_MAX - BMI_SCALE_MIN)) * 100}%` }} />
            <div className="bg-emerald-500" style={{ width: `${((25 - 18.5) / (BMI_SCALE_MAX - BMI_SCALE_MIN)) * 100}%` }} />
            <div className="bg-amber-500" style={{ width: `${((30 - 25) / (BMI_SCALE_MAX - BMI_SCALE_MIN)) * 100}%` }} />
            <div className="bg-rose-500" style={{ width: `${((BMI_SCALE_MAX - 30) / (BMI_SCALE_MAX - BMI_SCALE_MIN)) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground font-mono">
            <span>{BMI_SCALE_MIN}</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>{BMI_SCALE_MAX}+</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-2.5 flex-wrap text-[9.5px] font-medium">
            <span className="inline-flex items-center gap-1 text-cyan-500"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Underweight</span>
            <span className="inline-flex items-center gap-1 text-emerald-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Normal</span>
            <span className="inline-flex items-center gap-1 text-amber-500"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Overweight</span>
            <span className="inline-flex items-center gap-1 text-rose-500"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Obese</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* EMI Calculator                                                      */
/* ------------------------------------------------------------------ */

export const EmiCalculatorTool: React.FC = () => {
  const [principal, setPrincipal] = useState('500000');
  const [rate, setRate] = useState('9.5');
  const [tenureUnit, setTenureUnit] = useState<'months' | 'years'>('years');
  const [tenure, setTenure] = useState('5');

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const annualRate = parseFloat(rate);
    const t = parseFloat(tenure);
    if (!p || !annualRate || !t) return null;
    const n = tenureUnit === 'years' ? t * 12 : t;
    const monthlyRate = annualRate / 12 / 100;
    const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;
    return { emi, totalPayment, totalInterest };
  }, [principal, rate, tenure, tenureUnit]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Loan Details</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Principal Amount</p>
            <input value={principal} onChange={(e) => setPrincipal(e.target.value)} type="number" className="input-base font-mono" />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Annual Interest Rate (%)</p>
            <input value={rate} onChange={(e) => setRate(e.target.value)} type="number" className="input-base font-mono" />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Tenure</p>
            <div className="flex gap-1.5">
              <input value={tenure} onChange={(e) => setTenure(e.target.value)} type="number" className="input-base font-mono flex-1" />
              <Select
                value={tenureUnit}
                options={[{ value: 'years', label: 'Years' }, { value: 'months', label: 'Months' }]}
                onChange={(v) => setTenureUnit(v as 'months' | 'years')}
                className="w-28"
              />
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 text-center space-y-1">
            <p className="text-xl font-extrabold text-primary">{fmt(result.emi)}</p>
            <p className="text-xs text-muted-foreground font-medium">Monthly EMI</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center space-y-1">
            <p className="text-xl font-extrabold text-foreground">{fmt(result.totalInterest)}</p>
            <p className="text-xs text-muted-foreground font-medium">Total Interest</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center space-y-1">
            <p className="text-xl font-extrabold text-foreground">{fmt(result.totalPayment)}</p>
            <p className="text-xs text-muted-foreground font-medium">Total Payment</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scientific Calculator                                               */
/* ------------------------------------------------------------------ */

export const ScientificCalculatorTool: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [stored, setStored] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [memory, setMemory] = useState(0);
  const [overwrite, setOverwrite] = useState(true);

  const inputDigit = (d: string) => {
    setDisplay((prev) => {
      if (overwrite) return d === '.' ? '0.' : d;
      if (d === '.' && prev.includes('.')) return prev;
      return prev === '0' && d !== '.' ? d : prev + d;
    });
    setOverwrite(false);
  };

  const applyBinaryOp = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
      case '^': return Math.pow(a, b);
      default: return b;
    }
  };

  const handleOp = (op: string) => {
    const current = parseFloat(display);
    if (stored !== null && pendingOp) {
      const result = applyBinaryOp(stored, current, pendingOp);
      setStored(result);
      setDisplay(String(result));
    } else {
      setStored(current);
    }
    setPendingOp(op);
    setOverwrite(true);
  };

  const handleEquals = () => {
    if (stored !== null && pendingOp) {
      const current = parseFloat(display);
      const result = applyBinaryOp(stored, current, pendingOp);
      setDisplay(String(result));
      setStored(null);
      setPendingOp(null);
      setOverwrite(true);
    }
  };

  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n > 170) return Infinity;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  };

  const handleUnary = (fn: (n: number) => number) => {
    const current = parseFloat(display);
    setDisplay(String(fn(current)));
    setOverwrite(true);
  };

  const clear = () => { setDisplay('0'); setStored(null); setPendingOp(null); setOverwrite(true); };

  const buttons: { label: string; onClick: () => void; className?: string }[] = [
    { label: 'MC', onClick: () => setMemory(0) },
    { label: 'MR', onClick: () => { setDisplay(String(memory)); setOverwrite(true); } },
    { label: 'M+', onClick: () => setMemory((m) => m + parseFloat(display)) },
    { label: 'M-', onClick: () => setMemory((m) => m - parseFloat(display)) },
    { label: 'sin', onClick: () => handleUnary((n) => Math.sin(n)) },
    { label: 'cos', onClick: () => handleUnary((n) => Math.cos(n)) },
    { label: 'tan', onClick: () => handleUnary((n) => Math.tan(n)) },
    { label: 'C', onClick: clear, className: 'text-rose-500' },
    { label: 'log', onClick: () => handleUnary((n) => Math.log10(n)) },
    { label: 'ln', onClick: () => handleUnary((n) => Math.log(n)) },
    { label: '√', onClick: () => handleUnary((n) => Math.sqrt(n)) },
    { label: '÷', onClick: () => handleOp('/'), className: 'text-primary' },
    { label: '7', onClick: () => inputDigit('7') },
    { label: '8', onClick: () => inputDigit('8') },
    { label: '9', onClick: () => inputDigit('9') },
    { label: '×', onClick: () => handleOp('*'), className: 'text-primary' },
    { label: '4', onClick: () => inputDigit('4') },
    { label: '5', onClick: () => inputDigit('5') },
    { label: '6', onClick: () => inputDigit('6') },
    { label: '−', onClick: () => handleOp('-'), className: 'text-primary' },
    { label: '1', onClick: () => inputDigit('1') },
    { label: '2', onClick: () => inputDigit('2') },
    { label: '3', onClick: () => inputDigit('3') },
    { label: '+', onClick: () => handleOp('+'), className: 'text-primary' },
    { label: 'x!', onClick: () => handleUnary(factorial) },
    { label: '0', onClick: () => inputDigit('0') },
    { label: '.', onClick: () => inputDigit('.') },
    { label: 'xʸ', onClick: () => handleOp('^') },
    { label: '=', onClick: handleEquals, className: 'bg-primary text-primary-foreground' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Scientific Calculator</p>
        </div>
        <div className="bg-muted border border-border rounded-xl px-4 py-4 text-right">
          <p className="text-[10px] text-muted-foreground font-mono">{memory !== 0 ? `M: ${memory}` : ''}</p>
          <p className="text-3xl font-mono font-bold text-foreground break-all">{display}</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {buttons.map((b, i) => (
            <button
              key={i}
              onClick={b.onClick}
              className={`py-3 rounded-lg text-sm font-semibold bg-muted border border-border hover:border-primary/50 transition-colors ${b.className ?? 'text-foreground'}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* GST Calculator                                                      */
/* ------------------------------------------------------------------ */

export const GstCalculatorTool: React.FC = () => {
  const [amount, setAmount] = useState('1000');
  const [rate, setRate] = useState('18');
  const [mode, setMode] = useState<'exclusive' | 'inclusive'>('exclusive');

  const result = useMemo(() => {
    const amt = parseFloat(amount);
    const r = parseFloat(rate);
    if (isNaN(amt) || isNaN(r)) return null;
    if (mode === 'exclusive') {
      const gst = (amt * r) / 100;
      return { base: amt, gst, total: amt + gst };
    } else {
      const base = amt / (1 + r / 100);
      const gst = amt - base;
      return { base, gst, total: amt };
    }
  }, [amount, rate, mode]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">GST Details</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setMode('exclusive')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${mode === 'exclusive' ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>Add GST</button>
          <button onClick={() => setMode('inclusive')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${mode === 'inclusive' ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>Remove GST</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Amount</p>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="input-base font-mono" />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">GST Rate</p>
            <Select
              value={rate}
              options={['5', '12', '18', '28'].map((v) => ({ value: v, label: `${v}%` }))}
              onChange={setRate}
            />
          </div>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 text-center space-y-1">
            <p className="text-lg font-extrabold text-foreground">{fmt(result.base)}</p>
            <p className="text-xs text-muted-foreground font-medium">Base Amount</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center space-y-1">
            <p className="text-lg font-extrabold text-primary">{fmt(result.gst)}</p>
            <p className="text-xs text-muted-foreground font-medium">GST Amount</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center space-y-1">
            <p className="text-lg font-extrabold text-emerald-500">{fmt(result.total)}</p>
            <p className="text-xs text-muted-foreground font-medium">Total Amount</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Number to Words                                                     */
/* ------------------------------------------------------------------ */

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const SCALES = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

function threeDigitsToWords(n: number): string {
  let str = '';
  if (n >= 100) {
    str += `${ONES[Math.floor(n / 100)]} Hundred`;
    n %= 100;
    if (n > 0) str += ' ';
  }
  if (n >= 20) {
    str += TENS[Math.floor(n / 10)];
    if (n % 10 > 0) str += `-${ONES[n % 10]}`;
  } else if (n > 0) {
    str += ONES[n];
  }
  return str;
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const negative = num < 0;
  num = Math.abs(Math.trunc(num));

  const groups: number[] = [];
  while (num > 0) {
    groups.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const words = threeDigitsToWords(groups[i]);
    parts.push(SCALES[i] ? `${words} ${SCALES[i]}` : words);
  }

  return (negative ? 'Negative ' : '') + parts.join(' ');
}

export const NumberToWordsTool: React.FC = () => {
  const [input, setInput] = useState('12345');

  const words = useMemo(() => {
    const num = Number(input);
    if (input.trim() === '' || isNaN(num) || !Number.isFinite(num)) return '';
    if (Math.abs(num) >= 1e15) return 'Number too large';
    return numberToWords(num);
  }, [input]);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BookType className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Enter a Number</p>
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          inputMode="numeric"
          className="input-base font-mono text-lg"
          placeholder="e.g. 12345"
        />
      </div>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2">
        <p className="section-label">In Words</p>
        <div className="bg-muted border border-border rounded-lg px-3 py-3 text-sm font-semibold text-foreground flex items-start justify-between gap-3">
          <span className="leading-relaxed">{words || '-'}</span>
          <CopyButton text={words} className="shrink-0" />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Roman Numerals                                                      */
/* ------------------------------------------------------------------ */

const ROMAN_MAP: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

function toRoman(num: number): string {
  if (num <= 0 || num > 3999 || !Number.isInteger(num)) return '';
  let result = '';
  let n = num;
  for (const [value, symbol] of ROMAN_MAP) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result;
}

function fromRoman(str: string): number | null {
  const cleaned = str.trim().toUpperCase();
  if (!cleaned || !/^[MDCLXVI]+$/.test(cleaned)) return null;
  const values: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < cleaned.length; i++) {
    const current = values[cleaned[i]];
    const next = values[cleaned[i + 1]];
    if (next && current < next) total -= current;
    else total += current;
  }
  // Validate round-trip to catch invalid forms like "IIII" or "VV"
  if (toRoman(total) !== cleaned) return null;
  return total;
}

export const RomanNumeralsTool: React.FC = () => {
  const [numberInput, setNumberInput] = useState('1994');
  const [romanInput, setRomanInput] = useState('MCMXCIV');

  const romanResult = useMemo(() => {
    const n = Number(numberInput);
    if (numberInput.trim() === '' || isNaN(n)) return '';
    const r = toRoman(n);
    return r || 'Must be an integer between 1 and 3999';
  }, [numberInput]);

  const numberResult = useMemo(() => {
    if (romanInput.trim() === '') return '';
    const n = fromRoman(romanInput);
    return n === null ? 'Invalid Roman numeral' : String(n);
  }, [romanInput]);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Number to Roman</p>
        </div>
        <input
          value={numberInput}
          onChange={(e) => setNumberInput(e.target.value)}
          type="number"
          className="input-base font-mono"
          placeholder="1-3999"
        />
        <div className="bg-muted border border-border rounded-lg px-3 py-2.5 text-lg font-mono font-bold text-primary flex items-center justify-between gap-2">
          <span className="truncate">{romanResult || '-'}</span>
          <CopyButton text={romanResult} className="shrink-0" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <p className="section-label">Roman to Number</p>
        <input
          value={romanInput}
          onChange={(e) => setRomanInput(e.target.value)}
          type="text"
          className="input-base font-mono uppercase"
          placeholder="e.g. MCMXCIV"
        />
        <div className="bg-muted border border-border rounded-lg px-3 py-2.5 text-lg font-mono font-bold text-primary flex items-center justify-between gap-2">
          <span className="truncate">{numberResult || '-'}</span>
          <CopyButton text={numberResult} className="shrink-0" />
        </div>
      </div>
    </div>
  );
};
