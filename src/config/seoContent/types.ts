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
  /** 4-6 genuinely useful FAQs — used for on-page content and FAQPage rich results. */
  faqs: ToolSeoFaq[];
}

export type ToolSeoMap = Record<string, ToolSeoContent>;
