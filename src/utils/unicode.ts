/**
 * Converts Latin letters A-Z and a-z to Mathematical Bold Italic Unicode characters.
 * Digits, spaces, punctuation, symbols, and emoji remain completely untouched.
 *
 * Uppercase A-Z -> 0x1D468 + (charCode - 'A'.charCodeAt(0))
 * Lowercase a-z -> 0x1D482 + (charCode - 'a'.charCodeAt(0))
 */
export function toBoldItalic(text: string): string {
  if (!text) return '';

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);

    // Check uppercase A-Z (65 to 90)
    if (charCode >= 65 && charCode <= 90) {
      const codePoint = 0x1d468 + (charCode - 65);
      result += String.fromCodePoint(codePoint);
    }
    // Check lowercase a-z (97 to 122)
    else if (charCode >= 97 && charCode <= 122) {
      const codePoint = 0x1d482 + (charCode - 97);
      result += String.fromCodePoint(codePoint);
    }
    // Leave digits, spaces, punctuation, emoji unchanged
    else {
      result += text[i];
    }
  }
  return result;
}

/**
 * Converts Latin letters A-Z and a-z to Mathematical Sans-Serif Bold Unicode characters.
 */
export function toBoldSans(text: string): string {
  if (!text) return '';

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);

    if (charCode >= 65 && charCode <= 90) {
      const codePoint = 0x1d5d4 + (charCode - 65);
      result += String.fromCodePoint(codePoint);
    } else if (charCode >= 97 && charCode <= 122) {
      const codePoint = 0x1d5ee + (charCode - 97);
      result += String.fromCodePoint(codePoint);
    } else {
      result += text[i];
    }
  }
  return result;
}

/**
 * Converts text into Title Case
 */
export function toTitleCase(text: string): string {
  if (!text) return '';
  return text.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

/**
 * Applies custom Title formatting based on user preference
 */
export function formatTitleByStyle(
  title: string,
  style: 'bold_unicode' | 'wa_bold' | 'uppercase' | 'titlecase' | 'normal'
): string {
  const trimmed = title.trim();
  switch (style) {
    case 'bold_unicode':
      return toBoldItalic(trimmed);
    case 'wa_bold':
      return `*${trimmed}*`;
    case 'uppercase':
      return `*${trimmed.toUpperCase()}*`;
    case 'titlecase':
      return `*${toTitleCase(trimmed)}*`;
    case 'normal':
    default:
      return trimmed;
  }
}
