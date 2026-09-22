import type { ProductPost, PriceOption, ProductCategory, StructuredGadgetSpecs } from '../types';
import { normalizeNigerianPriceInput } from '../utils/price';

/**
 * Parses numeric price string into a number
 * Supports:
 * - 1.2m / 1.2 million -> 1200000
 * - 670k / 670 thousand -> 670000
 * - 85,000 / 85000 -> 85000
 * - 22,800,000 -> 22800000
 */
export function parsePriceNumber(raw: string): number | null {
  return normalizeNigerianPriceInput(raw);
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
      const simpleMatch =
        trimmed.match(/(?:₦|#)\s*([\d]+(?:[,\.][\d]+)*\s*(?:k|m|million|thousand)?)/i) ||
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
 * Guess product category using word boundaries
 */
export function guessCategory(text: string): ProductCategory {
  const lower = text.toLowerCase();

  // Watch
  if (/\b(apple watch|galaxy watch|smartwatch|series \d|ultra 2|\d{2}mm gps|\d{2}mm cellular)\b/i.test(lower)) {
    return 'watch';
  }

  // Tablet
  if (/\b(ipad|tablet|tab s\d|surface pro|surface go)\b/i.test(lower)) {
    return 'tablet';
  }

  // Accessories
  if (/\b(airpods|earbuds|buds pro|pencil|magsafe|charger|adapter|power bank|headphone)\b/i.test(lower)) {
    return 'accessory';
  }

  // Vehicle
  if (/\b(lexus|toyota|corolla|camry|mercedes|benz|honda|car|suv|v6|v8|tokunbo|vehicle|motor|acura|bmw|hyundai|kia|awd)\b/i.test(lower)) {
    return 'vehicle';
  }

  // Appliance
  if (/\b(cooker|fridge|freezer|blender|microwave|oven|iron|washing machine|generator|inverter|solar|appliance|burner)\b/i.test(lower)) {
    return 'appliance';
  }

  // Laptop / Computer
  if (/\b(laptop|macbook|elitebook|thinkpad|dell|hp|lenovo|asus|acer|touchscreen|ssd|keyboard|notebook)\b/i.test(lower)) {
    return 'laptop';
  }

  // Phone
  if (/\b(iphone|samsung|galaxy|redmi|pixel|tecno|infinix|oppo|vivo|phone|smartphone|android|battery health|bh|esim)\b/i.test(lower)) {
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

  if (/us import|usa import/i.test(text) && !badges.some((b) => b.includes('🇺🇸'))) {
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
 * Intelligent Single-Line Reseller Gadget Parser
 * For inputs like:
 * "iPhone 15 Pro Max 256GB White eSIM unlocked 96% BH 9/10 clean ₦770k"
 */
function parseSingleLineGadget(input: string): ProductPost | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Check if this looks like a reseller gadget shorthand
  const hasGadgetClues =
    /\b(iphone|samsung|galaxy|macbook|hp|dell|pixel|redmi|tecno|infinix|ipad|apple watch)\b/i.test(trimmed) ||
    /\b(\d+%\s*bh|bh\s*[:\-]?\s*\d+%?|esim|physical\s*sim|unlocked|tokunbo|clean|ram|ssd)\b/i.test(trimmed);

  if (!hasGadgetClues) return null;

  let working = trimmed;

  // 1. Extract Price (e.g. ₦770k, ₦1.2m, ₦600k, 750000)
  const priceMatches = working.match(/(?:₦|#)\s*([\d]+(?:[,\.][\d]+)*\s*(?:k|m|million|thousand)?)/i) ||
    working.match(/\b([\d]+(?:[,\.][\d]+)*\s*(?:k|m))\b/i);

  let price = 0;
  if (priceMatches) {
    const parsed = parsePriceNumber(priceMatches[1]);
    if (parsed && parsed > 100) {
      price = parsed;
      working = working.replace(priceMatches[0], ' ');
    }
  }

  // 2. Battery Health (e.g. 96% BH, 96%, BH 96%)
  let batteryHealth: number | null = null;
  const bhMatch = working.match(/\b(?:BH\s*[:\-]?\s*)?(\d{2,3})%\s*(?:BH|Battery\s*Health)?\b/i) ||
    working.match(/\b(\d{2,3})%\s*BH\b/i);
  if (bhMatch) {
    const val = parseInt(bhMatch[1], 10);
    if (val >= 50 && val <= 100) {
      batteryHealth = val;
      working = working.replace(bhMatch[0], ' ');
    }
  }

  // 3. SIM configuration (e.g. Physical + eSIM, Dual eSIM, eSIM, Physical SIM)
  let simConfig: string | undefined;
  const simMatch = working.match(/\b(physical\s*\+\s*esim|dual\s*esim|dual\s*physical|physical\s*sim|esim)\b/i);
  if (simMatch) {
    const lower = simMatch[1].toLowerCase();
    if (lower.includes('+')) simConfig = 'Physical + eSIM';
    else if (lower.includes('dual esim')) simConfig = 'Dual eSIM';
    else if (lower.includes('dual physical')) simConfig = 'Dual Physical SIM';
    else if (lower.includes('esim')) simConfig = 'eSIM';
    else simConfig = 'Physical SIM';
    working = working.replace(simMatch[0], ' ');
  }

  // 4. Lock status (e.g. Factory Unlocked, Chip Unlocked, Unlocked, Locked)
  let lockStatus: string | undefined;
  const lockMatch = working.match(/\b(factory\s*unlocked|chip\s*unlocked|fu\b|unlocked|carrier\s*locked|locked)\b/i);
  if (lockMatch) {
    const lower = lockMatch[1].toLowerCase();
    if (lower.includes('factory') || lower === 'fu') lockStatus = 'Factory Unlocked';
    else if (lower.includes('chip')) lockStatus = 'Chip Unlocked';
    else if (lower.includes('carrier') || lower === 'locked') lockStatus = 'Locked';
    else lockStatus = 'Unlocked';
    working = working.replace(lockMatch[0], ' ');
  }

  // 5. Condition / Grade (e.g. 9/10 clean, clean 9/10, clean, open box, sealed & active, brand new, uk used)
  let condition: string | undefined;
  const condMatch = working.match(
    /\b(sealed\s*&\s*active|brand\s*new\s*non-active|brand\s*new|open\s*box|clean\s*\d\/\d+|\d\/\d+\s*clean|clean|direct\s*intact|tokunbo|uk\s*used|london\s*used|grade\s*[a-c])\b/i
  );
  if (condMatch) {
    const raw = condMatch[1].trim();
    if (/9\/10\s*clean|clean\s*9\/10/i.test(raw)) condition = 'Clean 9/10';
    else if (/sealed/i.test(raw)) condition = 'Sealed & Active';
    else if (/open\s*box/i.test(raw)) condition = 'Open Box';
    else if (/tokunbo/i.test(raw)) condition = 'Tokunbo';
    else if (/london/i.test(raw)) condition = 'London Used';
    else if (/uk\s*used/i.test(raw)) condition = 'UK Used';
    else if (/brand\s*new/i.test(raw)) condition = 'Brand New';
    else if (/clean/i.test(raw)) condition = 'Clean Condition';
    else condition = raw;
    working = working.replace(condMatch[0], ' ');
  }

  // 6. Storage (e.g. 64GB, 128GB, 256GB, 512GB, 1TB)
  let storage: string | undefined;
  const storageMatch = working.match(/\b(64\s*GB|128\s*GB|256\s*GB|512\s*GB|1\s*TB|2\s*TB)\b/i);
  if (storageMatch) {
    storage = storageMatch[1].replace(/\s+/g, '').toUpperCase();
    working = working.replace(storageMatch[0], ' ');
  }

  // 7. RAM (e.g. 8GB RAM, 16GB RAM or combined 8/256)
  let ram: string | undefined;
  const ramMatch = working.match(/\b(\d{1,2}\s*GB)\s*RAM\b/i);
  if (ramMatch) {
    ram = ramMatch[1].replace(/\s+/g, '').toUpperCase() + ' RAM';
    working = working.replace(ramMatch[0], ' ');
  }

  // 8. Colour
  let color: string | undefined;
  const colorMatch = working.match(
    /\b(natural\s*titanium|black\s*titanium|white\s*titanium|blue\s*titanium|space\s*black|space\s*grey|silver|gold|rose\s*gold|midnight|starlight|graphite|alpine\s*green|deep\s*purple|sierra\s*blue|pacific\s*blue|phantom\s*black|cream|lavender|white|black|blue|red|green|purple|pink|yellow|orange)\b/i
  );
  if (colorMatch) {
    color = colorMatch[1]
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    working = working.replace(colorMatch[0], ' ');
  }

  // 9. Clean Title from remaining tokens
  let title = working
    .replace(/[/,\-–—|•*~`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If title still has residual empty symbols
  if (!title || title.length < 3) {
    title = 'Gadget Listing';
  }

  const category = guessCategory(input);

  // Compile specs list in reseller standard order
  const specs: string[] = [];
  if (storage) specs.push(storage);
  if (ram) specs.push(ram);
  if (simConfig) specs.push(simConfig);
  if (batteryHealth !== null) specs.push(`${batteryHealth}% Battery Health`);
  if (condition) specs.push(condition);
  if (color) specs.push(`Colour: ${color}`);
  if (lockStatus) specs.push(lockStatus);

  const gadgetSpecs: StructuredGadgetSpecs = {
    model: title,
    storage,
    ram,
    batteryHealth,
    simConfig,
    condition,
    color,
    lockStatus,
  };

  return {
    title,
    category,
    specs,
    priceOptions: price > 0 ? [{ label: null, amount: price }] : [],
    tagline: null,
    badges: condition ? [condition] : [],
    gadgetSpecs,
  };
}

/**
 * Local Fallback Parser
 * Runs purely client-side without any network request.
 * Guaranteed 100% backward compatible with regression tests.
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

  // Check for single line reseller gadget shorthand first (before naive slash splitting)
  const newlineLines = rawInput.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (newlineLines.length === 1) {
    const singleResult = parseSingleLineGadget(newlineLines[0]);
    if (singleResult) {
      return singleResult;
    }
  }

  // Split input into lines or slash chunks if single line
  let rawLines = newlineLines;
  if (rawLines.length === 1 && rawLines[0].includes(' / ') && !rawLines[0].includes('GB /')) {
    rawLines = rawLines[0].split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean);
  }

  // Strip residual markdown symbols from all candidate lines
  rawLines = rawLines
    .map((l) =>
      l
        .replace(/^[*•~`\-\s]+|[*•~`\-\s]+$/g, '')
        .replace(/[*~`]/g, '')
        .trim()
    )
    .filter(Boolean);

  // Extract prices first
  const { priceOptions, nonPriceLines } = extractPricesFromText(rawLines);

  const badges = detectBadges(rawInput);

  // Filter out lines that are purely badges (e.g. "🇺🇸Direct Intact" or "Direct Tokunbo 2026 Entry US Import")
  const contentLines: string[] = [];
  for (const line of nonPriceLines) {
    const isPureBadge =
      /^(?:🇺🇸|🇬🇧)?\s*(?:direct\s*(?:intact|tokunbo)|(?:us|usa)\s*import|\d{4}\s*entry|london\s*used)$/i.test(line);
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
