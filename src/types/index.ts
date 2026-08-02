export type ToolCategory =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'text'
  | 'dev'
  | 'security'
  | 'color'
  | 'utility'
  | 'web'
  | 'ai';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  isPopular?: boolean;
  isNew?: boolean;
  isComingSoon?: boolean;
}
