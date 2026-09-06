import type { ProductPost, PriceOption, ProductCategory } from '../types';

/**
 * Parses numeric price string into a number
 * Supports:
 * - 1.2m / 1.2 million -> 1200000
 * - 670k / 670 thousand -> 670000
 * - 85,000 / 85000 -> 85000
 * - 22,800,000 -> 22800000
 */
export function parsePriceNumber(raw: string): number | null {
  const cleaned = raw.replace(/[₦#,\s]/g, '').trim().toLowerCase();
  
  // Match "1.2m" or "22.8m"
  const millionMatch = cleaned.match(/^([\d.]+)\s*(?:m|million)$/i);
  if (millionMatch) {
    const val = parseFloat(millionMatch[1]);
    return isNaN(val) ? null : Math.round(val * 1_000_000);
  }

  // Match "670k" or "45k"
  const thousandMatch = cleaned.match(/^([\d.]+)\s*(?:k|thousand)$/i);
  if (thousandMatch) {
    const val = parseFloat(thousandMatch[1]);
    return isNaN(val) ? null : Math.round(val * 1_000);
  }

  // Match raw integer or decimal e.g. "670000" or "22800000"
  const rawNum = parseFloat(cleaned);
  if (!isNaN(rawNum) && rawNum > 0) {
    return Math.round(rawNum);
  }

  return null;
}

/**
 * Extracts price options from candidate lines
 */
function extractPricesFromText(lines: string[]): { priceOptions: PriceOption[]; nonPriceLines: string[] } {
  const priceOptions: PriceOption[] = [];
  const nonPriceLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line contains multiple slash-separated prices (e.g. "Double head ₦85,000 / Single head ₦45,000")
    if (trimmed.includes('/') && /₦|k|m|\d{4,}/i.test(trimmed)) {
      const parts = trimmed.split('/');
      let matchedAny = false;
      const subOptions: PriceOption[] = [];

      for (const part of parts) {
        const pTrimmed = part.trim();
        const pMatch = pTrimmed.match(/(.*?)(?:₦|#)?\s*([\d]+(?:[,\.][\d]+)*\s*(?:k|m|million|thousand)?)$/i);
        if (pMatch) {
          const num = parsePriceNumber(pMatch[2]);
          if (num !== null && num > 100) {
            const rawLabel = pMatch[1].replace(/[:\-–—]/g, '').trim();
            subOptions.push({
              label: rawLabel || null,
              amount: num,
            });
            matchedAny = true;
          }
        }
      }

      if (matchedAny && subOptions.length > 0) {
        priceOptions.push(...subOptions);
        continue;
      }
    }

    // Single line price check
    if (/₦|#|\bprice\b/i.test(trimmed) || /\b\d[\d,\.]*\s*(?:k|m)\b/i.test(trimmed)) {
      // Look for labeled variant (e.g., "Double head: ₦85,000" or "Price: ₦670,000")
      const variantMatch = trimmed.match(/^(.*?)(?:[:\-–—]|\bis\b)\s*(?:₦|#)?\s*([\d]+(?:[,\.][\d]+)*\s*(?:k|m|million|thousand)?)/i);
      if (variantMatch) {
        const num = parsePriceNumber(variantMatch[2]);
        if (num !== null && num > 100) {
          const label = variantMatch[1].replace(/^[\W_]+|[\W_]+$/g, '').trim();
          priceOptions.push({
            label: label.toLowerCase().includes('price') ? null : label,
            amount: num,
          });
          continue;
        }
      }

      // Check simple price match in line
      const simpleMatch = trimmed.match(/(?:₦|#)\s*([\d]+(?:[,\.][\d]+)*\s*(?:k|m|million|thousand)?)/i) ||
                          trimmed.match(/\b([\d]+(?:[,\.][\d]+)*\s*(?:k|m))\b/i);
      if (simpleMatch) {
        const num = parsePriceNumber(simpleMatch[1]);
        if (num !== null && num > 100) {
          priceOptions.push({
            label: null,
            amount: num,
          });
          continue;
        }
      }
    }

    nonPriceLines.push(trimmed);
  }

  return { priceOptions, nonPriceLines };
}

/**
 * Guess product category using word boundaries to avoid false positives
 */
function guessCategory(text: string): ProductCategory {
  const lower = text.toLowerCase();

  // Check vehicle
  if (/\b(lexus|toyota|corolla|camry|mercedes|benz|honda|car|suv|v6|v8|tokunbo|vehicle|motor|acura|bmw|hyundai|kia|awd)\b/i.test(lower)) {
    return 'vehicle';
  }

  // Check appliance
  if (/\b(cooker|fridge|freezer|blender|microwave|oven|iron|washing machine|generator|inverter|solar|appliance|burner)\b/i.test(lower)) {
    return 'appliance';
  }

  // Check laptop / computer
  if (/\b(laptop|macbook|elitebook|thinkpad|dell|hp|lenovo|asus|acer|touchscreen|ssd|keyboard|notebook)\b/i.test(lower)) {
    return 'laptop';
  }

  // Check phone
  if (/\b(iphone|samsung|galaxy|redmi|pixel|tecno|infinix|oppo|vivo|phone|smartphone|android|battery health|bh)\b/i.test(lower)) {
    return 'phone';
  }

  return 'generic';
}

/**
 * Detect common Nigerian reseller badges
 */
function detectBadges(text: string): string[] {
  const badges: string[] = [];
  
  // Flag + Condition e.g. *🇺🇸Direct Intact* or Direct Intact 🇺🇸
  if (/direct intact/i.test(text)) {
    const hasUs = /🇺🇸/i.test(text) || /us|usa|america/i.test(text);
    badges.push(hasUs ? 'Direct Intact 🇺🇸' : 'Direct Intact');
  } else if (/direct tokunbo/i.test(text)) {
    badges.push('Direct Tokunbo');
  }

  if (/us import|usa import/i.test(text) && !badges.some(b => b.includes('🇺🇸'))) {
    badges.push('US Import');
  }
  if (/(\d{4}\s*entry)/i.test(text)) {
    const match = text.match(/(\d{4}\s*entry)/i);
    if (match) badges.push(match[1]);
  }
  if (/london used/i.test(text)) badges.push('London Used');
  if (/brand new/i.test(text)) badges.push('Brand New');
  if (/clean condition/i.test(text)) badges.push('Clean Condition');
  return badges.slice(0, 3);
}

/**
 * Naive local fallback parser
 * Runs purely client-side without any network request.
 */
export function parseLocalFallback(rawInput: string): ProductPost {
  if (!rawInput || !rawInput.trim()) {
    return {
      title: 'Product Title',
      category: 'generic',
      specs: [],
      priceOptions: [],
      tagline: null,
      badges: [],
    };
  }

  // Split input into lines or slash chunks if single line
  let rawLines = rawInput.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (rawLines.length === 1 && rawLines[0].includes('/') && !rawLines[0].includes('GB /')) {
    rawLines = rawLines[0].split('/').map((s) => s.trim()).filter(Boolean);
  }

  // Strip residual markdown symbols from all candidate lines
  rawLines = rawLines.map((l) => l.replace(/^[*•~`\-\s]+|[*•~`\-\s]+$/g, '').replace(/[*~`]/g, '').trim()).filter(Boolean);

  // Extract prices first
  const { priceOptions, nonPriceLines } = extractPricesFromText(rawLines);

  const badges = detectBadges(rawInput);

  // Filter out lines that are purely badges (e.g. "🇺🇸Direct Intact" or "Direct Tokunbo 2026 Entry US Import")
  const contentLines: string[] = [];
  for (const line of nonPriceLines) {
    const isPureBadge = /^(?:🇺🇸|🇬🇧)?\s*(?:direct\s*(?:intact|tokunbo)|(?:us|usa)\s*import|\d{4}\s*entry|london\s*used)$/i.test(line);
    if (!isPureBadge) {
      contentLines.push(line);
    }
  }

  let title = 'Product';
  let remainingLines = contentLines;

  // Title consolidation heuristic:
  // e.g. "OpenBox 13-inch" + "MacBook Pro 2022" + "M2 Chip"
  const macbookLine = contentLines.find((l) => /macbook/i.test(l));
  const sizeLine = contentLines.find((l) => /\b(\d{1,2}(?:\.\d)?)(?:-|\s)*(?:inch|["'”])\b/i.test(l));

  if (macbookLine) {
    const yearMatch = macbookLine.match(/\b(20\d\d)\b/);
    const yearStr = yearMatch ? ` (${yearMatch[1]})` : '';
    const cleanModel = macbookLine.replace(/\b(20\d\d)\b/g, '').trim();

    let sizeStr = '';
    if (sizeLine) {
      const sMatch = sizeLine.match(/\b(\d{1,2}(?:\.\d)?)(?:-|\s)*(?:inch|["'”])\b/i);
      if (sMatch) {
        sizeStr = ` ${sMatch[1]}"`;
      }
    }

    title = `${cleanModel}${sizeStr}${yearStr}`.replace(/\s+/g, ' ').trim();
    remainingLines = contentLines.filter((l) => l !== macbookLine);
  } else if (contentLines.length > 0) {
    title = contentLines[0];
    remainingLines = contentLines.slice(1);
  }

  // Detect tagline and parse specs
  let tagline: string | null = null;
  const specCandidates: string[] = [];
  let openBoxFound = false;

  for (let i = 0; i < remainingLines.length; i++) {
    let line = remainingLines[i];
    const isLast = i === remainingLines.length - 1;

    if (isLast && /era of|switch to|call today|grab yours|deal of|dm now|negotiable|contact us/i.test(line)) {
      tagline = line;
      continue;
    }

    // Check if line contains "OpenBox" or "Open Box"
    if (/\bopenbox\b/i.test(line)) {
      openBoxFound = true;
      line = line.replace(/\bopenbox\b/gi, '').trim();
    }

    // Strip size if already in title
    if (macbookLine && sizeLine) {
      line = line.replace(/\b(\d{1,2}(?:\.\d)?)(?:-|\s)*(?:inch|["'”])\b/gi, '').trim();
    }

    // If nothing left after removing OpenBox / size
    if (!line) continue;

    // Compound RAM / Storage split e.g. "8GB / 512GB"
    const ramStorageMatch = line.match(/^(\d+\s*GB)\s*\/\s*(\d+\s*(?:GB|TB))/i);
    if (ramStorageMatch) {
      specCandidates.push(`${ramStorageMatch[1].replace(/\s+/g, '')} RAM`);
      specCandidates.push(`${ramStorageMatch[2].replace(/\s+/g, '')} SSD`);
      continue;
    }

    const cleanedSpec = line.replace(/^[•\-\*~>–—\s]+/, '').replace(/[*•~`]/g, '').trim();
    if (cleanedSpec.length > 0 && cleanedSpec !== title) {
      specCandidates.push(cleanedSpec);
    }
  }

  if (openBoxFound) {
    specCandidates.push('Open Box');
  }

  const category = guessCategory(rawInput);

  return {
    title: title || 'Product Name',
    category,
    specs: specCandidates,
    priceOptions,
    tagline,
    badges,
  };
}
