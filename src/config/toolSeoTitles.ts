/**
 * Search-result titles for tools whose generic "<Name> Online - Free, No
 * Upload" title does not match how people search for them. Each one names the
 * formats or the job in the words Search Console shows people using, and
 * claims only what the tool does. The on-page H1 stays the tool's name.
 * Keep each under 60 characters, where results pages cut titles off.
 */
export const TOOL_SEO_TITLES: Record<string, string> = {
  'file-converter': 'Free File Converter: 25+ Formats, No Upload | NextTool',
  'video-converter': 'Video Converter: MP4, WebM, MOV, MKV, Free | NextTool',
  'webp-to-jpg': 'WebP to JPG (JPEG) Converter, Free, No Upload | NextTool',
  'pdf-compare': 'Compare Two PDFs and Highlight Differences | NextTool',
  'svg-to-pdf': 'SVG to PDF Converter, Vector Output, Free | NextTool',
  'rtf-to-docx': 'RTF to DOCX (Word) Converter, Free, No Upload | NextTool',
  'psd-to-png': 'PSD to PNG Without Photoshop, Free | NextTool',
  'mov-to-mp4': 'MOV to MP4 Converter, Free, No Upload | NextTool',
};
