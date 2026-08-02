import React from 'react';
import { ToolPlaceholder } from './ToolPlaceholder';
import { TOOLS } from '../config/tools';

interface Props { toolId: string; }

const META: Record<string, { features: string[] }> = {
  'docx-to-pdf':        { features: ['Preserve fonts and layout','Handle multi-page documents','Batch convert multiple files','Download as PDF instantly'] },
  'docx-to-html':       { features: ['Extract formatted HTML','Preserve headings and lists','Handle tables and images','Clean semantic output'] },
  'docx-to-markdown':   { features: ['Convert headings to # syntax','Handle bold, italic, links','Preserve lists and tables','Download .md file'] },
  'docx-to-txt':        { features: ['Strip all formatting','Extract plain text only','Handle all DOCX versions','Fast client-side processing'] },
  'html-to-docx':       { features: ['Convert HTML to styled DOCX','Preserve CSS formatting','Handle nested structures','Download .docx file'] },
  'markdown-to-docx':   { features: ['Parse full Markdown spec','Apply Word styles','Handle tables and code blocks','Download .docx file'] },
  'word-viewer':        { features: ['View DOCX without Office','Paginated view','Search within document','Print-ready layout'] },
  'word-metadata':      { features: ['Show author and dates','Revision history','Custom properties','Edit and re-save metadata'] },
  'word-compare':       { features: ['Side-by-side diff view','Highlight insertions/deletions','Export comparison report','Support all DOCX versions'] },
  'word-remove-format': { features: ['Strip all inline styles','Remove comments and tracked changes','Preserve text content','Download clean file'] },
};

export const WordTools: React.FC<Props> = ({ toolId }) => {
  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool) return null;
  const meta = META[toolId] ?? { features: [] };
  return (
    <ToolPlaceholder
      toolName={tool.name}
      toolDescription={tool.description}
      category="Word"
      features={meta.features}
      gradientFrom="from-blue-500"
      gradientTo="to-indigo-600"
    />
  );
};
