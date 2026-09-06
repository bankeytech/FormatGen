import { toBoldItalic } from './src/utils/unicode.js';
import { formatPrice, formatPriceParts } from './src/utils/price.js';
import { renderTemplate } from './src/services/templates.js';
import { parseLocalFallback } from './src/services/fallbackParser.js';
import { SAMPLE_INPUTS } from './src/data/sampleInputs.js';

console.log('--- Testing Unicode Bold Italic ---');
const testStr = 'iPhone 15 Pro Max!';
const boldItalicStr = toBoldItalic(testStr);
console.log('Original:', testStr);
console.log('Bold Italic:', boldItalicStr);
// Verify specific characters
console.log('A ->', toBoldItalic('A'), 'codePoint:', toBoldItalic('A').codePointAt(0)?.toString(16));
console.log('a ->', toBoldItalic('a'), 'codePoint:', toBoldItalic('a').codePointAt(0)?.toString(16));
console.log('k ->', toBoldItalic('k'), 'codePoint:', toBoldItalic('k').codePointAt(0)?.toString(16));
console.log('m ->', toBoldItalic('m'), 'codePoint:', toBoldItalic('m').codePointAt(0)?.toString(16));

console.log('\n--- Testing Price Formatter ---');
console.log('670000 full:', formatPrice(670000, 'full'));
console.log('670000 abbr:', formatPrice(670000, 'abbreviated'));
console.log('1200000 full:', formatPrice(1200000, 'full'));
console.log('1200000 abbr:', formatPrice(1200000, 'abbreviated'));
console.log('22800000 abbr:', formatPrice(22800000, 'abbreviated'));
console.log('85000 abbr:', formatPrice(85000, 'abbreviated'));

console.log('\n--- Testing Fallback Parser & Template Rendering on Samples ---');
SAMPLE_INPUTS.forEach((sample, i) => {
  console.log(`\n================== Sample ${i + 1}: ${sample.label} ==================`);
  const post = parseLocalFallback(sample.rawText);
  console.log('Parsed Post:', JSON.stringify(post, null, 2));

  console.log('\n>>> Template 1: Classic');
  console.log(renderTemplate(post, 'classic'));

  console.log('\n>>> Template 2: Catchy');
  console.log(renderTemplate(post, 'catchy'));

  console.log('\n>>> Template 3: Minimal');
  console.log(renderTemplate(post, 'minimal'));

  console.log('\n>>> Template 4: Story');
  console.log(renderTemplate(post, 'story'));
});

console.log('\nAll core tests executed successfully!');
