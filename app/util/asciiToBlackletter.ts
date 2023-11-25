const A = 'A'.codePointAt(0)!;
const Z = 'Z'.codePointAt(0)!;
const a = 'a'.codePointAt(0)!;
const z = 'z'.codePointAt(0)!;

const 𝔄 = '𝔄'.codePointAt(0)!;
const 𝔞 = '𝔞'.codePointAt(0)!;

export function asciiToBlackLetter(text?: string) {
  if (!text) return text;

  const chars = [...text];
  return chars
    .map((char) => {
      const codePoint = char.codePointAt(0)!;
      // if in uppercase ascii range
      if (A <= codePoint && codePoint <= Z) {
        return String.fromCodePoint(codePoint + 𝔄 - A);
      }

      // if in lowercae ascii range
      if (a <= codePoint && codePoint <= z) {
        // shift to blackletter range
        return String.fromCodePoint(codePoint + 𝔞 - a);
      }

      return char;
    })
    .join('');
}
