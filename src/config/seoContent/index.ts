import { ToolSeoMap } from './types';
import { PDF_SEO_CONTENT } from './pdf';
import { WORD_EXCEL_ARCHIVE_COLOR_SEO_CONTENT } from './wordExcelArchiveColor';
import { IMAGE_SEO_CONTENT } from './image';
import { TEXT_DEV_SEO_CONTENT } from './textDev';
import { SECURITY_UTILITY_WEB_SEO_CONTENT } from './securityUtilityWeb';

export const TOOL_SEO_CONTENT: ToolSeoMap = {
  ...PDF_SEO_CONTENT,
  ...WORD_EXCEL_ARCHIVE_COLOR_SEO_CONTENT,
  ...IMAGE_SEO_CONTENT,
  ...TEXT_DEV_SEO_CONTENT,
  ...SECURITY_UTILITY_WEB_SEO_CONTENT,
};
