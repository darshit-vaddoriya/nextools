import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Heading1, Heading2,
  Italic, List, ListOrdered, Redo2, Trash2, Underline, Undo2, type LucideIcon,
} from 'lucide-react';
import { blocksToText, countWords, parseBlocks, type Block } from '../../lib/richText';

export interface RichTextEditorHandle {
  getBlocks: () => Block[];
  getText: () => string;
  clear: () => void;
}

interface RichTextEditorProps {
  placeholder?: string;
  /** Reports live word and character counts as the user types. */
  onStatsChange?: (stats: { words: number; characters: number }) => void;
  className?: string;
}

interface ToolbarButton {
  command: string;
  value?: string;
  icon: LucideIcon;
  label: string;
  /** Query the current selection so the button can show as active. */
  stateCommand?: string;
}

const GROUPS: ToolbarButton[][] = [
  [
    { command: 'bold', icon: Bold, label: 'Bold', stateCommand: 'bold' },
    { command: 'italic', icon: Italic, label: 'Italic', stateCommand: 'italic' },
    { command: 'underline', icon: Underline, label: 'Underline', stateCommand: 'underline' },
  ],
  [
    { command: 'formatBlock', value: 'h1', icon: Heading1, label: 'Heading' },
    { command: 'formatBlock', value: 'h2', icon: Heading2, label: 'Subheading' },
  ],
  [
    { command: 'insertUnorderedList', icon: List, label: 'Bulleted list', stateCommand: 'insertUnorderedList' },
    { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered list', stateCommand: 'insertOrderedList' },
  ],
  [
    { command: 'justifyLeft', icon: AlignLeft, label: 'Align left', stateCommand: 'justifyLeft' },
    { command: 'justifyCenter', icon: AlignCenter, label: 'Align center', stateCommand: 'justifyCenter' },
    { command: 'justifyRight', icon: AlignRight, label: 'Align right', stateCommand: 'justifyRight' },
  ],
];

/**
 * A formatting editor whose output maps exactly onto what the PDF renderer
 * can draw: bold, italic, underline, two heading levels, lists and
 * alignment. Nothing in the toolbar produces styling the PDF would silently
 * drop.
 *
 * Built on contentEditable + execCommand. execCommand is deprecated but
 * remains the only broadly-supported way to get native undo, caret handling
 * and IME behaviour without pulling in an editor framework.
 */
export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  ({ placeholder = 'Start typing, or paste your text…', onStatsChange, className = '' }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [activeMarks, setActiveMarks] = useState<Record<string, boolean>>({});
    const [isEmpty, setIsEmpty] = useState(true);

    const refreshState = useCallback(() => {
      const next: Record<string, boolean> = {};
      GROUPS.flat().forEach((button) => {
        if (!button.stateCommand) return;
        try {
          next[button.stateCommand] = document.queryCommandState(button.stateCommand);
        } catch { /* command unsupported in this browser */ }
      });
      setActiveMarks(next);
    }, []);

    const handleInput = useCallback(() => {
      const root = editorRef.current;
      if (!root) return;
      // Strip zero-width spaces contentEditable leaves behind.
      const text = root.innerText.replace(/\u200B/g, '');
      setIsEmpty(text.trim().length === 0);
      onStatsChange?.({ words: countWords(text), characters: text.replace(/\n/g, '').length });
      refreshState();
    }, [onStatsChange, refreshState]);

    useImperativeHandle(ref, () => ({
      getBlocks: () => (editorRef.current ? parseBlocks(editorRef.current) : []),
      getText: () => (editorRef.current ? blocksToText(parseBlocks(editorRef.current)) : ''),
      clear: () => {
        if (!editorRef.current) return;
        editorRef.current.innerHTML = '';
        handleInput();
      },
    }), [handleInput]);

    /* Paragraphs rather than bare <div>s make the parser's job predictable. */
    useEffect(() => {
      try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch { /* ignore */ }
    }, []);

    const exec = (command: string, value?: string) => {
      editorRef.current?.focus();
      try {
        // formatBlock toggles back to a paragraph when already applied.
        if (command === 'formatBlock' && value) {
          const current = document.queryCommandValue('formatBlock').toLowerCase();
          document.execCommand('formatBlock', false, current === value ? 'p' : value);
        } else {
          document.execCommand(command, false, value);
        }
      } catch { /* ignore */ }
      handleInput();
    };

    return (
      <div className={`rounded-[var(--radius-lg)] border border-border bg-card overflow-hidden ${className}`}>
        {/* ── Toolbar ── */}
        <div
          role="toolbar"
          aria-label="Text formatting"
          aria-controls="rich-text-surface"
          className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-container-low px-2 py-2"
        >
          {GROUPS.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupIndex > 0 && <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />}
              {group.map(({ command, value, icon: Icon, label, stateCommand }) => {
                const isActive = stateCommand ? Boolean(activeMarks[stateCommand]) : false;
                return (
                  <button
                    key={label}
                    type="button"
                    // Keep the selection, mousedown would blur the editor first.
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => exec(command, value)}
                    aria-label={label}
                    aria-pressed={stateCommand ? isActive : undefined}
                    title={label}
                    className={[
                      'grid place-items-center w-8 h-8 rounded-[var(--radius-sm)]',
                      'transition-colors duration-[var(--motion-fast)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-surface-container-high hover:text-foreground',
                    ].join(' ')}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </button>
                );
              })}
            </React.Fragment>
          ))}

          <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
          {([
            { command: 'undo', icon: Undo2, label: 'Undo' },
            { command: 'redo', icon: Redo2, label: 'Redo' },
          ] as const).map(({ command, icon: Icon, label }) => (
            <button
              key={command}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec(command)}
              aria-label={label}
              title={label}
              className="grid place-items-center w-8 h-8 rounded-[var(--radius-sm)] text-muted-foreground
                         hover:bg-surface-container-high hover:text-foreground
                         transition-colors duration-[var(--motion-fast)]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
            </button>
          ))}

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (editorRef.current) editorRef.current.innerHTML = '';
              handleInput();
            }}
            aria-label="Clear all text"
            title="Clear all text"
            className="ml-auto grid place-items-center w-8 h-8 rounded-[var(--radius-sm)] text-muted-foreground
                       hover:bg-danger/10 hover:text-danger transition-colors duration-[var(--motion-fast)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Editing surface ── */}
        <div className="relative">
          {isEmpty && (
            <p className="pointer-events-none absolute left-5 top-4 text-base text-muted-foreground">
              {placeholder}
            </p>
          )}
          <div
            id="rich-text-surface"
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Document text"
            onInput={handleInput}
            onKeyUp={refreshState}
            onMouseUp={refreshState}
            onFocus={refreshState}
            className="rich-text-surface min-h-[18rem] max-h-[32rem] overflow-y-auto px-5 py-4
                       text-base leading-relaxed text-foreground focus:outline-none"
          />
        </div>
      </div>
    );
  },
);

RichTextEditor.displayName = 'RichTextEditor';
