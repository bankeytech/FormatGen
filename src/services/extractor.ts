import type { ProductPost, ExtractionResult, AIProvider } from '../types';
import { parseLocalFallback } from './fallbackParser';

const AI_SYSTEM_PROMPT = `You extract structured product data from messy, informally-written sales text
(Nigerian WhatsApp/marketplace style — may include slang, inconsistent casing,
abbreviations like "BH" for Battery Health, "m"/"k" for million/thousand, etc).

Return ONLY valid JSON matching this shape, no commentary, no markdown fences:
{
  "title": string,
  "category": "phone" | "laptop" | "appliance" | "vehicle" | "generic",
  "specs": string[],
  "priceOptions": [{ "label": string | null, "amount": number }],
  "tagline": string | null,
  "badges": string[]
}

Rules:
1. Consolidate Product Identity into ONE Clean Title:
   - Consolidate fragments that describe the product identity (screen size, model name, release year, edition/chip) into ONE clean title, even if they appear on separate input lines.
   - Example: "13-inch" + "MacBook Pro 2022" + "M2 Chip" -> title: "MacBook Pro 13\\" (2022)".
   - Proper casing and clean quotes/parentheses.

2. Detect Origin & Condition Markers as Badges (NOT Specs):
   - Detect origin and condition markers — country flags (🇺🇸, 🇬🇧, etc.), "Direct", "Tokunbo", "OpenBox", "UK Used", "Nigerian Used", "Direct Intact", "US Import" — and put them in "badges", NOT "specs".
   - A flag emoji attached to a condition phrase (e.g. "*🇺🇸Direct Intact*") is ONE single badge, not a spec line (e.g. "Direct Intact 🇺🇸").
   - Note: If "OpenBox" appears as a condition/packaging state alongside specs, put "Open Box" in specs or badges.

3. Split Compound Spec Lines:
   - Split compound spec lines that pack two distinct attributes together, most commonly "RAM / Storage" shorthand like "8GB / 512GB" -> two separate specs: "8GB RAM" and "512GB SSD" (smaller number = RAM, larger = Storage, unless units clearly say otherwise).

4. Strip Residual Markdown & Symbols:
   - Strip residual markdown (asterisks *, stray bullets •, tildes ~, hashtags #) from every extracted field — no output field should ever contain literal *, •, ~, or other input formatting symbols.

5. Pricing:
   - Parse "1.2m" as 1200000, "85,000" as 85000, "45k" as 45000, "*₦1,100,000*" as 1100000, etc.
   - If multiple prices exist (e.g. by variant), return one entry per variant with its label.
   - If only one price, label is null.

6. Category:
   - "phone" | "laptop" | "appliance" | "vehicle" | "generic".

7. Tagline:
   - Only include if the source text has a distinct closing/marketing sentence separate from the spec list. Otherwise null.

8. Precision:
   - Never invent specs, prices, or badges that aren't in the source text.`;

const API_KEY_STORAGE_KEY = 'formatgen_gemini_api_key';
const PROVIDER_STORAGE_KEY = 'formatgen_ai_provider';
const OPENROUTER_MODEL_STORAGE_KEY = 'formatgen_openrouter_model';

export const DEFAULT_OPENROUTER_MODEL = 'google/gemini-2.0-flash-001';

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || localStorage.getItem('formatgen_api_key') || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to save API key to localStorage', err);
  }
}

export function getStoredProvider(): AIProvider {
  try {
    const val = localStorage.getItem(PROVIDER_STORAGE_KEY);
    if (val === 'gemini' || val === 'openrouter' || val === 'auto') return val;
    return 'auto';
  } catch {
    return 'auto';
  }
}

export function setStoredProvider(provider: AIProvider): void {
  try {
    localStorage.setItem(PROVIDER_STORAGE_KEY, provider);
  } catch (err) {
    console.error('Failed to save AI provider to localStorage', err);
  }
}

export function getStoredOpenRouterModel(): string {
  try {
    return localStorage.getItem(OPENROUTER_MODEL_STORAGE_KEY) || DEFAULT_OPENROUTER_MODEL;
  } catch {
    return DEFAULT_OPENROUTER_MODEL;
  }
}

export function setStoredOpenRouterModel(model: string): void {
  try {
    localStorage.setItem(OPENROUTER_MODEL_STORAGE_KEY, model.trim() || DEFAULT_OPENROUTER_MODEL);
  } catch (err) {
    console.error('Failed to save OpenRouter model to localStorage', err);
  }
}

/**
 * Detect or resolve provider based on API key shape or user preference
 */
export function resolveProvider(key: string, preference: AIProvider = 'auto'): 'gemini' | 'openrouter' {
  if (preference === 'gemini') return 'gemini';
  if (preference === 'openrouter') return 'openrouter';

  const trimmed = key.trim();
  // OpenRouter keys typically start with "sk-or-v1-" or "sk-or-"
  if (trimmed.startsWith('sk-or-') || trimmed.startsWith('sk-')) {
    return 'openrouter';
  }
  // Google API keys typically start with "AIza"
  if (trimmed.startsWith('AIza')) {
    return 'gemini';
  }

  // Fallback heuristic: length and characters
  return 'gemini';
}

/**
 * Cached Gemini working model so we don't repeatedly probe on every request
 */
let cachedGeminiModel: string = 'gemini-2.0-flash';

const GEMINI_MODELS_CASCADE = [
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

/**
 * Call Google Gemini with automatic model fallback to avoid "models/gemini-1.5-flash is not found for API version v1beta"
 */
async function callGeminiApi(cleanInput: string, activeKey: string): Promise<string> {
  const modelsToTry = [
    cachedGeminiModel,
    ...GEMINI_MODELS_CASCADE.filter((m) => m !== cachedGeminiModel),
  ];

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(activeKey)}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${AI_SYSTEM_PROMPT}\n\nINPUT TEXT TO PARSE:\n"""\n${cleanInput}\n"""` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData?.error?.message || `API Error ${response.status}: ${response.statusText}`;

        // If key is totally invalid, don't waste time trying other models
        if (response.status === 400 && (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID'))) {
          throw new Error(`Google Gemini Error: ${msg}. (Make sure you are using a key from Google AI Studio, not OpenRouter).`);
        }

        // If model not found or not supported, continue to next model in cascade
        if (response.status === 404 || msg.includes('not found') || msg.includes('not supported')) {
          lastError = new Error(msg);
          continue;
        }

        throw new Error(`Gemini Error: ${msg}`);
      }

      const data = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new Error('Gemini API returned empty response content.');
      }

      // Store the model that succeeded
      cachedGeminiModel = model;
      return candidateText;
    } catch (err: any) {
      lastError = err;
      if (err.message && err.message.includes('API key not valid')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('All Gemini model endpoints failed.');
}

/**
 * Call OpenRouter with OpenAI-compatible endpoint
 */
async function callOpenRouterApi(cleanInput: string, activeKey: string, customModel?: string): Promise<string> {
  const chosenModel = customModel || getStoredOpenRouterModel() || DEFAULT_OPENROUTER_MODEL;
  const modelsToTry = [chosenModel, 'google/gemini-2.0-flash-001', 'google/gemini-flash-1.5', 'meta-llama/llama-3.3-70b-instruct'];

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:5173',
          'X-Title': 'FormatGen',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: AI_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: `INPUT TEXT TO PARSE:\n"""\n${cleanInput}\n"""`,
            },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData?.error?.message || `OpenRouter Error ${response.status}: ${response.statusText}`;

        // If auth failure or credit failure, throw directly
        if (response.status === 401 || msg.toLowerCase().includes('key') || msg.toLowerCase().includes('credit')) {
          throw new Error(`OpenRouter Error: ${msg}`);
        }

        // If specific model not available, try next fallback
        lastError = new Error(msg);
        continue;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error(`OpenRouter model ${model} returned empty content.`);
      }

      return content;
    } catch (err: any) {
      lastError = err;
      if (err.message && (err.message.includes('OpenRouter Error:') || err.message.includes('401'))) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Failed to query OpenRouter.');
}

function stripResidualSymbols(text: string): string {
  if (!text) return '';
  return text
    .replace(/^[*•~`\-\s]+/, '')
    .replace(/[*•~`\-\s]+$/, '')
    .replace(/[*•~`]/g, '')
    .trim();
}

/**
 * Safely parse JSON returned by either AI provider
 */
function parseAiJsonResponse(rawResponse: string): ProductPost {
  const jsonStr = rawResponse
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // Regex fallback to extract JSON object if surrounded by chat chatter
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('AI response did not contain a valid JSON object.');
    }
    parsed = JSON.parse(match[0]);
  }

  const rawTitle = typeof parsed.title === 'string' && parsed.title ? parsed.title : 'Product';
  const cleanTitle = stripResidualSymbols(rawTitle) || 'Product';

  const rawSpecs: string[] = Array.isArray(parsed.specs) ? parsed.specs.map(String) : [];
  const cleanSpecs = rawSpecs
    .map(stripResidualSymbols)
    .filter(Boolean);

  const rawBadges: string[] = Array.isArray(parsed.badges) ? parsed.badges.map(String) : [];
  const cleanBadges = rawBadges
    .map(stripResidualSymbols)
    .filter(Boolean);

  return {
    title: cleanTitle,
    category: ['phone', 'laptop', 'appliance', 'vehicle', 'generic'].includes(parsed.category)
      ? parsed.category
      : 'generic',
    specs: cleanSpecs,
    priceOptions: Array.isArray(parsed.priceOptions)
      ? parsed.priceOptions.map((p: any) => ({
          label: p.label ? stripResidualSymbols(String(p.label)) : null,
          amount: typeof p.amount === 'number' && !isNaN(p.amount) ? p.amount : 0,
        }))
      : [],
    tagline: parsed.tagline ? stripResidualSymbols(String(parsed.tagline)) : null,
    badges: cleanBadges,
  };
}

/**
 * Test an API key by calling the provider with a quick sample
 */
export async function testApiKey(
  key: string,
  providerPref: AIProvider = 'auto'
): Promise<{ success: boolean; message: string; providerUsed: 'gemini' | 'openrouter' }> {
  const trimmed = key.trim();
  if (!trimmed) {
    return { success: false, message: 'Please enter an API key first.', providerUsed: 'gemini' };
  }

  const provider = resolveProvider(trimmed, providerPref);
  const testInput = 'iPhone 13 128GB Factory Unlocked 88% BH 420k clean';

  try {
    if (provider === 'openrouter') {
      const text = await callOpenRouterApi(testInput, trimmed);
      parseAiJsonResponse(text);
      return {
        success: true,
        message: `OpenRouter connected successfully! Working model: ${getStoredOpenRouterModel() || DEFAULT_OPENROUTER_MODEL}`,
        providerUsed: 'openrouter',
      };
    } else {
      const text = await callGeminiApi(testInput, trimmed);
      parseAiJsonResponse(text);
      return {
        success: true,
        message: `Google Gemini connected successfully! Active model: ${cachedGeminiModel}`,
        providerUsed: 'gemini',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Connection test failed.',
      providerUsed: provider,
    };
  }
}

/**
 * Pure extraction function
 * Calls Gemini or OpenRouter API if API key is provided, or gracefully falls back to local parser
 */
export async function extractProduct(
  rawText: string,
  apiKey?: string,
  providerPreference?: AIProvider
): Promise<ExtractionResult> {
  const cleanInput = rawText?.trim();
  if (!cleanInput) {
    return {
      post: parseLocalFallback(''),
      source: 'fallback',
      provider: 'fallback',
      rawInput: rawText,
    };
  }

  const activeKey = apiKey || getStoredApiKey();
  const pref = providerPreference || getStoredProvider();

  // If no API key configured, use local fallback parser directly
  if (!activeKey) {
    const post = parseLocalFallback(cleanInput);
    return {
      post,
      source: 'fallback',
      provider: 'fallback',
      rawInput: cleanInput,
    };
  }

  const resolvedProvider = resolveProvider(activeKey, pref);

  try {
    let candidateText = '';
    if (resolvedProvider === 'openrouter') {
      candidateText = await callOpenRouterApi(cleanInput, activeKey);
    } else {
      candidateText = await callGeminiApi(cleanInput, activeKey);
    }

    const post = parseAiJsonResponse(candidateText);

    return {
      post,
      source: 'ai',
      provider: resolvedProvider,
      rawInput: cleanInput,
    };
  } catch (err: any) {
    console.warn(`AI Extraction (${resolvedProvider}) failed, falling back to local parser:`, err);
    const fallbackPost = parseLocalFallback(cleanInput);
    return {
      post: fallbackPost,
      source: 'fallback',
      provider: 'fallback',
      error: err?.message || 'Could not connect to AI service. Used local parser.',
      rawInput: cleanInput,
    };
  }
}
