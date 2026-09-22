import type { ProductPost } from '../types';

/**
 * Strips all emoji characters from rendered WhatsApp text
 */
export function removeEmojisFromText(text: string): string {
  // Matches common emoji ranges, flags, and surrogate pairs
  const emojiRegex =
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
  return text
    .replace(emojiRegex, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/(\n\s*){3,}/g, '\n\n')
    .trim();
}

/**
 * Make post shorter by keeping only high-impact specs and stripping taglines
 */
export function rewriteMakeShorter(post: ProductPost): ProductPost {
  // Keep up to 4 most critical specs
  const prioritySpecs = post.specs.filter((s) =>
    /\b(GB|TB|RAM|SSD|BH|Battery|SIM|eSIM|Clean|Intact|Sealed|Condition|Unlocked)\b/i.test(s)
  );
  const shortenedSpecs = prioritySpecs.length > 0 ? prioritySpecs.slice(0, 4) : post.specs.slice(0, 3);

  return {
    ...post,
    specs: shortenedSpecs,
    tagline: null,
    badges: post.badges.slice(0, 2),
  };
}

/**
 * Make post more sales-focused by adding persuasive urgency and reseller badges
 */
export function rewriteMakeSalesFocused(post: ProductPost): ProductPost {
  const existingBadges = [...post.badges];
  if (!existingBadges.some((b) => /deal|clean|verified|tested/i.test(b))) {
    existingBadges.unshift('100% Tested & Clean');
  }

  const salesTagline =
    post.tagline ||
    'Top tier gadget in pristine condition. Best price on the market — nationwide delivery available!';

  return {
    ...post,
    badges: existingBadges,
    tagline: salesTagline,
  };
}

/**
 * Make post cleaner by tidying spec casing and removing clutter
 */
export function rewriteMakeCleaner(post: ProductPost): ProductPost {
  const cleanedSpecs = post.specs.map((s) => {
    return s
      .replace(/^[*•~`\-\s]+/, '')
      .replace(/[*•~`\-\s]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  });

  return {
    ...post,
    specs: cleanedSpecs,
    tagline: post.tagline ? post.tagline.replace(/^[*•~`\-\s]+/, '').trim() : null,
  };
}

/**
 * Updates or adds CTA at the end of rendered text
 */
export function appendCtaToText(text: string, cta: string): string {
  const trimmed = text.trim();
  const ctaLine = `📲 *${cta.trim()}*`;

  // Check if text already has a DM/order CTA at the end
  if (/dm to order|message to order|call today|send a dm/i.test(trimmed)) {
    return trimmed.replace(
      /(\*?(?:dm|message|call|send a dm)[\s\S]*?\*?)$/i,
      ctaLine
    );
  }

  return `${trimmed}\n\n${ctaLine}`;
}
