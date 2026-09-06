import { parseLocalFallback } from './src/services/fallbackParser';
import { renderCatchyTemplate } from './src/services/templates';
import type { ProductPost } from './src/types';

console.log('=== Running Regression Test ===');

const regressionInput = `*🇺🇸Direct Intact*
OpenBox 13-inch
MacBook Pro 2022
M2 Chip
8GB / 512GB
*₦1,100,000*`;

const expectedPost: ProductPost = {
  title: 'MacBook Pro 13" (2022)',
  category: 'laptop',
  specs: ['M2 Chip', '8GB RAM', '512GB SSD', 'Open Box'],
  priceOptions: [{ label: null, amount: 1100000 }],
  tagline: null,
  badges: ['Direct Intact 🇺🇸'],
};

const expectedCatchyRender = `🇺🇸 𝑴𝒂𝒄𝑩𝒐𝒐𝒌 𝑷𝒓𝒐 13" (2022)

~ 𝑴2 𝑪𝒉𝒊𝒑
~ 8𝑮𝑩 𝑹𝑨𝑴
~ 512𝑮𝑩 𝑺𝑺𝑫
~ 𝑶𝒑𝒆𝒏 𝑩𝒐𝒙
~ 𝑫𝒊𝒓𝒆𝒄𝒕 𝑰𝒏𝒕𝒂𝒄𝒕 🇺🇸

₦1.1𝒎`;

// 1. Verify Fallback Parser on Regression Input
const parsed = parseLocalFallback(regressionInput);
console.log('1. Parsed Post:', JSON.stringify(parsed, null, 2));

const titleMatches = parsed.title === expectedPost.title;
const categoryMatches = parsed.category === expectedPost.category;
const specsMatches = JSON.stringify(parsed.specs) === JSON.stringify(expectedPost.specs);
const priceMatches = JSON.stringify(parsed.priceOptions) === JSON.stringify(expectedPost.priceOptions);
const badgesMatches = JSON.stringify(parsed.badges) === JSON.stringify(expectedPost.badges);

console.log('Title Match:', titleMatches);
console.log('Category Match:', categoryMatches);
console.log('Specs Match:', specsMatches);
console.log('Price Match:', priceMatches);
console.log('Badges Match:', badgesMatches);

if (!titleMatches || !categoryMatches || !specsMatches || !priceMatches || !badgesMatches) {
  console.error('FAILED: Parsed Post does not match expected schema.');
  process.exit(1);
}

// 2. Verify Catchy Template Render on Regression Post
const catchyRender = renderCatchyTemplate(parsed);
console.log('\n2. Rendered Catchy Format:\n' + catchyRender);

if (catchyRender !== expectedCatchyRender) {
  console.error('FAILED: Catchy format output does not match expected output.');
  console.log('Diff:');
  console.log('Expected:', JSON.stringify(expectedCatchyRender));
  console.log('Actual:  ', JSON.stringify(catchyRender));
  process.exit(1);
}

console.log('\n=== All Regression Tests PASSED! ===');
