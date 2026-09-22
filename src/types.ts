export type ProductCategory =
  | 'phone'
  | 'laptop'
  | 'tablet'
  | 'watch'
  | 'accessory'
  | 'appliance'
  | 'vehicle'
  | 'generic';

export interface PriceOption {
  label: string | null;
  amount: number;
}

export interface StructuredGadgetSpecs {
  brand?: string;
  model?: string;
  storage?: string;
  ram?: string;
  batteryHealth?: number | null;
  simConfig?: string;
  condition?: string;
  grade?: string;
  color?: string;
  region?: string;
  lockStatus?: string;
  processor?: string;
  gpu?: string;
  screenSize?: string;
  accessories?: string;
  moq?: string;
}

export interface ProductPost {
  title: string;
  category: ProductCategory;
  specs: string[];
  priceOptions: PriceOption[];
  tagline: string | null;
  badges: string[];
  gadgetSpecs?: StructuredGadgetSpecs;
}

export type TemplateStyle =
  | 'standard'
  | 'sales'
  | 'minimal'
  | 'premium'
  | 'wholesale'
  | 'new_arrival'
  | 'clearance'
  // Backward compatibility with previous version
  | 'classic'
  | 'catchy'
  | 'story';

export type TitleStylePreference = 'bold_unicode' | 'wa_bold' | 'uppercase' | 'titlecase' | 'normal';
export type SpecStylePreference = 'tilde' | 'bullet' | 'check' | 'dash';
export type EmojiLevelPreference = 'none' | 'minimal' | 'moderate';
export type TonePreference = 'casual' | 'professional' | 'sales' | 'premium';
export type PriceStylePreference = 'abbreviated' | 'full' | 'both';

export interface ResellerStylePreferences {
  titleStyle: TitleStylePreference;
  specStyle: SpecStylePreference;
  emojiLevel: EmojiLevelPreference;
  tone: TonePreference;
  priceStyle: PriceStylePreference;
  cta: string;
}

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

export interface BulkProductItem {
  id: string;
  rawText: string;
  post: ProductPost;
  renderedText: string;
  copied: boolean;
  error?: string;
}
