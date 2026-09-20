import { ToolSeoMap } from './types';
import { PDF_SEO_CONTENT } from './pdf';
import { WORD_EXCEL_ARCHIVE_COLOR_SEO_CONTENT } from './wordExcelArchiveColor';
import { IMAGE_SEO_CONTENT } from './image';
import { TEXT_DEV_SEO_CONTENT } from './textDev';
import { SECURITY_UTILITY_WEB_SEO_CONTENT } from './securityUtilityWeb';
import { DEV_PRO_SEO_CONTENT } from './devPro';
import { TOOL_DEEP_DIVES } from './deepDives';

const BASE_SEO_CONTENT: ToolSeoMap = {
  ...PDF_SEO_CONTENT,
  ...WORD_EXCEL_ARCHIVE_COLOR_SEO_CONTENT,
  ...IMAGE_SEO_CONTENT,
  ...TEXT_DEV_SEO_CONTENT,
  ...SECURITY_UTILITY_WEB_SEO_CONTENT,
  ...DEV_PRO_SEO_CONTENT,
};

/**
 * Deep dives are kept in their own file and attached here rather than being
 * written inline, because they exist for one reason — the tools with the least
 * interface — and grouping them keeps that set visible. A key with no matching
 * base entry is ignored rather than creating a half-populated tool.
 */
export const TOOL_SEO_CONTENT: ToolSeoMap = Object.fromEntries(
  Object.entries(BASE_SEO_CONTENT).map(([id, content]) => [
    id,
    TOOL_DEEP_DIVES[id] ? { ...content, deepDive: TOOL_DEEP_DIVES[id] } : content,
  ]),
);
