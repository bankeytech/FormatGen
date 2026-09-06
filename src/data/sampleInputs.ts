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
  },
  {
    id: 'hp-elitebook',
    category: 'laptop',
    label: 'HP EliteBook 1040 G8',
    icon: '💻',
    rawText: `HP EliteBook 1040 G8 x360 convertible
Core i7 11th Gen
16GB RAM DDR4
512GB NVMe SSD
14 inch FHD Touchscreen x360 display
Keyboard backlight + fingerprint scanner
Clean condition like new with original charger
Price: ₦670,000`,
  },
  {
    id: 'infrared-cooker',
    category: 'appliance',
    label: 'Infrared Cooker (Dual Price)',
    icon: '⚡',
    rawText: `Inverter-friendly infrared electric cooker
Ultra-fast heating technology
Zero radiation, works with any pot (glass, iron, clay)
Low power consumption (inverter and solar friendly)
Double head ₦85,000 / Single head ₦45,000
We're in the era of prepaid and inverter, switch to smart cooking today!`,
  },
  {
    id: 'lexus-rx350',
    category: 'vehicle',
    label: 'Lexus RX350 (Badges)',
    icon: '🚗',
    rawText: `Direct Tokunbo 2026 Entry US Import
Lexus RX350 Luxury AWD
Panoramic roof with pristine leather interior
Original factory reverse camera + navigation
Super sound V6 engine and smooth transmission
Untouched customs duty fully paid
₦22,800,000 slightly negotiable for serious buyers`,
  },
];
