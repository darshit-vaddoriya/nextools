export interface ToolSeoStep {
  title: string;
  description: string;
}

export interface ToolSeoFaq {
  question: string;
  answer: string;
}

export interface ToolSeoContent {
  /** 2-4 sentence intro paragraph, longer and more specific than the card blurb. */
  intro: string;
  /** 3-5 short numbered steps describing how to use the tool. */
  steps: ToolSeoStep[];
  /** 4-6 genuinely useful FAQs, used for on-page content and FAQPage rich results. */
  faqs: ToolSeoFaq[];
  /** 3-4 short bullet points describing concrete scenarios where this tool is the right choice. */
  useCases?: string[];
  /** 2-4 short, specific pro tips or gotchas for getting the best result from this tool. */
  tips?: string[];
  /**
   * A longer explanatory section for tools whose interface is simple enough
   * that the page would otherwise be mostly chrome.
   *
   * The small utilities — a checksum, a Roman numeral converter, a percentage
   * calculator — need the least interface and have the most worth explaining:
   * which standard the conversion follows, where the edge cases are, what the
   * result does and does not prove. Without this those pages are a widget and a
   * FAQ, which is exactly the thin page a reader gains nothing from.
   */
  deepDive?: {
    heading: string;
    paragraphs: string[];
  };
}

export type ToolSeoMap = Record<string, ToolSeoContent>;
