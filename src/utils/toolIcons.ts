import type { ElementType } from 'react';
import {
  BarChart2, Binary, BookOpen, Code2, Crop, EyeOff, FileInput, FileJson,
  FileMinus2, FileOutput, FilePlus2, FileSearch, FileText, FileType,
  FlipHorizontal, Focus, GitCompare, GripVertical, Hash, Image, ImageDown,
  Info, KeyRound, Lock, Maximize2, Minimize2, Paintbrush, Palette, PenLine,
  PenTool, QrCode, RefreshCw, Regex, RemoveFormatting, RotateCw, ScanText,
  Scissors, ShieldCheck, ShieldOff, SlidersHorizontal, Sparkles, Stamp,
  SunMedium, Trash2, Type, ZoomIn,
} from 'lucide-react';

export const TOOL_ICONS: Record<string, ElementType> = {
  BarChart2, Binary, BookOpen, Code2, Crop, EyeOff, FileInput, FileJson,
  FileMinus2, FileOutput, FilePlus2, FileSearch, FileText, FileType,
  FlipHorizontal, Focus, GitCompare, GripVertical, Hash, Image, ImageDown,
  Info, KeyRound, Lock, Maximize2, Minimize2, Paintbrush, Palette, PenLine,
  PenTool, QrCode, RefreshCw, Regex, RemoveFormatting, RotateCw, ScanText,
  Scissors, ShieldCheck, ShieldOff, SlidersHorizontal, Sparkles, Stamp,
  SunMedium, Trash2, Type, ZoomIn,
};

export const resolveToolIcon = (name: string, fallback: ElementType): ElementType =>
  TOOL_ICONS[name] ?? fallback;
