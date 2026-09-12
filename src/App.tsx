import React, { useState, useEffect, useCallback } from 'react';
import { Header }          from './components/Header';
import { CommandPalette }  from './components/CommandPalette';
import { AdBanner }        from './components/AdBanner';
import { Footer }          from './components/Footer';
import { AllToolsView }    from './components/AllToolsView';
import { Hero }            from './components/home/Hero';
import { ToolGrid }        from './components/home/ToolGrid';
import { PdfMergeFlow }    from './tools/pdf/PdfMergeFlow';
import { MyFiles }         from './pages/MyFiles';
import { Settings }        from './pages/Settings';
import { StaticPageView }  from './pages/StaticPageView';
import { Blog }            from './pages/Blog';
import { BlogPostView }    from './pages/BlogPostView';
import { getPost }         from './config/blog';
import { StaticPageId }    from './config/pages';
import { ToolCategory }    from './types';
import { TOOLS }           from './config/tools';
import { PLANNED_FEATURES } from './config/toolFeatures';
import { TOOL_EXPLANATIONS } from './config/toolExplanations';
import { TOOL_SEO_CONTENT } from './config/seoContent';
import { HOME_FAQ }        from './config/faq';
import {
  updateHomeMeta, updateToolMeta, updateCategoryMeta, updatePageMeta,
  updateBlogIndexMeta, updateBlogPostMeta,
  updateAllToolsMeta, parseRoute, buildPath,
} from './utils/seo';
import { trackPageView } from './utils/analytics';
import {
  FileText, Globe,
  ChevronRight, ArrowLeft, Star, Plus, Minus,
  ShieldCheck, Zap, Info,
  Lock, MonitorSmartphone, Infinity as InfinityIcon, ChevronDown,
  CheckCircle2, Lightbulb,
} from 'lucide-react';
import { ALL_CATEGORIES } from './config/categories';
import { DevRunPill } from './components/DevToolChrome';
import { resolveToolIcon } from './utils/toolIcons';

const LIVE_DEV_TOOL_IDS = new Set([
  'json-formatter', 'base64', 'uuid-generator', 'password-generator', 'hash-generator', 'jwt-decoder', 'diff-checker',
]);

// Tools whose own UI is a wide, dual-pane editor (input | output side by side), these get a
// "stacked" tool-page layout where the sidebar cards move below as a horizontal row instead of
// a narrow sticky column, so the editor panes get the full page width to breathe.
const WIDE_TOOL_IDS = new Set([
  'json-formatter', 'base64', 'jwt-decoder', 'xml-formatter', 'yaml-formatter',
  'sql-formatter', 'html-formatter', 'css-formatter', 'js-formatter',
  'diff-checker', 'markdown-preview',
]);

import { JsonFormatter }          from './tools/JsonFormatter';
import { Base64Tool }             from './tools/Base64Tool';
import { HashGenerator }          from './tools/HashGenerator';
import { UuidGenerator }          from './tools/UuidGenerator';
import { PasswordGenerator }      from './tools/PasswordGenerator';
import { RegexTester }            from './tools/RegexTester';
import { CaseConverter }          from './tools/CaseConverter';
import { JwtDecoder }             from './tools/JwtDecoder';
import { TextCounter }            from './tools/TextCounter';
import { ColorPicker }            from './tools/ColorPicker';
import { GlassmorphismGenerator } from './tools/GlassmorphismGenerator';
import { AiBgRemover }            from './tools/AiBgRemover';
import {
  ImageResizeTool, ImageRotateTool, ImageFlipTool,
  ImageConverterTool, ImageCompressorTool, ImageCropTool,
} from './tools/image/BasicImageTools';
import {
  ImageAdjustTool, ImageSharpenTool,
} from './tools/image/FilterImageTools';
import {
  SvgConverterTool, ImageMetadataTool,
} from './tools/image/ToolboxImageTools';
import {
  ImageWatermarkTool,
} from './tools/image/AdvancedImageTools';
import { ImageDrawTool } from './tools/image/ImageDrawTool';
import { ImageEditorTool } from './tools/image/ImageEditorTool';
import { DrawingTool } from './tools/DrawingTool';
import { WordTools }              from './tools/WordTools';
import { ToolPlaceholder }        from './tools/ToolPlaceholder';
import { ToolCard }               from './components/ToolCard';
import { AppLink }                from './components/AppLink';
import { FavoriteButton }         from './components/FavoriteButton';
import { ToolViewSkeleton }       from './components/Skeleton';
import { useFavorites }           from './utils/favorites';
import { useTheme }               from './utils/theme';

// ─── Lazy-loaded heavy tools (tesseract.js / qrcode) ─────────
const HeavyToolFallback = () => <ToolViewSkeleton />;

const lazyComponent = (
  loader: () => Promise<Record<string, unknown>>,
  exportName: string,
): React.FC => {
  const Cmp = React.lazy(() =>
    loader().then(m => ({ default: m[exportName] as React.ComponentType })),
  );
  return () => (
    <React.Suspense fallback={<HeavyToolFallback />}>
      <Cmp />
    </React.Suspense>
  );
};

const lazyTool = <K extends 'PdfMergeTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/PdfMergeTool'), exportName);

const PdfMergeToolLazy = lazyTool('PdfMergeTool');

const lazyPdfPageTools = <K extends
  'PdfSplitTool' | 'PdfRotateTool' | 'PdfDeletePagesTool' | 'PdfExtractPagesTool' | 'PdfReorderTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/pdf/PdfPageTools'), exportName);

const lazyPdfEditTools = <K extends
  'PdfCompressTool' | 'PdfWatermarkTool' | 'PdfPageNumbersTool' | 'PdfRedactTool' | 'PdfSignTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/pdf/PdfEditTools'), exportName);

const lazyPdfExtractTools = <K extends
  'PdfToImagesTool' | 'ImagesToPdfTool' | 'ExtractImagesTool' | 'ExtractTextTool'
  | 'PdfOcrTool' | 'MetadataTool' | 'TextToPdfTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/pdf/PdfExtractTools'), exportName);

const lazyPdfAdvancedTools = <K extends
  'PdfCropTool' | 'PdfHeaderFooterTool' | 'PdfFillFormsTool' | 'PdfFlattenTool'
  | 'PdfRepairTool' | 'PdfViewerTool' | 'PdfCompareTool' | 'PdfToWordTool' | 'HtmlToPdfTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/pdf/PdfAdvancedTools'), exportName);

const lazyToolHeavy = <K extends 'QrGeneratorTool' | 'OcrImageTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/image/HeavyImageTools'), exportName);

const lazyExtraTextTools = <K extends
  'RemoveDuplicateLinesTool' | 'SortLinesTool' | 'ReverseTextTool' | 'LoremIpsumTool'
  | 'SlugGeneratorTool' | 'TextCleanerTool' | 'FindReplaceTool' | 'RemoveEmptyLinesTool'
  | 'ExtractEmailsTool' | 'ExtractUrlsTool' | 'ExtractPhonesTool' | 'ExtractHashtagsTool'
  | 'TextDiffTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/text/ExtraTextTools'), exportName);

const lazyWebTools = <K extends
  'UrlParserTool' | 'UserAgentParserTool' | 'MimeCheckerTool' | 'HtmlEntityTool'
  | 'UnicodeConverterTool' | 'AsciiConverterTool' | 'BinaryConverterTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/WebTools'), exportName);

const lazyExtraDevTools = <K extends
  'XmlFormatterTool' | 'YamlFormatterTool' | 'SqlFormatterTool' | 'HtmlFormatterTool'
  | 'CssFormatterTool' | 'JsFormatterTool' | 'UrlEncoderTool' | 'DiffCheckerTool'
  | 'MarkdownPreviewTool' | 'HtmlMarkdownTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/dev/ExtraDevTools'), exportName);

const lazyUtilityTools = <K extends
  'UnitConverterTool' | 'TimezoneConverterTool' | 'TimestampConverterTool' | 'AgeCalculatorTool'
  | 'PercentageCalcTool' | 'BmiCalculatorTool' | 'EmiCalculatorTool' | 'ScientificCalculatorTool'
  | 'GstCalculatorTool' | 'NumberToWordsTool' | 'RomanNumeralsTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/utility/UtilityTools'), exportName);

const lazyExtraSecurityTools = <K extends
  'PassphraseGeneratorTool' | 'PasswordStrengthTool' | 'FileChecksumTool'
  | 'RandomStringTool' | 'SecureNotesTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/security/ExtraSecurityTools'), exportName);

const lazyExtraColorTools = <K extends
  'GradientGeneratorTool' | 'PaletteGeneratorTool' | 'ContrastCheckerTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/color/ExtraColorTools'), exportName);

const lazyArchiveTools = <K extends 'ZipExtractorTool' | 'ZipCreatorTool' | 'BatchZipTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/archive/ArchiveTools'), exportName);

const lazyCsvTools = <K extends
  'CsvViewerTool' | 'CsvEditorTool' | 'CsvCleanerTool' | 'CsvToJsonTool' | 'JsonToCsvTool'
  | 'TsvConverterTool' | 'DelimiterConverterTool' | 'RemoveDuplicateRowsTool' | 'MergeCsvTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/csv/CsvTools'), exportName);

const lazyMiscImageTools = <K extends
  'IcoGeneratorTool' | 'ImageToBase64Tool' | 'Base64ToImageTool' | 'ImageCollageTool'
  | 'MemeGeneratorTool' | 'BatchResizeTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/image/MiscImageTools'), exportName);

// ─── Fully implemented tools (routed to real components) ─────
const IMPLEMENTED_TOOLS: Record<string, React.ComponentType> = {
  'json-formatter':       JsonFormatter,
  'base64':               Base64Tool,
  'hash-generator':       HashGenerator,
  'uuid-generator':       UuidGenerator,
  'password-generator':   PasswordGenerator,
  'regex-tester':         RegexTester,
  'case-converter':       CaseConverter,
  'jwt-decoder':          JwtDecoder,
  'word-counter':         TextCounter,
  'color-converter':      ColorPicker,
  'pdf-merge':            PdfMergeFlow,
  'pdf-split':            lazyPdfPageTools('PdfSplitTool'),
  'pdf-rotate':           lazyPdfPageTools('PdfRotateTool'),
  'pdf-delete-pages':     lazyPdfPageTools('PdfDeletePagesTool'),
  'pdf-page-extractor':   lazyPdfPageTools('PdfExtractPagesTool'),
  'pdf-reorder':          lazyPdfPageTools('PdfReorderTool'),
  'pdf-compress':         lazyPdfEditTools('PdfCompressTool'),
  'pdf-watermark':        lazyPdfEditTools('PdfWatermarkTool'),
  'pdf-page-numbers':     lazyPdfEditTools('PdfPageNumbersTool'),
  'pdf-redact':           lazyPdfEditTools('PdfRedactTool'),
  'pdf-sign':             lazyPdfEditTools('PdfSignTool'),
  'pdf-to-jpg':           lazyPdfExtractTools('PdfToImagesTool'),
  'jpg-to-pdf':           lazyPdfExtractTools('ImagesToPdfTool'),
  'pdf-extract-images':   lazyPdfExtractTools('ExtractImagesTool'),
  'pdf-extract-text':     lazyPdfExtractTools('ExtractTextTool'),
  'pdf-ocr':              lazyPdfExtractTools('PdfOcrTool'),
  'pdf-metadata':         lazyPdfExtractTools('MetadataTool'),
  'text-to-pdf':          lazyPdfExtractTools('TextToPdfTool'),
  'pdf-crop':             lazyPdfAdvancedTools('PdfCropTool'),
  'pdf-header-footer':    lazyPdfAdvancedTools('PdfHeaderFooterTool'),
  'pdf-fill-forms':       lazyPdfAdvancedTools('PdfFillFormsTool'),
  'pdf-flatten':          lazyPdfAdvancedTools('PdfFlattenTool'),
  'pdf-repair':           lazyPdfAdvancedTools('PdfRepairTool'),
  'pdf-viewer':           lazyPdfAdvancedTools('PdfViewerTool'),
  'pdf-compare':          lazyPdfAdvancedTools('PdfCompareTool'),
  'pdf-to-word':          lazyPdfAdvancedTools('PdfToWordTool'),
  'html-to-pdf':          lazyPdfAdvancedTools('HtmlToPdfTool'),
  // Text tools
  'remove-duplicates-text': lazyExtraTextTools('RemoveDuplicateLinesTool'),
  'sort-lines':           lazyExtraTextTools('SortLinesTool'),
  'reverse-text':         lazyExtraTextTools('ReverseTextTool'),
  'lorem-ipsum':          lazyExtraTextTools('LoremIpsumTool'),
  'slug-generator':       lazyExtraTextTools('SlugGeneratorTool'),
  'text-cleaner':         lazyExtraTextTools('TextCleanerTool'),
  'find-replace':         lazyExtraTextTools('FindReplaceTool'),
  'remove-empty-lines':   lazyExtraTextTools('RemoveEmptyLinesTool'),
  'extract-emails':       lazyExtraTextTools('ExtractEmailsTool'),
  'extract-urls':         lazyExtraTextTools('ExtractUrlsTool'),
  'extract-phones':       lazyExtraTextTools('ExtractPhonesTool'),
  'extract-hashtags':     lazyExtraTextTools('ExtractHashtagsTool'),
  'diff-text':            lazyExtraTextTools('TextDiffTool'),
  // Web tools
  'url-parser':           lazyWebTools('UrlParserTool'),
  'user-agent-parser':    lazyWebTools('UserAgentParserTool'),
  'mime-checker':         lazyWebTools('MimeCheckerTool'),
  'html-entity':          lazyWebTools('HtmlEntityTool'),
  'unicode-converter':    lazyWebTools('UnicodeConverterTool'),
  'ascii-converter':      lazyWebTools('AsciiConverterTool'),
  'binary-converter':     lazyWebTools('BinaryConverterTool'),
  // Developer tools
  'xml-formatter':        lazyExtraDevTools('XmlFormatterTool'),
  'yaml-formatter':       lazyExtraDevTools('YamlFormatterTool'),
  'sql-formatter':        lazyExtraDevTools('SqlFormatterTool'),
  'html-formatter':       lazyExtraDevTools('HtmlFormatterTool'),
  'css-formatter':        lazyExtraDevTools('CssFormatterTool'),
  'js-formatter':         lazyExtraDevTools('JsFormatterTool'),
  'url-encoder':          lazyExtraDevTools('UrlEncoderTool'),
  'diff-checker':         lazyExtraDevTools('DiffCheckerTool'),
  'markdown-preview':     lazyExtraDevTools('MarkdownPreviewTool'),
  'html-markdown':        lazyExtraDevTools('HtmlMarkdownTool'),
  // Utility / calculator tools
  'unit-converter':       lazyUtilityTools('UnitConverterTool'),
  'timezone-converter':   lazyUtilityTools('TimezoneConverterTool'),
  'timestamp-converter':  lazyUtilityTools('TimestampConverterTool'),
  'age-calculator':       lazyUtilityTools('AgeCalculatorTool'),
  'percentage-calc':      lazyUtilityTools('PercentageCalcTool'),
  'bmi-calculator':       lazyUtilityTools('BmiCalculatorTool'),
  'emi-calculator':       lazyUtilityTools('EmiCalculatorTool'),
  'scientific-calc':      lazyUtilityTools('ScientificCalculatorTool'),
  'gst-calculator':       lazyUtilityTools('GstCalculatorTool'),
  'number-to-words':      lazyUtilityTools('NumberToWordsTool'),
  'roman-numerals':       lazyUtilityTools('RomanNumeralsTool'),
  // Security tools
  'passphrase-gen':       lazyExtraSecurityTools('PassphraseGeneratorTool'),
  'password-strength':    lazyExtraSecurityTools('PasswordStrengthTool'),
  'file-checksum':        lazyExtraSecurityTools('FileChecksumTool'),
  'random-string':        lazyExtraSecurityTools('RandomStringTool'),
  'secure-notes':         lazyExtraSecurityTools('SecureNotesTool'),
  // Color tools
  'gradient-generator':   lazyExtraColorTools('GradientGeneratorTool'),
  'palette-color':        lazyExtraColorTools('PaletteGeneratorTool'),
  'contrast-checker':     lazyExtraColorTools('ContrastCheckerTool'),
  'glassmorphism':        GlassmorphismGenerator,
  // Archive tools
  'zip-extractor':        lazyArchiveTools('ZipExtractorTool'),
  'zip-creator':          lazyArchiveTools('ZipCreatorTool'),
  'batch-zip':            lazyArchiveTools('BatchZipTool'),
  // CSV / Excel tools
  'csv-viewer':           lazyCsvTools('CsvViewerTool'),
  'csv-editor':           lazyCsvTools('CsvEditorTool'),
  'csv-cleaner':          lazyCsvTools('CsvCleanerTool'),
  'csv-to-json':          lazyCsvTools('CsvToJsonTool'),
  'json-to-csv':          lazyCsvTools('JsonToCsvTool'),
  'tsv-converter':        lazyCsvTools('TsvConverterTool'),
  'delimiter-converter':  lazyCsvTools('DelimiterConverterTool'),
  'remove-duplicates':    lazyCsvTools('RemoveDuplicateRowsTool'),
  'merge-csv':            lazyCsvTools('MergeCsvTool'),
  // Misc image tools
  'ico-generator':        lazyMiscImageTools('IcoGeneratorTool'),
  'image-to-base64':      lazyMiscImageTools('ImageToBase64Tool'),
  'base64-to-image':      lazyMiscImageTools('Base64ToImageTool'),
  'image-collage':        lazyMiscImageTools('ImageCollageTool'),
  'meme-generator':       lazyMiscImageTools('MemeGeneratorTool'),
  'batch-resize':         lazyMiscImageTools('BatchResizeTool'),
  'ai-bg-remover':        AiBgRemover,
  'image-resize':         ImageResizeTool,
  'image-resize-image':   ImageResizeTool,
  'image-crop':           ImageCropTool,
  'image-rotate':         ImageRotateTool,
  'image-flip':           ImageFlipTool,
  'image-convert':        ImageConverterTool,
  'image-converter':      ImageConverterTool,
  'image-compressor':     ImageCompressorTool,
  'compress-image':       ImageCompressorTool,
  'compress-images':      ImageCompressorTool,
  'image-adjust':         ImageAdjustTool,
  'image-sharpen':        ImageSharpenTool,
  'svg-converter':        SvgConverterTool,
  'svg-to-png':           SvgConverterTool,
  'image-metadata':       ImageMetadataTool,
  'image-watermark':      ImageWatermarkTool,
  'image-draw':           ImageDrawTool,
  'image-editor':         ImageEditorTool,
  'drawing':              DrawingTool,
  'drawing-board':        DrawingTool,
  'qr-generator':         lazyToolHeavy('QrGeneratorTool'),
  'qr-code-generator':    lazyToolHeavy('QrGeneratorTool'),
  'ocr-image':            lazyToolHeavy('OcrImageTool'),
};

// ─── Placeholder metadata per category (for un-built tools) ──
const getPlaceholderMeta = (category: ToolCategory) => {
  const map: Record<string, { features: string[]; from: string; to: string }> = {
    pdf:        { features: ['Merge, split, compress & convert PDFs', 'Add watermarks, page numbers & signatures', 'Extract text, images and tables', 'Encrypt, unlock and redact documents'], from: 'from-red-500', to: 'to-orange-600' },
    word:       { features: ['Convert DOCX to PDF, HTML & Markdown', 'View documents without Microsoft Word', 'Inspect metadata and compare versions', 'Strip formatting and clean documents'], from: 'from-blue-500', to: 'to-indigo-600' },
    excel:      { features: ['Convert Excel to CSV and back', 'View and edit CSV in a table grid', 'Clean, sort and transform data', 'Merge and split worksheets'], from: 'from-green-500', to: 'to-emerald-600' },
    powerpoint: { features: ['Convert PPTX to PDF and images', 'Merge presentation slides', 'View decks in the browser', 'Extract slides and assets'], from: 'from-orange-500', to: 'to-red-600' },
    image:      { features: ['Compress and resize images', 'Convert between formats', 'Remove backgrounds with AI', 'Apply filters and effects'], from: 'from-pink-500', to: 'to-rose-600' },
    video:      { features: ['Trim and cut video clips', 'Compress without quality loss', 'Convert formats and extract audio', 'Create GIFs from video'], from: 'from-violet-500', to: 'to-purple-600' },
    audio:      { features: ['Cut and merge audio files', 'Convert between audio formats', 'Record from your microphone', 'Normalize volume levels'], from: 'from-cyan-500', to: 'to-blue-600' },
    dev:        { features: ['Format and validate code', 'Encode, decode and hash data', 'Generate UUIDs and passwords', 'Test regex and inspect JWTs'], from: 'from-slate-500', to: 'to-zinc-700' },
    ai:         { features: ['Remove image backgrounds on-device', 'OCR text from images and PDFs', 'Upscale and enhance photos', 'Runs locally with WebGPU'], from: 'from-purple-500', to: 'to-violet-600' },
    security:   { features: ['Generate strong passwords', 'Compute cryptographic hashes', 'Encrypt and decrypt data', 'Check password strength'], from: 'from-emerald-500', to: 'to-teal-600' },
    text:       { features: ['Count words, lines and characters', 'Convert text case formats', 'Clean and sort text', 'Extract and transform data'], from: 'from-teal-500', to: 'to-cyan-600' },
    color:      { features: ['Pick and convert color formats', 'Generate CSS gradients', 'Build color palettes', 'Preview glassmorphism styles'], from: 'from-fuchsia-500', to: 'to-pink-600' },
    utility:    { features: ['Convert units and currencies', 'Calculate BMI, GST and EMI', 'Generate random numbers', 'Calculate dates and timezones'], from: 'from-sky-500', to: 'to-indigo-600' },
    web:        { features: ['Encode and decode URLs', 'Detect MIME types', 'Convert between binary and text', 'Generate UUIDs and slugs'], from: 'from-indigo-500', to: 'to-blue-600' },
    archive:    { features: ['Create and extract ZIP files', 'Read TAR and 7Z archives', 'Compress files locally', 'Never upload to a server'], from: 'from-amber-500', to: 'to-yellow-600' },
  };
  return map[category] ?? { features: ['Works directly on your device', 'No account or uploads needed', 'Quick to use and always free'], from: 'from-indigo-500', to: 'to-purple-600' };
};

// ─── App Shell ───────────────────────────────────────────────
export const App: React.FC = () => {
  const initRoute = parseRoute(window.location.pathname);

  const [activeToolId,        setActiveToolId]        = useState(initRoute.toolId ?? '');
  const [isSearchOpen,        setIsSearchOpen]        = useState(false);
  const [currentView,         setCurrentView]         = useState<'home'|'tool'|'category'|'page'|'all'|'blog'|'files'|'settings'>(initRoute.view);
  const [activeCategoryView,  setActiveCategoryView]  = useState<ToolCategory|null>(initRoute.category ?? null);
  const [activePageId,        setActivePageId]        = useState<StaticPageId>(initRoute.pageId ?? 'privacy');
  const [activeBlogSlug,      setActiveBlogSlug]      = useState(initRoute.blogSlug ?? '');

  const { preference: theme, resolvedDark, setTheme } = useTheme();

  const syncMeta = useCallback(() => {
    if (currentView === 'page') updatePageMeta(activePageId);
    else if (currentView === 'blog') {
      if (activeBlogSlug) updateBlogPostMeta(activeBlogSlug);
      else updateBlogIndexMeta();
    }
    else if (currentView === 'all') updateAllToolsMeta();
    else if (currentView === 'tool' && activeToolId) updateToolMeta(activeToolId);
    else if (currentView === 'category' && activeCategoryView) updateCategoryMeta(activeCategoryView);
    else updateHomeMeta();
  }, [currentView, activeToolId, activeCategoryView, activePageId, activeBlogSlug]);

  useEffect(() => { syncMeta(); }, [syncMeta]);

  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackPageView(window.location.pathname, document.title);
  }, [currentView, activeToolId, activeCategoryView, activePageId, activeBlogSlug]);

  useEffect(() => {
    const onPopState = () => {
      const route = parseRoute(window.location.pathname);
      setCurrentView(route.view);
      setActiveToolId(route.toolId ?? '');
      setActiveCategoryView(route.category ?? null);
      if (route.pageId) setActivePageId(route.pageId);
      setActiveBlogSlug(route.blogSlug ?? '');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (view: typeof currentView, id?: string) => {
    const path = buildPath(view, id);
    window.history.pushState(null, '', path);
  };

  const activeTool = TOOLS.find(t => t.id === activeToolId);

  const goHome = () => {
    setCurrentView('home');
    setActiveToolId('');
    setActiveCategoryView(null);
    navigate('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAllTools = () => {
    setCurrentView('all');
    setActiveToolId('');
    setActiveCategoryView(null);
    navigate('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openTool = (id: string) => {
    setActiveToolId(id);
    setCurrentView('tool');
    navigate('tool', id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const recent = JSON.parse(localStorage.getItem('nexttool-recent') || '[]');
      const filtered = recent.filter((r: string) => r !== id);
      filtered.unshift(id);
      localStorage.setItem('nexttool-recent', JSON.stringify(filtered.slice(0, 6)));
    } catch { /* ignore */ }
  };

  const openCategory = (cat: ToolCategory | 'all') => {
    if (cat === 'all') { openAllTools(); return; }
    setActiveCategoryView(cat as ToolCategory);
    setCurrentView('category');
    navigate('category', cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBlog = (slug?: string) => {
    setActiveBlogSlug(slug ?? '');
    setCurrentView('blog');
    setActiveToolId('');
    setActiveCategoryView(null);
    navigate('blog', slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPage = (id: StaticPageId) => {
    setActivePageId(id);
    setCurrentView('page');
    setActiveToolId('');
    setActiveCategoryView(null);
    setActiveBlogSlug('');
    navigate('page', id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCategories = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setActiveToolId('');
      setActiveCategoryView(null);
      navigate('home');
      setTimeout(() => {
        document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else {
      document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToFaq = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setActiveToolId('');
      setActiveCategoryView(null);
      navigate('home');
      setTimeout(() => {
        document.getElementById('faq-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else {
      document.getElementById('faq-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderTool = () => {
    if (activeToolId === 'image-editor') return <ImageEditorTool onExit={goHome} />;

    const Implemented = IMPLEMENTED_TOOLS[activeToolId];
    if (Implemented) return <Implemented />;

    if (activeTool?.category === 'word') return <WordTools toolId={activeToolId} />;

    if (activeTool) {
      const meta = getPlaceholderMeta(activeTool.category);
      const features = PLANNED_FEATURES[activeTool.id] ?? meta.features;
      const catConf = ALL_CATEGORIES.find(c => c.id === activeTool.category);
      return (
        <ToolPlaceholder
          toolName={activeTool.name}
          toolDescription={activeTool.description}
          category={catConf?.name ?? activeTool.category}
          features={features}
          gradientFrom={meta.from}
          gradientTo={meta.to}
        />
      );
    }
    return <PdfMergeToolLazy />;
  };

  return (
    <div className="relative min-h-screen flex flex-col text-foreground">
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        theme={theme}
        resolvedDark={resolvedDark}
        onThemeChange={setTheme}
        onGoHome={goHome}
        onOpenPage={openPage}
        onOpenBlog={() => openBlog()}
        isBlogActive={currentView === 'blog'}
        activePageId={currentView === 'page' ? activePageId : undefined}
        onOpenCategories={scrollToCategories}
        onOpenAllTools={openAllTools}
        onSelectCategory={openCategory}
        currentView={currentView}
      />
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={openTool}
      />

      <main className="flex-1">
        {currentView === 'page'
          ? <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
              <StaticPageView pageId={activePageId} onBack={goHome} onOpenPage={openPage} />
            </div>
          : currentView === 'blog'
          ? (() => {
              const post = activeBlogSlug ? getPost(activeBlogSlug) : undefined;
              return post
                ? <BlogPostView post={post} onBackToBlog={() => openBlog()} onOpenPost={openBlog} onSelectTool={openTool} />
                : <Blog onBack={goHome} onOpenPost={openBlog} />;
            })()
          : currentView === 'tool'
          ? <ToolView activeTool={activeTool} onBack={goHome} renderTool={renderTool} categories={ALL_CATEGORIES}
              onOpenPage={openPage} onOpenBlog={openBlog} onSelectTool={openTool} onSelectCategory={openCategory} onGoHome={goHome} onOpenFaq={scrollToFaq} onOpenCategories={scrollToCategories} />
          : currentView === 'category' && activeCategoryView
          ? <CategoryView cat={activeCategoryView} onSelectTool={openTool} onBack={goHome} categories={ALL_CATEGORIES} />
          : currentView === 'all'
          ? <AllToolsView onSelectTool={openTool} onBack={goHome} categories={ALL_CATEGORIES} />
          : currentView === 'files'
          ? <MyFiles onBrowseTools={openAllTools} onOpenTool={openTool} />
          : currentView === 'settings'
          ? <Settings theme={theme} onThemeChange={setTheme} />
          : <HomeView onSelectTool={openTool} onSelectCategory={openCategory} />
        }
      </main>

      {currentView !== 'tool' && (
        <Footer onOpenPage={openPage} onOpenBlog={openBlog} onSelectTool={openTool} onSelectCategory={openCategory} onGoHome={goHome} onOpenFaq={scrollToFaq} onOpenCategories={scrollToCategories} />
      )}

    </div>
  );
};

// ─── HOME VIEW ───────────────────────────────────────────────

const WHY_FEATURES = [
  { icon: Zap,             title: 'Fast by design',       desc: 'Lightweight and code-split, every tool opens instantly without heavy downloads.' },
  { icon: Lock,            title: 'Files stay on device', desc: 'Everything is processed in your browser. Your files are never uploaded anywhere.' },
  { icon: ShieldCheck,     title: 'Private by default',   desc: 'No accounts, no file tracking and no sign-up walls.' },
  { icon: InfinityIcon,    title: 'Free forever',         desc: 'No hidden tiers, watermarks or paywalls. Every tool is free to use.' },
  { icon: MonitorSmartphone, title: 'Works everywhere',   desc: 'Optimized for desktop, tablet and phone with one consistent experience.' },
  { icon: Globe,           title: 'Nothing to install',   desc: 'Just open a tool and start working on any modern browser.' },
];

const FAQ_ITEMS = HOME_FAQ;

const SectionHeading: React.FC<{
  kicker: string;
  title: string;
  desc?: string;
  action?: React.ReactNode;
  id?: string;
}> = ({ kicker, title, desc, action, id }) => (
  <div className="flex items-end justify-between gap-4 mb-5">
    <div>
      <span className="section-kicker mb-2">{kicker}</span>
      <h2 id={id} className="text-[20px] sm:text-[22px] font-bold text-foreground tracking-[-0.02em]">{title}</h2>
      {desc && <p className="text-[13px] text-muted-foreground mt-1">{desc}</p>}
    </div>
    {action}
  </div>
);

/** Toggle glyph shared by both FAQ components: a circular chip that
 *  cross-fades between a plus (closed) and a minus (open), rather than a
 *  chevron, since "add/remove this answer from view" is closer to what the
 *  control actually does. */
const FaqToggleChip: React.FC<{ open: boolean; size?: 'sm' | 'md' }> = ({ open, size = 'md' }) => {
  const box = size === 'md' ? 'w-7 h-7' : 'w-6 h-6';
  const glyph = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';
  return (
    <span
      className={`relative grid place-items-center ${box} shrink-0 rounded-full transition-colors
                 duration-200 ${open ? 'bg-primary text-primary-foreground' : 'bg-surface-container text-muted-foreground'}`}
    >
      <Plus
        className={`${glyph} absolute transition-all duration-200 ${open ? 'rotate-45 opacity-0' : 'rotate-0 opacity-100'}`}
        aria-hidden="true"
      />
      <Minus
        className={`${glyph} absolute transition-all duration-200 ${open ? 'rotate-0 opacity-100' : '-rotate-45 opacity-0'}`}
        aria-hidden="true"
      />
    </span>
  );
};

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden transition-colors duration-200
                 ${open ? 'border-primary/30' : 'border-border'}`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left
                   hover:bg-muted/40 transition-colors"
      >
        <span className="text-[15px] font-bold text-foreground">{q}</span>
        <FaqToggleChip open={open} />
      </button>
      {/* Grid-rows animates height without knowing the content's height up front. */}
      <div
        className="grid transition-[grid-template-rows] duration-[220ms] ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-[14px] text-muted-foreground leading-relaxed max-w-[62ch]">{a}</p>
        </div>
      </div>
    </div>
  );
};

/** A single question in the per-tool "Learn more" FAQ list. Controlled state
 *  (rather than native <details>) so the expand/collapse can animate. */
const ToolFaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-xl border bg-card overflow-hidden transition-colors duration-200
                 ${open ? 'border-primary/30' : 'border-border'}`}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left
                   hover:bg-muted/40 transition-colors"
      >
        <span className="text-[13.5px] font-semibold text-foreground">{question}</span>
        <FaqToggleChip open={open} size="sm" />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-[220ms] ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-3 text-[13px] text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
};

const HomeView: React.FC<{
  onSelectTool: (id: string) => void;
  onSelectCategory: (cat: ToolCategory | 'all') => void;
}> = ({ onSelectTool, onSelectCategory }) => {
  const newTools = TOOLS.filter(t => t.isNew).slice(0, 4);

  const [recentIds, setRecentIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      setRecentIds(JSON.parse(localStorage.getItem('nexttool-recent') || '[]'));
    } catch { /* ignore */ }
  }, []);

  const recentTools = recentIds
    .map(id => TOOLS.find(t => t.id === id))
    .filter((t): t is typeof TOOLS[number] => Boolean(t))
    .slice(0, 4);

  const { favorites } = useFavorites();
  const favoriteTools = favorites
    .map(id => TOOLS.find(t => t.id === id))
    .filter((t): t is typeof TOOLS[number] => Boolean(t))
    .slice(0, 4);

  const catConf = (cat: ToolCategory) => ALL_CATEGORIES.find(c => c.id === cat);

  return (
    <div className="relative">

      <Hero
        onSelectTool={onSelectTool}
        onSelectCategory={onSelectCategory}
        onBrowseAll={() => onSelectCategory('all')}
      />

      {/* ── BROWSE ───────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 space-y-16">

        {/* Search, category filter and the full tool library. */}
        <ToolGrid onSelectTool={onSelectTool} />

        {/* ── Recently used ──────────────────────────────── */}
        {recentTools.length > 0 && (
          <section aria-labelledby="recent-heading" className="fade-up">
            <SectionHeading
              kicker="Recents"
              title="Recently used"
              desc="Stored locally on this device"
              id="recent-heading"
              action={
                <button onClick={() => {
                  try { localStorage.removeItem('nexttool-recent'); setRecentIds([]); } catch { /* ignore */ }
                }} className="btn-ghost text-[12px] hidden sm:flex">
                  Clear <ChevronRight className="w-4 h-4" />
                </button>
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentTools.map((tool, idx) => {
                const conf = catConf(tool.category);
                return (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    icon={conf?.icon ?? FileText}
                    iconColor={conf?.iconColor}
                    iconBg={conf?.iconBg}
                    categoryLabel={conf?.name}
                    onSelect={onSelectTool}
                    className="fade-up"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* ── Favorites ──────────────────────────────────── */}
        {favoriteTools.length > 0 && (
          <section aria-labelledby="favorites-heading" className="fade-up">
            <SectionHeading
              kicker="Saved"
              title="Favorites"
              desc="Tools you starred for quick access"
              id="favorites-heading"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {favoriteTools.map((tool, idx) => {
                const conf = catConf(tool.category);
                return (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    icon={conf?.icon ?? FileText}
                    iconColor={conf?.iconColor}
                    iconBg={conf?.iconBg}
                    categoryLabel={conf?.name}
                    onSelect={onSelectTool}
                    className="fade-up"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* ── New tools ──────────────────────────────────── */}
        {newTools.length > 0 && (
          <section aria-labelledby="new-heading">
            <SectionHeading
              kicker="New"
              title="New Tools"
              desc="Recently added"
              id="new-heading"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {newTools.map((tool, idx) => {
                const conf = catConf(tool.category);
                return (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    icon={conf?.icon ?? FileText}
                    iconColor={conf?.iconColor}
                    iconBg={conf?.iconBg}
                    categoryLabel={conf?.name}
                    onSelect={onSelectTool}
                    className="fade-up"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* ── Why NextTool ───────────────────────────────── */}
        <section aria-labelledby="why-heading">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="section-kicker mb-3">Why NextTool</span>
            <h2 id="why-heading" className="text-[24px] sm:text-[28px] font-bold text-foreground tracking-[-0.02em]">
              Everything you need, nothing you don't
            </h2>
            <p className="text-[14px] text-muted-foreground mt-3 leading-relaxed">
              No sign-ups, no uploads, no clutter. Just fast tools that respect your privacy.
            </p>
          </div>
          <div className="rounded-[22px] border border-border bg-card p-6 sm:p-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {WHY_FEATURES.map(f => (
              <div key={f.title}>
                <div className="w-[34px] h-[34px] rounded-[10px] bg-primary/10 text-primary flex items-center justify-center">
                  <f.icon className="w-4 h-4" />
                </div>
                <h3 className="mt-4 mb-1.5 text-[16px] font-bold text-foreground">{f.title}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────── */}
        <section aria-labelledby="faq-heading" className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-9">
            <span className="section-kicker mb-3">FAQ</span>
            <h2 id="faq-heading" className="text-[25px] sm:text-[29px] font-bold text-foreground tracking-[-0.02em]">
              Frequently asked questions
            </h2>
            <p className="mt-2.5 text-[14.5px] text-muted-foreground">
              Answers to what people ask most before trying a tool.
            </p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

// ─── CATEGORY VIEW ───────────────────────────────────────────
const CategoryView: React.FC<{
  cat: ToolCategory;
  onSelectTool: (id: string) => void;
  onBack: () => void;
  categories: typeof ALL_CATEGORIES;
}> = ({ cat, onSelectTool, onBack, categories }) => {
  const conf  = categories.find(c => c.id === cat);
  const tools = TOOLS.filter(t => t.category === cat);
  const Icon  = conf?.icon ?? FileText;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <button onClick={onBack} className="btn-ghost mb-6 text-[13px]">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className={`cat-icon ${conf?.iconBg}`}>
          <Icon className={conf?.iconColor} style={{ width: 20, height: 20 }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{conf?.name}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">{tools.length} tools available</p>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <h3 className="text-[16px] font-semibold text-foreground mb-1">No tools in this category yet</h3>
          <p className="text-[13px] text-muted-foreground max-w-xs mx-auto">Check back soon, new tools are added regularly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {tools.map(tool => {
            const catConf = categories.find(c => c.id === tool.category);
            return (
              <ToolCard
                key={tool.id}
                tool={tool}
                icon={catConf?.icon ?? FileText}
                iconColor={catConf?.iconColor}
                iconBg={catConf?.iconBg}
                categoryLabel={catConf?.name}
                onSelect={onSelectTool}
                showPopularBadge={tool.isPopular}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── TOOL VIEW ───────────────────────────────────────────────
const ToolView: React.FC<{
  activeTool: (typeof TOOLS)[0] | undefined;
  onBack: () => void;
  renderTool: () => React.ReactNode;
  categories: typeof ALL_CATEGORIES;
  onOpenPage: (id: StaticPageId) => void;
  onOpenBlog: (slug?: string) => void;
  onSelectTool: (id: string) => void;
  onSelectCategory: (cat: ToolCategory | 'all') => void;
  onGoHome: () => void;
  onOpenFaq: () => void;
  onOpenCategories: () => void;
}> = ({ activeTool, onBack, renderTool, categories, onOpenPage, onOpenBlog, onSelectTool, onSelectCategory, onGoHome, onOpenFaq, onOpenCategories }) => {
  const conf = categories.find(c => c.id === activeTool?.category);
  const CategoryIcon = conf?.icon ?? FileText;
  const Icon = activeTool ? resolveToolIcon(activeTool.icon, CategoryIcon) : CategoryIcon;
  const related = activeTool
    ? TOOLS.filter(t => t.category === activeTool.category && t.id !== activeTool.id).slice(0, 4)
    : [];
  const [learnMoreOpen, setLearnMoreOpen] = useState(true);

  if (activeTool?.id === 'image-editor') return <>{renderTool()}</>;

  const seo = activeTool ? TOOL_SEO_CONTENT[activeTool.id] : undefined;
  const stacked = !!activeTool && WIDE_TOOL_IDS.has(activeTool.id);
  const sidebarCardCls = `rounded-2xl border bg-card border-border p-5 shadow-card${stacked ? ' flex-1 min-w-[240px]' : ''}`;

  return (
    <div className="max-w-[1360px] w-full mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 fade-in">
      <AdBanner type="leaderboard" />

      {activeTool && (
        <>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[12px] flex-wrap" aria-label="Breadcrumb">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-border" />
            <AppLink href={`/category/${activeTool.category}`} onNavigate={() => onSelectCategory(activeTool.category)}
              className="text-muted-foreground hover:text-primary transition-colors capitalize">
              {conf?.name}
            </AppLink>
            <ChevronRight className="w-3 h-3 text-border" />
            <span className="text-foreground font-medium truncate max-w-[240px]">{activeTool.name}</span>
          </nav>

          {/* Tool header, sits directly on the page background, separated by a border */}
          <div className="flex flex-wrap items-start justify-between gap-5 pb-6 border-b border-border">
            <div className="flex gap-4 items-start min-w-0">
              <div className={`cat-icon ${conf?.iconBg} w-[50px] h-[50px] rounded-[15px] shrink-0`}>
                <Icon className={conf?.iconColor} style={{ width: 24, height: 24 }} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading font-extrabold text-[22px] sm:text-[27px] leading-tight tracking-[-0.02em] text-foreground">
                    {activeTool.name}
                  </h1>
                  {!activeTool.isComingSoon && TOOL_EXPLANATIONS[activeTool.id] && (
                    <span className="relative inline-flex group/info">
                      <button
                        type="button"
                        tabIndex={0}
                        aria-label="How to use this tool"
                        className="w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <div className="pointer-events-none absolute z-20 top-full left-0 mt-2 w-72 max-w-[80vw] opacity-0 scale-95 origin-top-left transition-all duration-150 group-hover/info:opacity-100 group-hover/info:scale-100 group-focus-within/info:opacity-100 group-focus-within/info:scale-100">
                        <div className="rounded-xl border border-border bg-card shadow-float p-3.5">
                          <p className="text-[11px] font-bold text-foreground mb-1.5">How to use</p>
                          <p className="text-[12px] text-muted-foreground leading-relaxed">
                            {TOOL_EXPLANATIONS[activeTool.id]}
                          </p>
                        </div>
                      </div>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <AppLink
                    href={`/category/${activeTool.category}`}
                    onNavigate={() => onSelectCategory(activeTool.category)}
                    className={`badge capitalize border-transparent ${conf?.iconBg} ${conf?.iconColor}`}
                  >
                    {conf?.name}
                  </AppLink>
                  {activeTool.isPopular && (
                    <span className="badge badge-warning">
                      <Star className="w-3 h-3 fill-current" /> Popular
                    </span>
                  )}
                  <span className="badge badge-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
                    Local only
                  </span>
                </div>
                <p className="text-[13.5px] text-muted-foreground mt-2.5 leading-relaxed max-w-2xl">
                  {activeTool.description}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {LIVE_DEV_TOOL_IDS.has(activeTool.id) && <DevRunPill />}
              <FavoriteButton toolId={activeTool.id} toolName={activeTool.name} size="md" />
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-4 sm:gap-6">
            {/* Main column, tool body sits first, so the sidebar aligns beside it from the top */}
            <div className={stacked ? 'w-full flex flex-col gap-4 sm:gap-5' : 'flex-1 min-w-[300px] basis-[560px] flex flex-col gap-4 sm:gap-5'}>
              {renderTool()}

              {!activeTool.isComingSoon && seo?.useCases && seo.useCases.length > 0 && (
                <div className="rounded-2xl border bg-card border-border p-5 sm:p-6 shadow-card">
                  <span className="section-kicker mb-3">When to use this</span>
                  <ul className="space-y-2 mt-3">
                    {seo.useCases.map((useCase, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        <span className="text-[13px] text-foreground leading-relaxed">{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Privacy note */}
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-success/5 border border-success/20">
                <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                <p className="text-xs text-success leading-relaxed">
                  <strong>Free and private.</strong> Everything runs on your own device, with no account and no uploads.
                </p>
              </div>

              {/* Learn more / FAQs, lives in the main column so it fills the space below the
                  privacy note instead of leaving a gap when the sidebar runs taller. */}
              {!activeTool.isComingSoon && seo && (
                <div className="rounded-2xl border bg-card border-border p-6 sm:p-7">
                  <button
                    onClick={() => setLearnMoreOpen(o => !o)}
                    className="w-full flex items-center justify-between gap-3 text-left min-h-11"
                  >
                    <div>
                      <span className="section-kicker mb-2">Learn more</span>
                      <h2 className="font-heading text-[17px] sm:text-[18.5px] font-extrabold tracking-[-0.01em] text-foreground">
                        About {activeTool.name} &amp; FAQs
                      </h2>
                    </div>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-150 ${learnMoreOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {learnMoreOpen && (
                    <div className="mt-5">
                      <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-5">
                        {seo.intro}
                      </p>

                      {seo.faqs.length > 0 && (
                        <div className="space-y-2">
                          {seo.faqs.map((faq, i) => (
                            <ToolFaqItem key={i} question={faq.question} answer={faq.answer} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className={stacked
              ? 'w-full flex flex-wrap gap-4 sm:gap-5'
              : 'w-full lg:w-[340px] shrink-0 flex flex-col gap-4 sm:gap-5 lg:sticky lg:top-[82px] lg:self-start'}>
              {!activeTool.isComingSoon && seo?.steps && seo.steps.length > 0 && (
                <div className={sidebarCardCls}>
                  <span className="section-kicker mb-3">How it works</span>
                  <ol className="space-y-3 mt-3">
                    {seo.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">{step.title}</p>
                          <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-0.5">{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Related tools */}
              {related.length > 0 && (
                <div className={sidebarCardCls}>
                  <span className="section-kicker mb-3">More in {conf?.name}</span>
                  <div className="space-y-1 mt-3">
                    {related.map(tool => {
                      const RelatedIcon = resolveToolIcon(tool.icon, CategoryIcon);
                      return (
                      <AppLink
                        key={tool.id}
                        href={`/tool/${tool.id}`}
                        onNavigate={() => onSelectTool(tool.id)}
                        className="group w-full flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl text-left hover:bg-muted/60 transition-colors duration-150"
                      >
                        <div className={`cat-icon ${conf?.iconBg} w-8 h-8 rounded-lg shrink-0`}>
                          <RelatedIcon className={conf?.iconColor} style={{ width: 15, height: 15 }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[12.5px] font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                            {tool.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed">
                            {tool.description}
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </AppLink>
                      );
                    })}
                  </div>
                </div>
              )}

              {!activeTool.isComingSoon && seo?.tips && seo.tips.length > 0 && (
                <div className={sidebarCardCls}>
                  <span className="section-kicker mb-3">
                    <Lightbulb className="w-3 h-3 shrink-0" />
                    Pro tips
                  </span>
                  <ul className="space-y-2.5 mt-3">
                    {seo.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12.5px] text-muted-foreground leading-relaxed">
                        <span className="shrink-0 text-primary font-bold">·</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

        </>
      )}

      <AdBanner type="footer" />
      <Footer onOpenPage={onOpenPage} onOpenBlog={onOpenBlog} onSelectTool={onSelectTool} onSelectCategory={onSelectCategory} onGoHome={onGoHome} onOpenFaq={onOpenFaq} onOpenCategories={onOpenCategories} />
    </div>
  );
};
