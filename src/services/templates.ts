import type { ProductPost, TemplateStyle, PriceOption, ResellerStylePreferences } from '../types';
import { toBoldItalic, formatTitleByStyle } from '../utils/unicode';
import { formatPrice, formatPriceParts } from '../utils/price';

export const DEFAULT_STYLE_PREFERENCES: ResellerStylePreferences = {
  titleStyle: 'wa_bold',
  specStyle: 'tilde',
  emojiLevel: 'moderate',
  tone: 'sales',
  priceStyle: 'abbreviated',
  cta: 'DM to order 📲',
};

export const STYLE_STORAGE_KEY = 'formatgen_reseller_style_v1';

export function getStoredStylePreferences(): ResellerStylePreferences {
  try {
    const raw = localStorage.getItem(STYLE_STORAGE_KEY);
    if (!raw) return DEFAULT_STYLE_PREFERENCES;
    return { ...DEFAULT_STYLE_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STYLE_PREFERENCES;
  }
}

export function setStoredStylePreferences(prefs: ResellerStylePreferences): void {
  try {
    localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save style preferences', err);
  }
}

/**
 * Gets category-specific emoji decoration
 */
function getCategoryEmoji(
  category: ProductPost['category'],
  tagline: string | null,
  badges: string[]
): { left: string; right: string } {
  switch (category) {
    case 'phone':
      return { left: '📱', right: '📱' };
    case 'laptop':
      return { left: '💻', right: '💻' };
    case 'tablet':
      return { left: '📱', right: '📱' };
    case 'watch':
      return { left: '⌚', right: '⌚' };
    case 'accessory':
      return { left: '🎧', right: '🎧' };
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
 * Formats a single price option for Catchy / Premium
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
 * Formats price options according to price style preference
 */
function formatPricesForPost(
  post: ProductPost,
  style: 'full' | 'abbreviated' | 'both' = 'full',
  prefix: string = '*Price:* '
): string[] {
  if (!post.priceOptions || post.priceOptions.length === 0) {
    return [`${prefix}Contact for price`];
  }

  if (post.priceOptions.length === 1 && !post.priceOptions[0].label) {
    return [`${prefix}${formatPrice(post.priceOptions[0].amount, style)}`];
  }

  const lines: string[] = [`${prefix}`];
  post.priceOptions.forEach((opt) => {
    const label = opt.label ? `${opt.label}: ` : '';
    lines.push(`• ${label}${formatPrice(opt.amount, style)}`);
  });
  return lines;
}

/**
 * Helper to get bullet prefix
 */
function getBulletPrefix(style: ResellerStylePreferences['specStyle']): string {
  switch (style) {
    case 'tilde':
      return '~ ';
    case 'bullet':
      return '• ';
    case 'check':
      return '✅ ';
    case 'dash':
      return '- ';
    default:
      return '~ ';
  }
}

// ==========================================
// 1. STANDARD / CLASSIC TEMPLATE
// ==========================================
export function renderClassicTemplate(post: ProductPost, prefs?: ResellerStylePreferences): string {
  const lines: string[] = [];
  const p = prefs || DEFAULT_STYLE_PREFERENCES;

  // Title with user preferred title style
  lines.push(formatTitleByStyle(post.title, p.titleStyle));

  // Badges (if present)
  if (post.badges && post.badges.length > 0) {
    lines.push(post.badges.map((b) => `[${b}]`).join(' '));
  }

  lines.push(''); // blank line

  // Specs with user preferred bullet
  if (post.specs && post.specs.length > 0) {
    const bullet = getBulletPrefix(p.specStyle);
    post.specs.forEach((spec) => {
      lines.push(`${bullet}${spec.trim()}`);
    });
    lines.push('');
  }

  // Price
  lines.push(...formatPricesForPost(post, p.priceStyle === 'abbreviated' ? 'abbreviated' : 'full'));

  // Tagline
  if (post.tagline && post.tagline.trim()) {
    lines.push('');
    lines.push(post.tagline.trim());
  }

  return lines.join('\n');
}

// ==========================================
// 2. CATCHY / PREMIUM TEMPLATE (STRICT REGRESSION COMPATIBLE)
// ==========================================
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
  const allItems = [...(post.specs || []), ...(post.badges || [])];

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

// ==========================================
// 3. MINIMAL TEMPLATE (WhatsApp Status optimized)
// ==========================================
export function renderMinimalTemplate(post: ProductPost, prefs?: ResellerStylePreferences): string {
  const lines: string[] = [];
  const p = prefs || DEFAULT_STYLE_PREFERENCES;

  // Title
  lines.push(`*${post.title.trim()}*`);

  // Specs joined with comma
  if (post.specs && post.specs.length > 0) {
    lines.push(post.specs.map((s) => s.trim()).join(', '));
  }

  // Price line abbreviated
  if (post.priceOptions && post.priceOptions.length > 0) {
    if (post.priceOptions.length === 1 && !post.priceOptions[0].label) {
      lines.push(formatPrice(post.priceOptions[0].amount, p.priceStyle));
    } else {
      const priceItems = post.priceOptions.map((opt) => {
        const pr = formatPrice(opt.amount, p.priceStyle);
        return opt.label ? `${opt.label}: ${pr}` : pr;
      });
      lines.push(priceItems.join(' | '));
    }
  }

  if (p.cta) {
    lines.push(p.cta);
  }

  return lines.join('\n');
}

// ==========================================
// 4. WHATSAPP SALES / STORY TEMPLATE
// ==========================================
export function renderSalesTemplate(post: ProductPost, prefs?: ResellerStylePreferences): string {
  const lines: string[] = [];
  const p = prefs || DEFAULT_STYLE_PREFERENCES;

  const emoji = p.emojiLevel !== 'none' ? '🔥 ' : '';
  lines.push(`${emoji}*AVAILABLE NOW: ${post.title.trim().toUpperCase()}*`);

  if (post.badges && post.badges.length > 0) {
    const star = p.emojiLevel !== 'none' ? '✨ ' : '';
    lines.push(`${star}${post.badges.join(' | ')}`);
  }

  lines.push('');
  if (post.specs && post.specs.length > 0) {
    const bullet = p.emojiLevel === 'none' ? '• ' : '✅ ';
    post.specs.forEach((spec) => {
      lines.push(`${bullet}${spec.trim()}`);
    });
    lines.push('');
  }

  if (post.priceOptions && post.priceOptions.length > 0) {
    const moneyIcon = p.emojiLevel !== 'none' ? '💰 ' : '';
    if (post.priceOptions.length === 1 && !post.priceOptions[0].label) {
      lines.push(`${moneyIcon}*Deal Price:* ${formatPrice(post.priceOptions[0].amount, p.priceStyle || 'both')}`);
    } else {
      lines.push(`${moneyIcon}*Deal Prices:*`);
      post.priceOptions.forEach((opt) => {
        const label = opt.label ? `${opt.label}: ` : '';
        lines.push(`👉 ${label}${formatPrice(opt.amount, p.priceStyle)}`);
      });
    }
  }

  if (post.tagline && post.tagline.trim()) {
    lines.push('');
    lines.push(`💡 ${post.tagline.trim()}`);
  }

  lines.push('');
  const ctaText = p.cta || 'Send a DM now to lock yours in before it is gone! 📲';
  lines.push(`⚡ *${ctaText}*`);

  return lines.join('\n');
}

// ==========================================
// 5. WHOLESALE TEMPLATE (B2B Reseller)
// ==========================================
export function renderWholesaleTemplate(post: ProductPost, prefs?: ResellerStylePreferences): string {
  const lines: string[] = [];
  const p = prefs || DEFAULT_STYLE_PREFERENCES;

  const box = p.emojiLevel !== 'none' ? '📦 ' : '';
  lines.push(`${box}*RESELLER / WHOLESALE: ${post.title.trim().toUpperCase()}*`);

  const conditionStr = post.badges?.length ? post.badges.join(' • ') : 'Clean Inspected Stock';
  lines.push(`🏢 *Batch Condition:* ${conditionStr}`);

  lines.push('');
  lines.push('📋 *Specifications:*');
  if (post.specs && post.specs.length > 0) {
    post.specs.forEach((spec) => {
      lines.push(`~ ${spec.trim()}`);
    });
    lines.push('');
  }

  if (post.priceOptions && post.priceOptions.length > 0) {
    const cash = p.emojiLevel !== 'none' ? '💵 ' : '';
    if (post.priceOptions.length === 1 && !post.priceOptions[0].label) {
      lines.push(`${cash}*Wholesale Price:* ${formatPrice(post.priceOptions[0].amount, p.priceStyle)} (MOQ applies)`);
    } else {
      lines.push(`${cash}*Wholesale Pricing:*`);
      post.priceOptions.forEach((opt) => {
        const label = opt.label ? `${opt.label}: ` : '';
        lines.push(`• ${label}${formatPrice(opt.amount, p.priceStyle)}`);
      });
    }
  }

  lines.push('');
  lines.push('🤝 *Serious dealers & resellers drop a WhatsApp DM for bulk invoice.*');

  return lines.join('\n');
}

// ==========================================
// 6. NEW ARRIVAL TEMPLATE
// ==========================================
export function renderNewArrivalTemplate(post: ProductPost, prefs?: ResellerStylePreferences): string {
  const lines: string[] = [];
  const p = prefs || DEFAULT_STYLE_PREFERENCES;

  const siren = p.emojiLevel !== 'none' ? '🚨 ' : '';
  lines.push(`${siren}*JUST LANDED / FRESH ARRIVAL:*`);
  lines.push(`*${post.title.trim()}*`);

  if (post.badges && post.badges.length > 0) {
    lines.push(`✨ ${post.badges.join(' | ')}`);
  }

  lines.push('');
  lines.push('🔹 *Highlights & Specs:*');
  if (post.specs && post.specs.length > 0) {
    post.specs.forEach((spec) => {
      lines.push(`👉 ${spec.trim()}`);
    });
    lines.push('');
  }

  if (post.priceOptions && post.priceOptions.length > 0) {
    const tag = p.emojiLevel !== 'none' ? '🏷️ ' : '';
    lines.push(`${tag}*Special Arrival Price:* ${formatPrice(post.priceOptions[0].amount, p.priceStyle)}`);
  }

  lines.push('');
  lines.push('🚀 *Limited pieces available! First to pay gets it.*');
  lines.push(`📲 *${p.cta || 'DM now to order'}*`);

  return lines.join('\n');
}

// ==========================================
// 7. CLEARANCE / STEAL DEAL TEMPLATE
// ==========================================
export function renderClearanceTemplate(post: ProductPost, prefs?: ResellerStylePreferences): string {
  const lines: string[] = [];
  const p = prefs || DEFAULT_STYLE_PREFERENCES;

  const fire = p.emojiLevel !== 'none' ? '🔥 ' : '';
  lines.push(`${fire}*PRICE DROP / CLEARANCE SALE:*`);
  lines.push(`*${post.title.trim()}*`);
  lines.push('⚡ Direct liquidation deal — must go today!');

  lines.push('');
  if (post.specs && post.specs.length > 0) {
    post.specs.forEach((spec) => {
      lines.push(`⚡ ${spec.trim()}`);
    });
    lines.push('');
  }

  if (post.priceOptions && post.priceOptions.length > 0) {
    const boom = p.emojiLevel !== 'none' ? '💥 ' : '';
    lines.push(`${boom}*Clearance Price:* ${formatPrice(post.priceOptions[0].amount, p.priceStyle)} (Non-negotiable)`);
  }

  lines.push('');
  lines.push('🏃‍♂️ *Hurry, once it is gone it is gone!*');
  lines.push(`📲 *${p.cta || 'Message to secure immediately'}*`);

  return lines.join('\n');
}

/**
 * Main Pure Template Dispatcher
 */
export function renderTemplate(
  post: ProductPost,
  style: TemplateStyle,
  prefs?: ResellerStylePreferences
): string {
  switch (style) {
    case 'standard':
    case 'classic':
      return renderClassicTemplate(post, prefs);

    case 'premium':
    case 'catchy':
      return renderCatchyTemplate(post);

    case 'minimal':
      return renderMinimalTemplate(post, prefs);

    case 'sales':
    case 'story':
      return renderSalesTemplate(post, prefs);

    case 'wholesale':
      return renderWholesaleTemplate(post, prefs);

    case 'new_arrival':
      return renderNewArrivalTemplate(post, prefs);

    case 'clearance':
      return renderClearanceTemplate(post, prefs);

    default:
      return renderClassicTemplate(post, prefs);
  }
}

export const TEMPLATE_STYLES: { id: TemplateStyle; name: string; description: string; badge: string }[] = [
  { id: 'standard', name: 'Standard', description: 'Clean, professional line-by-line format with bullets', badge: 'Popular' },
  { id: 'sales', name: 'WA Sales', description: 'High-converting sales hook with deal emojis & bold CTA', badge: 'High CVR' },
  { id: 'premium', name: 'Premium', description: 'Mathematical Unicode bold-italic & category emojis', badge: 'Luxury' },
  { id: 'minimal', name: 'Minimal', description: 'Ultra-compact single-line spec list for WA status', badge: 'Status' },
  { id: 'wholesale', name: 'Wholesale', description: 'B2B reseller format with batch condition & MOQ', badge: 'B2B' },
  { id: 'new_arrival', name: 'New Arrival', description: 'Fresh inventory urgency hook for new stock', badge: 'New' },
  { id: 'clearance', name: 'Clearance', description: 'Fast price-drop liquidation deal for fast sale', badge: 'Steal' },
];
