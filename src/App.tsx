import React, { useState, useEffect, useCallback } from 'react';
import { Header }          from './components/Header';
import { CommandPalette }  from './components/CommandPalette';
import { AdBanner }        from './components/AdBanner';
import { Footer }          from './components/Footer';
import { AllToolsView }    from './components/AllToolsView';
import { PrivacyPolicy }   from './pages/PrivacyPolicy';
import { ToolCategory }    from './types';
import { TOOLS }           from './config/tools';
import { PLANNED_FEATURES } from './config/toolFeatures';
import { TOOL_EXPLANATIONS } from './config/toolExplanations';
import {
  updateHomeMeta, updateToolMeta, updateCategoryMeta, updatePrivacyMeta,
  updateAllToolsMeta, parseRoute, buildPath,
} from './utils/seo';
import { trackPageView } from './utils/analytics';
import {
  FileText, FileSpreadsheet, Image, Video, Music,
  Code, Shield, Palette, Calculator, Globe, Cpu,
  Archive, Type, Presentation, Search,
  ChevronRight, ArrowLeft, Star, Clock,
  CheckCircle2, ShieldCheck, ArrowRight, Zap, Info, Loader2
} from 'lucide-react';

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
import { WordTools }              from './tools/WordTools';
import { ToolPlaceholder }        from './tools/ToolPlaceholder';

// ─── Category definitions — flat icon colors, no gradients ──
const ALL_CATEGORIES: {
  id: ToolCategory;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  desc: string;
  count?: number;
}[] = [
  { id: 'pdf',        name: 'PDF Tools',      icon: FileText,        iconColor: 'text-red-600 dark:text-red-400',       iconBg: 'bg-red-100 dark:bg-red-500/15',       desc: '1 tool - merge PDFs locally' },
  { id: 'word',       name: 'Word & Office',  icon: FileText,        iconColor: 'text-blue-600 dark:text-blue-400',     iconBg: 'bg-blue-100 dark:bg-blue-500/15',     desc: '10 tools - DOCX to PDF, HTML, Markdown, view' },
  { id: 'excel',      name: 'Excel & CSV',    icon: FileSpreadsheet, iconColor: 'text-green-600 dark:text-green-400',   iconBg: 'bg-green-100 dark:bg-green-500/15',   desc: '0 tools - coming soon' },
  { id: 'powerpoint', name: 'PowerPoint',     icon: Presentation,    iconColor: 'text-orange-600 dark:text-orange-400', iconBg: 'bg-orange-100 dark:bg-orange-500/15', desc: '0 tools - coming soon' },
  { id: 'image',      name: 'Image Tools',    icon: Image,           iconColor: 'text-pink-600 dark:text-pink-400',     iconBg: 'bg-pink-100 dark:bg-pink-500/15',     desc: '16 tools - compress, convert, crop, AI upscale' },
  { id: 'video',      name: 'Video Tools',    icon: Video,           iconColor: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-100 dark:bg-violet-500/15', desc: '0 tools - coming soon' },
  { id: 'audio',      name: 'Audio Tools',    icon: Music,           iconColor: 'text-cyan-600 dark:text-cyan-400',     iconBg: 'bg-cyan-100 dark:bg-cyan-500/15',     desc: '0 tools - coming soon' },
  { id: 'dev',        name: 'Developer',      icon: Code,            iconColor: 'text-slate-700 dark:text-slate-300',   iconBg: 'bg-slate-100 dark:bg-slate-500/15',   desc: '5 tools - JSON, JWT, Base64, UUID, hashes' },
  { id: 'ai',         name: 'AI Browser',     icon: Cpu,             iconColor: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-500/15', desc: '0 tools - coming soon' },
  { id: 'security',   name: 'Security',       icon: Shield,          iconColor: 'text-emerald-600 dark:text-emerald-400',iconBg: 'bg-emerald-100 dark:bg-emerald-500/15',desc:'1 tool - password generator' },
  { id: 'text',       name: 'Text Utilities', icon: Type,            iconColor: 'text-teal-600 dark:text-teal-400',     iconBg: 'bg-teal-100 dark:bg-teal-500/15',     desc: '4 tools - count, case, regex, analytics' },
  { id: 'color',      name: 'Color & CSS',    icon: Palette,         iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-500/15',desc:'1 tool - color converter' },
  { id: 'utility',    name: 'Calculators',    icon: Calculator,      iconColor: 'text-sky-600 dark:text-sky-400',       iconBg: 'bg-sky-100 dark:bg-sky-500/15',       desc: '0 tools - coming soon' },
  { id: 'web',        name: 'Web Tools',      icon: Globe,           iconColor: 'text-indigo-600 dark:text-indigo-400', iconBg: 'bg-indigo-100 dark:bg-indigo-500/15', desc: '0 tools - coming soon' },
  { id: 'archive',    name: 'Archive Tools',  icon: Archive,         iconColor: 'text-amber-600 dark:text-amber-400',   iconBg: 'bg-amber-100 dark:bg-amber-500/15',   desc: '0 tools - coming soon' },
];

// ─── Lazy-loaded heavy tools (tesseract.js / qrcode) ─────────
const HeavyToolFallback = () => (
  <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-8 flex items-center justify-center">
    <div className="flex items-center gap-2.5 text-[13px] dark:text-zinc-400 text-slate-500">
      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
      Loading tool…
    </div>
  </div>
);

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

const lazyToolHeavy = <K extends 'QrGeneratorTool' | 'OcrImageTool' | 'AiUpscalerTool'>(
  exportName: K,
): React.FC =>
  lazyComponent(() => import('./tools/image/HeavyImageTools'), exportName);

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
  'text-counter':         TextCounter,
  'color-picker':         ColorPicker,
  'color-converter':      ColorPicker,
  'pdf-merge':            lazyTool('PdfMergeTool'),
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
  'qr-generator':         lazyToolHeavy('QrGeneratorTool'),
  'qr-code-generator':    lazyToolHeavy('QrGeneratorTool'),
  'ocr-image':            lazyToolHeavy('OcrImageTool'),
  'ai-upscaler':          lazyToolHeavy('AiUpscalerTool'),
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
  const [isDarkMode,          setIsDarkMode]          = useState(() => {
    try { return localStorage.getItem('nexttool-theme') === 'dark'; } catch { return false; }
  });
  const [currentView,         setCurrentView]         = useState<'home'|'tool'|'category'|'privacy'|'all'>(initRoute.view);
  const [activeCategoryView,  setActiveCategoryView]  = useState<ToolCategory|null>(initRoute.category ?? null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try { localStorage.setItem('nexttool-theme', isDarkMode ? 'dark' : 'light'); } catch { /* ignore */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDarkMode ? '#0a0a0f' : '#ffffff');
  }, [isDarkMode]);

  const syncMeta = useCallback(() => {
    if (currentView === 'privacy') updatePrivacyMeta();
    else if (currentView === 'all') updateAllToolsMeta();
    else if (currentView === 'tool' && activeToolId) updateToolMeta(activeToolId);
    else if (currentView === 'category' && activeCategoryView) updateCategoryMeta(activeCategoryView);
    else updateHomeMeta();
  }, [currentView, activeToolId, activeCategoryView]);

  useEffect(() => { syncMeta(); }, [syncMeta]);

  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackPageView(window.location.pathname, document.title);
  }, [currentView, activeToolId, activeCategoryView]);

  useEffect(() => {
    const onPopState = () => {
      const route = parseRoute(window.location.pathname);
      setCurrentView(route.view);
      setActiveToolId(route.toolId ?? '');
      setActiveCategoryView(route.category ?? null);
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

  const openPrivacy = () => {
    setCurrentView('privacy');
    navigate('privacy');
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

  const renderTool = () => {
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
    <div className="relative min-h-screen flex flex-col dark:text-zinc-100 text-slate-900">
      {/* Ambient aurora background */}
      <div className="fixed inset-0 -z-10 aurora-bg pointer-events-none" aria-hidden="true" />

      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(p => !p)}
        onGoHome={goHome}
        onOpenPrivacy={openPrivacy}
        onOpenCategories={scrollToCategories}
        onOpenAllTools={openAllTools}
        currentView={currentView}
      />
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={openTool}
      />

      <main className="flex-1">
        {currentView === 'privacy'
          ? <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8"><PrivacyPolicy onBack={goHome} /></div>
          : currentView === 'tool'
          ? <ToolView activeTool={activeTool} onBack={goHome} renderTool={renderTool} categories={ALL_CATEGORIES}
              onOpenPrivacy={openPrivacy} onSelectTool={openTool} onSelectCategory={openCategory} />
          : currentView === 'category' && activeCategoryView
          ? <CategoryView cat={activeCategoryView} onSelectTool={openTool} onBack={goHome} categories={ALL_CATEGORIES} />
          : currentView === 'all'
          ? <AllToolsView onSelectTool={openTool} onBack={goHome} categories={ALL_CATEGORIES} />
          : <HomeView onSelectTool={openTool} onSelectCategory={openCategory} onOpenSearch={() => setIsSearchOpen(true)} />
        }
      </main>

      {currentView !== 'tool' && (
        <Footer onOpenPrivacy={openPrivacy} onSelectTool={openTool} onSelectCategory={openCategory} />
      )}
    </div>
  );
};

// ─── HOME VIEW ───────────────────────────────────────────────
const QUICK_TOOLS = [
  { id: 'image-compressor',  label: 'Image Compressor',  desc: 'Shrink images up to 90%' },
  { id: 'pdf-merge',         label: 'PDF Merge',         desc: 'Combine PDF files' },
  { id: 'qr-generator',      label: 'QR Generator',      desc: 'Create QR codes' },
  { id: 'ocr-image',         label: 'Image to Text',     desc: 'Extract text with OCR' },
  { id: 'json-formatter',    label: 'JSON Formatter',    desc: 'Format & validate' },
  { id: 'password-generator',label: 'Password Generator',desc: 'Strong passwords' },
];

const SEARCH_HINTS = ['Image Compress', 'PDF Merge', 'QR Generator', 'OCR'];

const HomeView: React.FC<{
  onSelectTool: (id: string) => void;
  onSelectCategory: (cat: ToolCategory | 'all') => void;
  onOpenSearch: () => void;
}> = ({ onSelectTool, onSelectCategory, onOpenSearch }) => {
  const popular = TOOLS.filter(t => t.isPopular).slice(0, 8);

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

  const toolCat = (id: string) => TOOLS.find(t => t.id === id)?.category;

  return (
    <div className="relative">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative dark:bg-[#0d0d14] bg-white border-b dark:border-white/[0.06] border-slate-200 overflow-hidden">
        <div className="hero-accent" />
        <div className="hero-grid" />
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-16 relative z-10">

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-center">

            {/* Left — copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full
                dark:bg-indigo-500/[0.1] dark:border dark:border-indigo-500/20 dark:text-indigo-400
                bg-indigo-50 border border-indigo-200 text-indigo-700 text-[12px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 pulse-dot inline-block" />
                {TOOLS.length} free tools
              </div>

              <h1 className="text-[34px] sm:text-[46px] font-bold dark:text-white text-slate-900 leading-[1.12] tracking-[-0.03em]">
                Free tools for PDF, image and{' '}
                <span className="gradient-text">developer tasks.</span>
              </h1>

              <p className="mt-4 text-[15px] dark:text-zinc-400 text-slate-600 leading-[1.75] max-w-xl mx-auto lg:mx-0">
                Merge PDFs, compress images, format JSON and more. Files are handled
                right in your browser, so nothing gets uploaded to any server.
              </p>

              {/* Search bar */}
              <button
                onClick={onOpenSearch}
                aria-label="Search all tools"
                className="mt-7 w-full max-w-lg mx-auto lg:mx-0 flex items-center gap-3 h-12 sm:h-14 px-4 rounded-2xl border text-[14px]
                  dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-zinc-400
                  bg-slate-50 border-slate-200 text-slate-500
                  hover:border-indigo-400 dark:hover:border-indigo-500/40
                  transition-all duration-150 shadow-sm hover:shadow-lg hover:shadow-indigo-500/[0.08]"
              >
                <Search className="w-4 h-4 shrink-0 text-indigo-500" />
                <span className="flex-1 text-left">Search {TOOLS.length} tools - PDF, Image, JSON…</span>
                <kbd className="hidden sm:block px-2 py-0.5 rounded text-[10px] font-mono
                  dark:bg-white/[0.06] dark:border-white/[0.08] dark:text-zinc-600
                  bg-white border border-slate-200 text-slate-400">⌘K</kbd>
              </button>

              {/* Quick hint chips */}
              <div className="mt-4 flex items-center justify-center lg:justify-start flex-wrap gap-2">
                <span className="text-[11px] font-medium dark:text-zinc-600 text-slate-400">Popular:</span>
                {SEARCH_HINTS.map(hint => (
                  <button
                    key={hint}
                    onClick={onOpenSearch}
                    className="px-2.5 py-1 rounded-full text-[11.5px] font-medium
                      dark:bg-white/[0.05] dark:border dark:border-white/[0.08] dark:text-zinc-400 dark:hover:text-indigo-400 dark:hover:border-indigo-500/25
                      bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300
                      transition-colors"
                  >
                    {hint}
                  </button>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-6 flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                <button onClick={() => onSelectCategory('all')} className="btn-primary px-5 py-2.5 text-[14px] rounded-lg">
                  Browse all tools <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => onSelectCategory('dev')} className="btn-secondary px-5 py-2.5 text-[14px] rounded-lg">
                  Developer Tools
                </button>
              </div>
            </div>

            {/* Right — Quick Access panel (desktop) */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full
                  bg-indigo-500/[0.15] blur-3xl pointer-events-none" />

                <div className="relative rounded-2xl border p-5
                  dark:bg-white/[0.04] dark:border-white/[0.1]
                  bg-white/80 border-slate-200 backdrop-blur-xl
                  shadow-2xl dark:shadow-black/40 dark:shadow-indigo-500/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Zap className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-[13px] font-semibold dark:text-white text-slate-900">Quick Access</span>
                    </div>
                    <span className="text-[10.5px] font-medium uppercase tracking-wide dark:text-zinc-600 text-slate-400">
                      {TOOLS.length} tools
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    {QUICK_TOOLS.map(t => {
                      const cat = toolCat(t.id);
                      const conf = ALL_CATEGORIES.find(c => c.id === cat);
                      const Icon = conf?.icon ?? FileText;
                      return (
                        <button
                          key={t.id}
                          onClick={() => onSelectTool(t.id)}
                          className="group w-full flex items-center gap-3 p-2.5 rounded-xl border border-transparent
                            dark:hover:bg-white/[0.05] dark:hover:border-white/[0.1]
                            hover:bg-white hover:border-slate-200 hover:shadow-sm
                            transition-all duration-150"
                        >
                          <div className={`cat-icon w-9 h-9 ${conf?.iconBg}`}>
                            <Icon style={{ width: 16, height: 16 }} className={conf?.iconColor} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="text-[12.5px] font-semibold dark:text-zinc-200 text-slate-800 leading-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                              {t.label}
                            </div>
                            <div className="text-[11px] dark:text-zinc-600 text-slate-400 mt-0.5 truncate">{t.desc}</div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150" />
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => onSelectCategory('all')}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border text-[12.5px] font-semibold
                      dark:bg-indigo-500/[0.1] dark:border-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/[0.16]
                      bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    Browse all {TOOLS.length} tools <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stat strip */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { n: String(TOOLS.length), t: 'Tools' },
              { n: String(ALL_CATEGORIES.filter(c => TOOLS.some(t => t.category === c.id)).length), t: 'Categories' },
              { n: '100%', t: 'In-browser' },
              { n: '0',    t: 'Uploads' },
            ].map(s => (
              <div key={s.t} className="stat-pill">
                <span className="text-[22px] sm:text-[24px] font-bold dark:text-white text-slate-900 tabular-nums leading-none">{s.n}</span>
                <span className="text-[10.5px] dark:text-zinc-500 text-slate-400 mt-1.5 uppercase tracking-wide font-medium">{s.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 space-y-16">

        {/* ── Categories ─────────────────────────────────── */}
        <section id="categories-section" aria-labelledby="categories-heading" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="section-kicker mb-2">Explore</span>
              <h2 id="categories-heading" className="text-[20px] font-bold dark:text-white text-slate-900 tracking-[-0.02em]">Browse by Category</h2>
              <p className="text-[13px] dark:text-zinc-500 text-slate-400 mt-1">{TOOLS.length} tools across {ALL_CATEGORIES.filter(c => TOOLS.some(t => t.category === c.id)).length} categories</p>
            </div>
            <button onClick={onOpenSearch} className="btn-ghost text-[13px] hidden sm:flex">
              Search tools <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ALL_CATEGORIES.filter(cat => TOOLS.some(t => t.category === cat.id)).map((cat, idx) => {
              const Icon = cat.icon;
              const count = TOOLS.filter(t => t.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className="cat-card group flex flex-col p-4 rounded-xl border text-left
                    dark:bg-white/[0.03] dark:border-white/[0.07]
                    dark:hover:bg-white/[0.06] dark:hover:border-indigo-500/20
                    bg-white border-slate-200 hover:border-indigo-200
                    transition-all duration-150 fade-up"
                  style={{ animationDelay: `${idx * 25}ms` }}
                >
                  <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className={`cat-icon w-10 h-10 rounded-xl ${cat.iconBg} mb-3`}>
                    <Icon style={{ width: 19, height: 19 }} className={cat.iconColor} />
                  </div>
                  <div className="text-[13px] font-semibold dark:text-zinc-200 text-slate-800 mb-0.5 leading-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </div>
                  <div className="mt-auto pt-2 flex items-center gap-1">
                    <span className="text-[11px] dark:text-zinc-600 text-slate-400 font-medium">{count} tools</span>
                    <ChevronRight className="w-3 h-3 text-indigo-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ml-auto" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Recently used ──────────────────────────────── */}
        {recentTools.length > 0 && (
          <section aria-labelledby="recent-heading" className="fade-up">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="cat-icon dark:bg-white/[0.06] bg-slate-100">
                  <Clock className="w-4 h-4 text-indigo-500" />
                </span>
                <div>
                  <h2 id="recent-heading" className="text-[20px] font-bold dark:text-white text-slate-900 tracking-[-0.02em]">Recently used</h2>
                  <p className="text-[13px] dark:text-zinc-500 text-slate-400 mt-0.5">Stored locally on this device</p>
                </div>
              </div>
              <button onClick={() => {
                try { localStorage.removeItem('nexttool-recent'); setRecentIds([]); } catch { /* ignore */ }
              }} className="btn-ghost text-[12px] hidden sm:flex">
                Clear <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentTools.map((tool, idx) => {
                const catConf = ALL_CATEGORIES.find(c => c.id === tool.category);
                const Icon = catConf?.icon ?? FileText;
                return (
                  <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className="tool-card group flex flex-col p-4 rounded-xl border text-left
                      dark:bg-white/[0.03] dark:border-white/[0.07]
                      dark:hover:bg-white/[0.06] dark:hover:border-indigo-500/25
                      bg-white border-slate-200 hover:border-indigo-200
                      transition-all duration-150 fade-up"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`cat-icon w-10 h-10 rounded-xl ${catConf?.iconBg}`}>
                        <Icon style={{ width: 17, height: 17 }} className={catConf?.iconColor} />
                      </div>
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 mt-0.5" />
                    </div>
                    <div className="text-[13px] font-semibold dark:text-zinc-200 text-slate-800 leading-snug mb-1.5 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      {tool.name}
                    </div>
                    <div className="text-[11.5px] dark:text-zinc-600 text-slate-400 leading-relaxed line-clamp-2 flex-1">
                      {tool.description}
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px]">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${catConf?.iconBg} ${catConf?.iconColor}`}>
                        {tool.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-500 dark:text-indigo-400 ml-auto">
                        Open <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Popular tools ──────────────────────────────── */}
        <section aria-labelledby="popular-heading">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="section-kicker mb-2">Popular</span>
              <h2 id="popular-heading" className="text-[20px] font-bold dark:text-white text-slate-900 tracking-[-0.02em]">Popular Tools</h2>
              <p className="text-[13px] dark:text-zinc-500 text-slate-400 mt-1">The most-used tools</p>
            </div>
            <button onClick={onOpenSearch} className="btn-ghost text-[13px] hidden sm:flex">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {popular.map((tool, idx) => {
              const catConf = ALL_CATEGORIES.find(c => c.id === tool.category);
              const Icon = catConf?.icon ?? FileText;
              return (
                <button
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className="tool-card group flex flex-col p-4 rounded-xl border text-left
                    dark:bg-white/[0.03] dark:border-white/[0.07]
                    dark:hover:bg-white/[0.06] dark:hover:border-indigo-500/25
                    bg-white border-slate-200 hover:border-indigo-200
                    transition-all duration-150 fade-up"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`cat-icon w-10 h-10 rounded-xl ${catConf?.iconBg}`}>
                      <Icon style={{ width: 17, height: 17 }} className={catConf?.iconColor} />
                    </div>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mt-0.5" />
                  </div>
                  <div className="text-[13px] font-semibold dark:text-zinc-200 text-slate-800 leading-snug mb-1.5 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </div>
                  <div className="text-[11.5px] dark:text-zinc-600 text-slate-400 leading-relaxed line-clamp-2 flex-1">
                    {tool.description}
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px]">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${catConf?.iconBg} ${catConf?.iconColor}`}>
                      {tool.category}
                    </span>
                    <span className="ml-auto flex items-center gap-1 dark:text-emerald-500/70 text-emerald-600 text-[10px] font-medium">
                      <CheckCircle2 className="w-3 h-3" /> local
                    </span>
                  </div>
                </button>
              );
            })}
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
          <h1 className="text-xl font-semibold dark:text-white text-slate-900">{conf?.name}</h1>
          <p className="text-[13px] dark:text-zinc-500 text-slate-500 mt-0.5">{tools.length} tools available</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className="group flex flex-col p-4 rounded-xl border text-left
              dark:bg-dark-card dark:border-dark-border dark:hover:border-zinc-600
              bg-white border-slate-200 hover:border-slate-300
              transition-colors duration-150"
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className={`cat-icon ${conf?.iconBg} w-8 h-8 rounded-lg`}>
                <Icon className={conf?.iconColor} style={{ width: 16, height: 16 }} />
              </div>
              {tool.isPopular && (
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
              )}
            </div>
            <div className="text-[13px] font-medium dark:text-zinc-200 text-slate-800 leading-snug mb-1.5 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
              {tool.name}
            </div>
            <div className="text-[11.5px] dark:text-zinc-600 text-slate-400 line-clamp-2 leading-relaxed">
              {tool.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── TOOL VIEW ───────────────────────────────────────────────
const ToolView: React.FC<{
  activeTool: (typeof TOOLS)[0] | undefined;
  onBack: () => void;
  renderTool: () => React.ReactNode;
  categories: typeof ALL_CATEGORIES;
  onOpenPrivacy: () => void;
  onSelectTool: (id: string) => void;
  onSelectCategory: (cat: ToolCategory | 'all') => void;
}> = ({ activeTool, onBack, renderTool, categories, onOpenPrivacy, onSelectTool, onSelectCategory }) => {
  const conf = categories.find(c => c.id === activeTool?.category);
  const Icon = conf?.icon ?? FileText;
  const related = activeTool
    ? TOOLS.filter(t => t.category === activeTool.category && t.id !== activeTool.id).slice(0, 4)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5 fade-in">
      <AdBanner type="leaderboard" />

      {activeTool && (
        <>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[12px] flex-wrap" aria-label="Breadcrumb">
            <button onClick={onBack} className="dark:text-zinc-500 dark:hover:text-zinc-300 text-slate-400 hover:text-slate-700 transition-colors">
              Home
            </button>
            <ChevronRight className="w-3 h-3 dark:text-zinc-700 text-slate-300" />
            <button onClick={() => onSelectCategory(activeTool.category)}
              className="dark:text-zinc-500 dark:hover:text-indigo-400 text-slate-400 hover:text-indigo-600 transition-colors capitalize">
              {conf?.name}
            </button>
            <ChevronRight className="w-3 h-3 dark:text-zinc-700 text-slate-300" />
            <span className="dark:text-zinc-300 text-slate-700 font-medium truncate max-w-[240px]">{activeTool.name}</span>
          </nav>

          {/* Professional tool header */}
          <div className="relative overflow-hidden rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className={`cat-icon ${conf?.iconBg} w-12 h-12 rounded-xl`}>
                <Icon className={conf?.iconColor} style={{ width: 24, height: 24 }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold dark:text-white text-slate-900 tracking-[-0.02em]">
                    {activeTool.name}
                  </h1>
                  <button onClick={() => onSelectCategory(activeTool.category)} className="badge badge-indigo capitalize">
                    {conf?.name}
                  </button>
                  {activeTool.isPopular && (
                    <span className="badge badge-amber">
                      <Star className="w-3 h-3 fill-amber-400" /> Popular
                    </span>
                  )}
                </div>
                <p className="text-[13px] dark:text-zinc-400 text-slate-500 mt-1.5 leading-relaxed max-w-2xl">
                  {activeTool.description}
                </p>
              </div>
              <div className="shrink-0">
                <span className="badge badge-green">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                  Local only
                </span>
              </div>
            </div>
          </div>

          {TOOL_EXPLANATIONS[activeTool.id] && (
            <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-5 sm:p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-[15px] font-bold dark:text-white text-slate-900 tracking-[-0.02em] mb-2">
                <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                What does this tool do?
              </h2>
              <p className="text-[13px] dark:text-zinc-400 text-slate-600 leading-relaxed">
                {TOOL_EXPLANATIONS[activeTool.id]}
              </p>
            </div>
          )}

          {renderTool()}

          {/* Privacy note */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl dark:bg-emerald-500/[0.06] bg-emerald-50 border dark:border-emerald-500/20 border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs dark:text-emerald-400 text-emerald-700 leading-relaxed">
              <strong>Free and private.</strong> Everything runs on your own device, with no account and no uploads.
            </p>
          </div>

          {/* Related tools */}
          {related.length > 0 && (
            <section aria-label="Related tools">
              <h2 className="text-[15px] font-bold dark:text-white text-slate-900 tracking-[-0.02em] mb-3">
                More in {conf?.name}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {related.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className="group p-3 rounded-xl border text-left
                      dark:bg-white/[0.02] dark:border-white/[0.07] dark:hover:bg-white/[0.06] dark:hover:border-indigo-500/25
                      bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all duration-150"
                  >
                    <div className="text-[12px] font-semibold dark:text-zinc-200 text-slate-800 leading-snug line-clamp-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      {tool.name}
                    </div>
                    <div className="text-[10.5px] dark:text-zinc-600 text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <AdBanner type="footer" />
      <Footer onOpenPrivacy={onOpenPrivacy} onSelectTool={onSelectTool} onSelectCategory={onSelectCategory} />
    </div>
  );
};
