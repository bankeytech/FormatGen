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
