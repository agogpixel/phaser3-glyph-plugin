import { charBytesLength, CharLike, getChar, getCharBytes } from './char';
import { colorBytesLength, ColorLike, getColorBytes, getCssRGBA } from './color';

export const glyphBytesLength = 10;

export function getGlyphBytes(charlike: CharLike, fgColorlike: ColorLike, bgColorlike: ColorLike = 'rgba(0, 0, 0, 0)') {
  const bytes = new Uint8Array(glyphBytesLength);

  const charBytes = getCharBytes(charlike);
  const fgColorBytes = getColorBytes(fgColorlike);
  const bgColorBytes = getColorBytes(bgColorlike);

  bytes.set(charBytes);
  bytes.set(fgColorBytes, charBytes.length);
  bytes.set(bgColorBytes, fgColorBytes.length);

  return bytes;
}

export function getGlyphCanvasData(bytes: Uint8Array, start = 0): [string, string, string] {
  if (!bytes.length || bytes.length % glyphBytesLength !== 0) {
    throw new Error(`Invalid glyphs length: ${bytes.length} (must be non-zero multiple of ${glyphBytesLength})`);
  } else if (start % glyphBytesLength !== 0) {
    throw new Error(`Invalid start index: ${start} (must be a multiple of ${glyphBytesLength})`);
  } else if (start > bytes.length - glyphBytesLength) {
    throw new Error(`Invalid start: ${start} (must be less than or equal to ${bytes.length - glyphBytesLength})`);
  }

  return [
    getChar(bytes, start),
    getCssRGBA(bytes, start + charBytesLength),
    getCssRGBA(bytes, start + charBytesLength + colorBytesLength)
  ];
}
