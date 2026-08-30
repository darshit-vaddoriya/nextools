import React from 'react';
import {
  FileText, FileCode, FileSpreadsheet, Image, Video, Music,
  Code, Shield, Palette, Calculator, Globe, Cpu,
  Archive, Type, Presentation,
} from 'lucide-react';
import { ToolCategory } from '../types';

export type CategoryConfig = {
  id: ToolCategory;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  desc: string;
};

export const ALL_CATEGORIES: CategoryConfig[] = [
  { id: 'pdf',        name: 'PDF Tools',      icon: FileText,        iconColor: 'text-red-600 dark:text-red-400',          iconBg: 'bg-red-100 dark:bg-red-500/15',          desc: 'Merge, split, compress, OCR, convert' },
  { id: 'word',       name: 'Word & Office',  icon: FileCode,        iconColor: 'text-blue-600 dark:text-blue-400',      iconBg: 'bg-blue-100 dark:bg-blue-500/15',        desc: 'DOCX to PDF, HTML, Markdown, view' },
  { id: 'excel',      name: 'Excel & CSV',    icon: FileSpreadsheet, iconColor: 'text-green-600 dark:text-green-400',    iconBg: 'bg-green-100 dark:bg-green-500/15',      desc: 'Edit, clean, convert, merge spreadsheets' },
  { id: 'powerpoint', name: 'PowerPoint',     icon: Presentation,    iconColor: 'text-orange-600 dark:text-orange-400',  iconBg: 'bg-orange-100 dark:bg-orange-500/15',      desc: 'PPTX to PDF, images, merge, view' },
  { id: 'image',      name: 'Image Tools',    icon: Image,           iconColor: 'text-pink-600 dark:text-pink-400',      iconBg: 'bg-pink-100 dark:bg-pink-500/15',          desc: 'Compress, convert, crop, AI upscale' },
  { id: 'video',      name: 'Video Tools',    icon: Video,           iconColor: 'text-violet-600 dark:text-violet-400',  iconBg: 'bg-violet-100 dark:bg-violet-500/15',      desc: 'Trim, compress, convert, GIF maker' },
  { id: 'audio',      name: 'Audio Tools',    icon: Music,           iconColor: 'text-cyan-600 dark:text-cyan-400',      iconBg: 'bg-cyan-100 dark:bg-cyan-500/15',          desc: 'Cut, merge, convert, record audio' },
  { id: 'dev',        name: 'Developer',      icon: Code,            iconColor: 'text-slate-700 dark:text-slate-300',    iconBg: 'bg-slate-100 dark:bg-slate-500/15',        desc: 'JSON, JWT, Base64, formatters' },
  { id: 'ai',         name: 'AI Browser',     icon: Cpu,             iconColor: 'text-purple-600 dark:text-purple-400',  iconBg: 'bg-purple-100 dark:bg-purple-500/15',      desc: 'On-device AI - no upload ever' },
  { id: 'security',   name: 'Security',       icon: Shield,          iconColor: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-500/15', desc: 'Passwords, hashes, encryption' },
  { id: 'text',       name: 'Text Utilities', icon: Type,            iconColor: 'text-teal-600 dark:text-teal-400',      iconBg: 'bg-teal-100 dark:bg-teal-500/15',          desc: 'Count, clean, sort, convert text' },
  { id: 'color',      name: 'Color & CSS',    icon: Palette,         iconColor: 'text-fuchsia-600 dark:text-fuchsia-400', iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-500/15',   desc: 'Converter, gradients, palettes' },
  { id: 'utility',    name: 'Calculators',    icon: Calculator,      iconColor: 'text-sky-600 dark:text-sky-400',        iconBg: 'bg-sky-100 dark:bg-sky-500/15',            desc: 'Unit, currency, BMI, GST, EMI' },
  { id: 'web',        name: 'Web Tools',      icon: Globe,           iconColor: 'text-indigo-600 dark:text-indigo-400',  iconBg: 'bg-indigo-100 dark:bg-indigo-500/15',      desc: 'URL, MIME, encoding, binary' },
  { id: 'archive',    name: 'Archive Tools',  icon: Archive,         iconColor: 'text-amber-600 dark:text-amber-400',    iconBg: 'bg-amber-100 dark:bg-amber-500/15',        desc: 'ZIP, TAR, 7Z extract & create' },
];

export const FEATURED_CATEGORIES: ToolCategory[] = ['pdf', 'image', 'dev', 'ai', 'video'];

export const QUICK_CATEGORIES: ToolCategory[] = ['pdf', 'image', 'dev', 'ai', 'video', 'text'];
