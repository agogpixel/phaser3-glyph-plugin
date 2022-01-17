/**
 * Utilities module.
 *
 * @author kidthales <kidthales@agogpixel.com>
 * @copyright 2021-present AgogPixel
 * @license {@link https://agogpixel.github.io/phaser3-glyph-plugin/LICENSE|MIT License}
 * @module
 */

import colorString from 'color-string';

////////////////////////////////////////////////////////////////////////////////
// Bytes
////////////////////////////////////////////////////////////////////////////////

/**
 * Alias for Uint8Array type.
 */
export type Bytes = Uint8Array;

/**
 * Get bytes from hex string.
 * @param hex Hexadecimal string.
 * @returns Bytes corresponding to hex string representation.
 * @throws Error if hex string contains invalid characters or has odd length.
 */
export function getBytesFromHexString(hex: string): Bytes {
  if (hex.match(/^[0-9A-Fa-f]+$/) === null) {
    throw new Error(`Invalid hex string: ${hex}`);
  } else if (hex.length % 2 !== 0) {
    throw new Error(`Invalid hex string length (odd): ${hex.length}`);
  }

  const regex = /.{1,2}/g;
  return new Uint8Array(hex.match(regex).map((b) => parseInt(b, 16)));
}

/**
 * Get hex string from bytes.
 * @param bytes Uint8Array reference.
 * @returns Hex string representation of bytes.
 */
export function getHexStringFromBytes(bytes: Bytes) {
  return bytes.reduce((s, c) => s + c.toString(16).padStart(2, '0'), '');
}

////////////////////////////////////////////////////////////////////////////////
// CodePoint
////////////////////////////////////////////////////////////////////////////////

/**
 * Alias for number type.
 */
export type CodePoint = number;

/**
 * Get bytes from code point.
 * @param codePoint UTF-16 code point.
 * @returns Bytes corresponding to the UTF-16 code point value.
 */
export function getBytesFromCodePoint(codePoint: CodePoint): Bytes {
  const parts: number[] = [];

  if (codePoint > 0xffff) {
    // Astral.
    parts.push((codePoint >> 24) & 0xff, (codePoint >> 16) & 0xff);
  }

  // BMP.
  parts.push((codePoint >> 8) & 0xff, codePoint & 0xff);

  return new Uint8Array(parts);
}

/**
 * Get UTF-16 code point from bytes.
 * @param bytes Uint8Array reference.
 * @returns UTF-16 code point value corresponding to bytes.
 * @throws Error if bytes length is not 2 or 4.
 */
export function getCodePointFromBytes(bytes: Bytes): CodePoint {
  const len = bytes.length;

  if (len !== 2 && len !== 4) {
    throw new Error(`Invalid bytes length: ${len}; code point bytes must be 2 or 4 in length`);
  }

  return (
    (len === 4
      ? ((bytes[0] & 0xff) << 24) | ((bytes[1] & 0xff) << 16) | ((bytes[2] & 0xff) << 8) | (bytes[3] & 0xff)
      : ((bytes[0] & 0xff) << 8) | (bytes[1] & 0xff)) >>> 0 // Sign bit is 0.
  );
}

/**
 * Get UTF-16 code point from hex string.
 * @param hex Hexadecimal string.
 * @returns UTF-16 code point value corresponding to hex string.
 * @throws Error if hex string contains invalid characters or has odd length or
 * results in a value with byte length that is not 2 or 4.
 */
export function getCodePointFromHexString(hex: string): CodePoint {
  return getCodePointFromBytes(getBytesFromHexString(hex));
}

/**
 * Get hex string from UTF-16 code point.
 * @param codePoint UTF-16 code point.
 * @returns Hex string representation of UTF-16 code point value.
 */
export function getHexStringFromCodePoint(codePoint: CodePoint) {
  return getHexStringFromBytes(getBytesFromCodePoint(codePoint));
}

////////////////////////////////////////////////////////////////////////////////
// Color
////////////////////////////////////////////////////////////////////////////////

/**
 * String literal type indicating CSS color notation.
 */
export type CssColorNotation = 'hexadecimal' | 'functional';

/**
 * Get bytes from [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance.
 * @param color Phaser.Display.Color instance.
 * @returns Bytes corresponding to the Phaser.Display.Color instance, in RGBA
 * order.
 */
export function getBytesFromColor(color: Phaser.Display.Color): Bytes {
  return new Uint8Array([color.red, color.green, color.blue, color.alpha]);
}

/**
 * Get [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance from bytes, in RGBA order.
 * @param bytes Uint8Array reference.
 * @returns [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance corresponding to bytes.
 * @throws Error if bytes length is not 3 or 4.
 */
export function getColorFromBytes(bytes: Bytes) {
  const len = bytes.length;

  if (len !== 3 && len !== 4) {
    throw new Error(`Invalid bytes length: ${len}; color bytes must be 3 or 4 in length`);
  }

  return new Phaser.Display.Color(...bytes);
}

/**
 * Get [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance from hex string, in RGBA order.
 * @param hex Hexadecimal string.
 * @returns [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance corresponding to hex string.
 * @throws Error if hex string contains invalid characters or has odd length or
 * results in a value with byte length that is not 3 or 4.
 */
export function getColorFromHexString(hex: string) {
  return getColorFromBytes(getBytesFromHexString(hex));
}

/**
 * Get CSS color string in specified notation from [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance.
 * @param notation CSS color notation.
 * @param color [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance.
 * @returns CSS color string corresponding to specified notation &
 * [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance.
 */
export function getCssColorStringFromColor(notation: CssColorNotation, color: Phaser.Display.Color) {
  const prop = notation === 'functional' ? 'rgb' : 'hex';
  return colorString.to[prop](color.red, color.green, color.blue, roundToDecimal(color.alpha / 255, 3));
}

/**
 * Get hex string from [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance.
 * @param color [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance.
 * @returns Hex string corresponding to [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance, in RGBA order.
 */
export function getHexStringFromColor(color: Phaser.Display.Color) {
  return getHexStringFromBytes(getBytesFromColor(color));
}

////////////////////////////////////////////////////////////////////////////////
// Font
////////////////////////////////////////////////////////////////////////////////

/**
 * Union of CSS font style values.
 */
export type FontStyle = 'normal' | 'italic' | 'oblique';

/**
 * Union of CSS font variant values.
 */
export type FontVariant = 'normal' | 'small-caps';

/**
 * Union of CSS font weight values.
 */
export type FontWeight =
  | 'normal'
  | 'bold'
  | 'bolder'
  | 'lighter'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

/**
 * Default font style.
 */
export const defaultFontStyle = 'normal';

/**
 * Default font variant.
 */
export const defaultFontVariant = 'normal';

/**
 * Default font weight.
 */
export const defaultFontWeight = 'normal';

/**
 * Maintains state for a given CSS font configuration.
 */
export class Font {
  /**
   * Clone provided font.
   * @param font Font to clone.
   * @returns Cloned font.
   */
  static clone(font: Font): Font {
    return new Font(font.size, font.family, font.weight, font.style, font.variant);
  }

  /**
   * Get font as CSS value string.
   */
  get css() {
    return `${this.style} ${this.variant} ${this.weight} ${this.size}px ${this.family}`;
  }

  /**
   * Instantiate font.
   *
   * @param size Font size.
   * @param family Font family.
   * @param weight (Default: 'normal') Font weight.
   * @param style (Default: 'normal') Font style.
   * @param variant (Default: 'normal') Font variant.
   */
  constructor(
    public size: number,
    public family: string,
    public weight: FontWeight = defaultFontWeight,
    public style: FontStyle = defaultFontStyle,
    public variant: FontVariant = defaultFontVariant
  ) {
    // Handle null.
    this.weight = weight || defaultFontWeight;
    this.style = style || defaultFontStyle;
    this.variant = variant || defaultFontVariant;
  }

  /**
   * Get a string representation of a font object.
   * @returns A string representing the font object.
   */
  toString() {
    return `Font: ${this.css}`;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Math
////////////////////////////////////////////////////////////////////////////////

/**
 * Round number to specified amount of decimal places.
 * @param value Number to round.
 * @param decimal Number of decimal places to keep.
 * @returns Number rounded to specified number of decimal places.
 */
export function roundToDecimal(value: number, decimal: number) {
  return +(Math.round((value + `e+${decimal}`) as unknown as number) + `e-${decimal}`);
}
