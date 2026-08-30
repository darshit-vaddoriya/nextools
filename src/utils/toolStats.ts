import { TOOLS } from '../config/tools';
import { ToolCategory, Tool } from '../types';

/** Tools that are actually usable right now (excludes "Coming Soon" placeholders). */
export const WORKING_TOOLS: Tool[] = TOOLS.filter(t => !t.isComingSoon);

/** Total count of working tools, optionally scoped to one category. */
export const workingToolCount = (category?: ToolCategory | 'all'): number => {
  if (!category || category === 'all') return WORKING_TOOLS.length;
  return WORKING_TOOLS.filter(t => t.category === category).length;
};
