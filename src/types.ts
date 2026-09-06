export type ProductCategory = 'phone' | 'laptop' | 'appliance' | 'vehicle' | 'generic';

export interface PriceOption {
  label: string | null;
  amount: number;
}

export interface ProductPost {
  title: string;
  category: ProductCategory;
  specs: string[];
  priceOptions: PriceOption[];
  tagline: string | null;
  badges: string[];
}

export type TemplateStyle = 'classic' | 'catchy' | 'minimal' | 'story';
export type AIProvider = 'auto' | 'gemini' | 'openrouter';

export interface ExtractionResult {
  post: ProductPost;
  source: 'ai' | 'fallback';
  provider?: 'gemini' | 'openrouter' | 'fallback';
  error?: string;
  rawInput?: string;
}

export interface SavedPostItem {
  id: string;
  timestamp: number;
  post: ProductPost;
  renderedText: string;
  activeTemplate: TemplateStyle;
}
