export interface SampleInput {
  id: string;
  category: string;
  label: string;
  icon: string;
  rawText: string;
}

export const SAMPLE_INPUTS: SampleInput[] = [
  {
    id: 'macbook-pro-m2',
    category: 'laptop',
    label: 'MacBook Pro 13" (M2 Chip)',
    icon: '💻',
    rawText: `*🇺🇸Direct Intact*
OpenBox 13-inch
MacBook Pro 2022
M2 Chip
8GB / 512GB
*₦1,100,000*`,
  },
  {
    id: 'iphone-15',
    category: 'phone',
    label: 'iPhone 15 Pro Max (Single)',
    icon: '📱',
    rawText: `iPhone 15 Pro Max / 256GB / 92% BH / Natural Titanium / ₦1.2m`,
  }

];
