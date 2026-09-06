import type { ProductPost, TemplateStyle, PriceOption } from '../types';
import { toBoldItalic } from '../utils/unicode';
import { formatPrice, formatPriceParts } from '../utils/price';

/**
 * Gets category-specific emoji decoration for Template 2
 */
function getCategoryEmoji(category: ProductPost['category'], tagline: string | null, badges: string[]): { left: string; right: string } {
  switch (category) {
    case 'phone':
      return { left: '📱', right: '📱' };
    case 'laptop':
      return { left: '💻', right: '💻' };
    case 'appliance': {
      const isFire = tagline && /cook|heat|fire|hot|flame|infrared|gas|oven|burner/i.test(tagline);
      const icon = isFire ? '🔥' : '⚡';
      return { left: icon, right: icon };
    }
    case 'vehicle': {
      const hasUs = badges.some((b) => /tokunbo|us|usa|america/i.test(b));
      return { left: '🚗', right: hasUs ? '🇺🇸' : '🚗' };
    }
    case 'generic':
    default:
      return { left: '🛍️', right: '🛍️' };
  }
}

/**
 * Formats a single price option for Template 2
 * Unit letter (k or m) is bold-italic, numbers are plain, e.g.:
 * ~ 𝑫𝒐𝒖𝒃𝒍𝒆 𝑯𝒆𝒂𝒅 || ₦85𝒌
 */
function formatCatchyPriceLine(option: PriceOption, isSingle: boolean): string {
  const parts = formatPriceParts(option.amount);
  const formattedUnit = parts.unit ? toBoldItalic(parts.unit) : '';
  const priceDisplay = `${parts.currency}${parts.numberStr}${formattedUnit}`;

  if (isSingle && !option.label) {
    return `~ *Price* || ${priceDisplay}`;
  }

  const label = option.label ? toBoldItalic(option.label) : 'Price';
  return `~ ${label} || ${priceDisplay}`;
}

/**
 * Template 1 — "Classic" (Plain / Professional)
 * - Title wrapped in single asterisks for WhatsApp bold: *Title*
 * - Specs as a plain line-per-item list with a clean • bullet
 * - Price line: *Price:* ₦670,000 (full number, comma-formatted, NOT abbreviated)
 * - Badges line if present
 * - Tagline at bottom if present
 */
export function renderClassicTemplate(post: ProductPost): string {
  const lines: string[] = [];

  // Title
  lines.push(`*${post.title.trim()}*`);

  // Badges (if present)
  if (post.badges && post.badges.length > 0) {
    lines.push(post.badges.map((b) => `[${b}]`).join(' '));
  }

  lines.push(''); // blank line

  // Specs
  if (post.specs && post.specs.length > 0) {
    post.specs.forEach((spec) => {
      lines.push(`• ${spec.trim()}`);
    });
    lines.push('');
  }

  // Price
  if (!post.priceOptions || post.priceOptions.length === 0) {
    lines.push(`*Price:* Contact for price`);
  } else if (post.priceOptions.length === 1 && !post.priceOptions[0].label) {
    lines.push(`*Price:* ${formatPrice(post.priceOptions[0].amount, 'full')}`);
  } else {
    lines.push(`*Price:*`);
    post.priceOptions.forEach((opt) => {
      const label = opt.label ? `${opt.label}: ` : '';
      lines.push(`• ${label}${formatPrice(opt.amount, 'full')}`);
    });
  }

  // Tagline
  if (post.tagline && post.tagline.trim()) {
    lines.push('');
    lines.push(post.tagline.trim());
  }

  return lines.join('\n');
}

/**
 * Template 2 — "Catchy" (Stylized)
 * - Title fully converted to Unicode Bold Italic, wrapped with emoji pair
 * - Each spec line prefixed with ~ and converted to Unicode Bold Italic
 * - Price lines: ~ *Label* || ₦670𝒌 (unit k/m in bold italic)
 * - Badges woven into title line
 * - Blank line then tagline in Unicode Bold Italic
 */
export function renderCatchyTemplate(post: ProductPost): string {
  const lines: string[] = [];

  // Flag extraction: if badges contain a country flag emoji (e.g. 🇺🇸), use it as the title emoji
  const flagRegex = /(?:\ud83c[\udde6-\uddff]){2}/;
  const badgeFlag = post.badges?.map((b) => b.match(flagRegex)?.[0]).find(Boolean);
  const categoryEmoji = getCategoryEmoji(post.category, post.tagline, post.badges);
  const leftEmoji = badgeFlag || categoryEmoji.left;

  // Title
  const boldItalicTitle = toBoldItalic(post.title.trim());
  lines.push(`${leftEmoji} ${boldItalicTitle}`);
  lines.push('');

  // Specs & Badges
  const allItems = [
    ...(post.specs || []),
    ...(post.badges || []),
  ];

  if (allItems.length > 0) {
    allItems.forEach((item) => {
      lines.push(`~ ${toBoldItalic(item.trim())}`);
    });
    lines.push('');
  }

  // Prices
  if (!post.priceOptions || post.priceOptions.length === 0) {
    lines.push(`~ *Price* || Contact for price`);
  } else if (post.priceOptions.length === 1 && !post.priceOptions[0].label) {
    // Single clean abbreviated price
    const parts = formatPriceParts(post.priceOptions[0].amount);
    const formattedUnit = parts.unit ? toBoldItalic(parts.unit) : '';
    lines.push(`${parts.currency}${parts.numberStr}${formattedUnit}`);
  } else {
    post.priceOptions.forEach((opt) => {
      lines.push(formatCatchyPriceLine(opt, false));
    });
  }

  // Tagline
  if (post.tagline && post.tagline.trim()) {
    lines.push('');
    lines.push(toBoldItalic(post.tagline.trim()));
  }

  return lines.join('\n');
}

/**
 * Template 3 — "Minimal" (Compact, for Status / quick-share)
 * - Title plain bold: *Title*
 * - Specs joined into a single comma-separated line, no bullets
 * - Price line only, abbreviated: ₦670k
 * - No tagline, no badges (optimized for WhatsApp Status character economy)
 */
export function renderMinimalTemplate(post: ProductPost): string {
  const lines: string[] = [];

  // Title
  lines.push(`*${post.title.trim()}*`);

  // Specs joined with comma
  if (post.specs && post.specs.length > 0) {
    lines.push(post.specs.map((s) => s.trim()).join(', '));
  }

  // Price line abbreviated
  if (post.priceOptions && post.priceOptions.length > 0) {
    if (post.priceOptions.length === 1 && !post.priceOptions[0].label) {
      lines.push(formatPrice(post.priceOptions[0].amount, 'abbreviated'));
    } else {
      const priceItems = post.priceOptions.map((opt) => {
        const p = formatPrice(opt.amount, 'abbreviated');
        return opt.label ? `${opt.label}: ${p}` : p;
      });
      lines.push(priceItems.join(' | '));
    }
  }

  return lines.join('\n');
}

/**
 * Template 4 — "Story / Status" (High-Conversion Reseller Hook)
 * - Designed for WhatsApp Status 24h stories
 * - Visual emoji bullets & clear Call-To-Action
 */
export function renderStoryTemplate(post: ProductPost): string {
  const lines: string[] = [];

  lines.push(`🔥 *AVAILABLE NOW: ${post.title.trim().toUpperCase()}*`);

  if (post.badges && post.badges.length > 0) {
    lines.push(`✨ ${post.badges.join(' | ')}`);
  }

  lines.push('');
  if (post.specs && post.specs.length > 0) {
    post.specs.forEach((spec) => {
      lines.push(`✅ ${spec.trim()}`);
    });
    lines.push('');
  }

  if (post.priceOptions && post.priceOptions.length > 0) {
    if (post.priceOptions.length === 1 && !post.priceOptions[0].label) {
      lines.push(`💰 *Deal Price: ${formatPrice(post.priceOptions[0].amount, 'full')}* (${formatPrice(post.priceOptions[0].amount, 'abbreviated')})`);
    } else {
      lines.push(`💰 *Deal Prices:*`);
      post.priceOptions.forEach((opt) => {
        const label = opt.label ? `${opt.label}: ` : '';
        lines.push(`👉 ${label}${formatPrice(opt.amount, 'full')}`);
      });
    }
  }

  if (post.tagline && post.tagline.trim()) {
    lines.push(`💡 ${post.tagline.trim()}`);
  }

  lines.push('');
  lines.push(`⚡ *Send a DM now to lock yours in before it's gone!*`);

  return lines.join('\n');
}

/**
 * Main pure template dispatcher
 */
export function renderTemplate(post: ProductPost, style: TemplateStyle): string {
  switch (style) {
    case 'classic':
      return renderClassicTemplate(post);
    case 'catchy':
      return renderCatchyTemplate(post);
    case 'minimal':
      return renderMinimalTemplate(post);
    case 'story':
      return renderStoryTemplate(post);
    default:
      return renderClassicTemplate(post);
  }
}

export const TEMPLATE_STYLES: { id: TemplateStyle; name: string; description: string }[] = [
  { id: 'classic', name: 'Classic', description: 'Plain, professional line-by-line format' },
  { id: 'catchy', name: 'Catchy', description: 'Stylized Unicode bold-italic & category emoji' },
  { id: 'minimal', name: 'Minimal', description: 'Compact single-line spec for status updates' },
  { id: 'story', name: 'Story / Status', description: 'High-conversion story format with bold CTA' },
];
