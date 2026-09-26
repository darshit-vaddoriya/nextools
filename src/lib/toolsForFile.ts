/**
 * Which tools can open a given file, best first.
 *
 * Shared by the homepage drop zone ("what can I do with this?") and the
 * "keep going" row after a conversion, so both answer the question the same
 * way. Converters are matched by exact input format (a PNG gets "PNG to JPG",
 * not "HEIC to JPG"); every other category says per tool what it opens in
 * categoryHubs.
 */
import { TOOLS } from '../config/tools';
import { CATEGORY_HUBS, toolAccepts } from '../config/categoryHubs';
import { CONVERTER_TOOLS, converterToolsAccepting, detectFormat } from '../config/converters';
import { KIND_TO_CATEGORIES, extensionOf, formatOf } from './formats';
import type { Tool } from '../types';

export function toolsForFile(file: { name: string; type?: string }, exclude?: string): Tool[] {
  const { kind } = formatOf(file.name);
  const categories = KIND_TO_CATEGORIES[kind];
  const ext = extensionOf(file.name);
  const converters = new Set(converterToolsAccepting(file));

  const opens = (t: Tool) => {
    if (t.isComingSoon || t.id === exclude) return false;
    if (t.category === 'convert') return converters.has(t.id);
    const hub = CATEGORY_HUBS[t.category];
    return hub ? toolAccepts(hub, t.id, kind, ext) : categories.includes(t.category);
  };

  // The everyday tools for this kind of file lead (compress, remove the
  // background), then converters built for this exact format, then the rest.
  const format = detectFormat(file);
  const rank = (t: Tool) => {
    if (t.category !== 'convert') return t.isPopular ? 0 : 2;
    if (CONVERTER_TOOLS[t.id].inputs[0] === format && t.id !== 'file-converter') return 1;
    return t.id === 'file-converter' ? 3 : 4;
  };

  return TOOLS
    .filter(opens)
    .sort((a, b) => rank(a) - rank(b) || Number(Boolean(b.isPopular)) - Number(Boolean(a.isPopular)));
}
