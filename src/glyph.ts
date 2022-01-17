/**
 * Glyph module.
 *
 * @author kidthales <kidthales@agogpixel.com>
 * @copyright 2021-present AgogPixel
 * @license {@link https://agogpixel.github.io/phaser3-glyph-plugin/LICENSE|MIT License}
 * @module
 */

import colorString from 'color-string';

import type { CodePoint, CssColorNotation } from './utils';
import {
  getCodePointFromHexString,
  getColorFromHexString,
  getCssColorStringFromColor,
  getHexStringFromCodePoint,
  getHexStringFromColor
} from './utils';

////////////////////////////////////////////////////////////////////////////////
// CharLike
////////////////////////////////////////////////////////////////////////////////

/**
 * Union of types suitable for representing a UTF-16 character.
 */
export type CharLike = number | string;

/**
 * Normalize specified CharLike to UTF-16 code point.
 *
 * @param ch CharLike to normalize.
 * @returns UTF-16 code point.
 */
export function normalizeCharLike(ch: CharLike): CodePoint {
  // Sign bit is 0.
  return (typeof ch === 'string' ? ch.normalize().codePointAt(0) : ch) >>> 0;
}

////////////////////////////////////////////////////////////////////////////////
// ColorLike
////////////////////////////////////////////////////////////////////////////////

/**
 * Union of various types suitable for RGB & RGBA color representation.
 */
export type ColorLike =
  | number
  | string
  | Phaser.Types.Display.ColorObject
  | Phaser.Types.Display.InputColorObject
  | Phaser.Display.Color;

/**
 * Normalize specified ColorLike to [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance.
 * @param color ColorLike to normalize.
 * @returns [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance.
 * @throws Error if ColorLike is an invalid type or an invalid color string.
 */
export function normalizeColorLike(color: ColorLike) {
  if (color instanceof Phaser.Display.Color) {
    return color;
  }

  if (color && typeof color === 'object') {
    return new Phaser.Display.Color(
      color.r || 0,
      color.g || 0,
      color.b || 0,
      typeof color.a !== 'number' ? 255 : color.a
    );
  }

  if (typeof color === 'number') {
    const c = Phaser.Display.Color.IntegerToRGB(color);
    return new Phaser.Display.Color(c.r, c.g, c.b, c.a);
  }

  if (typeof color === 'string') {
    const c = colorString.get.rgb(color);

    if (!c) {
      throw new Error(`Invalid color string: ${color}`);
    }

    return new Phaser.Display.Color(c[0], c[1], c[2], Math.round(c[3] * 255));
  }

  throw new TypeError('Invalid color type provided');
}

////////////////////////////////////////////////////////////////////////////////
// Glyph
////////////////////////////////////////////////////////////////////////////////

/**
 * Glyph JSON interface.
 */
export type GlyphJson = [number, [number, number, number, number?], [number, number, number, number?]];

/**
 * Glyph abstract data type.
 */
export class Glyph {
  /**
   * Rehydrate a Glyph instance from hex string representation.
   * @param hex Hexadecimal string.
   * @returns Glyph instance.
   * @throws Error if hex string contains invalid characters or has length that is not 20 or 24.
   */
  static fromHexString(hex: string) {
    const len = hex.length;

    if (len !== 20 && len !== 24) {
      throw new Error(`Invalid glyph hex string length: ${len}; must be 20 or 24`);
    }

    return new Glyph(
      getCodePointFromHexString(hex.slice(16)),
      getColorFromHexString(hex.slice(0, 8)),
      getColorFromHexString(hex.slice(8, 16))
    );
  }

  /**
   * Rehydrate a Glyph instance from JSON string representation.
   * @param json JSON string.
   * @returns Glyph instance.
   * @throws Error if JSON string contains invalid characters or does not
   * conform to GlyphJson type.
   */
  static fromJsonString(json: string) {
    const glyph = JSON.parse(json) as GlyphJson;
    return new Glyph(glyph[0], new Phaser.Display.Color(...glyph[1]), new Phaser.Display.Color(...glyph[2]));
  }

  /**
   * Rehydrate a Glyph instance from a texture that contains a valid key.
   * @param texture Phaser texture instance.
   * @returns Glyph instance.
   * @throws Error if texture key is invalid.
   */
  static fromTexture(texture: Phaser.Textures.Texture) {
    return Glyph.fromHexString(texture.key.split(' ')[0]);
  }

  /**
   * Instantiate glyph abstract data type.
   * @param codePoint Code point.
   * @param foregroundColor Foreground color.
   * @param backgroundColor Background color.
   */
  constructor(
    public codePoint: number,
    public foregroundColor: Phaser.Display.Color,
    public backgroundColor: Phaser.Display.Color
  ) {}

  /**
   * Get string representation of current code point.
   * @returns String representation of current code point.
   */
  getCh() {
    return String.fromCodePoint(this.codePoint);
  }

  /**
   * Get CSS color strings for foreground & background colors, in specified
   * notation.
   * @param notation CSS color notation.
   * @returns Tuple containing foreground & background colors in specified
   * CSS color string notation.
   */
  getCssColors(notation: CssColorNotation) {
    return [
      getCssColorStringFromColor(notation, this.foregroundColor),
      getCssColorStringFromColor(notation, this.backgroundColor)
    ] as [string, string];
  }

  /**
   * Get hex string representation of glyph instance.
   * @returns Hex string representation of glyph instance.
   */
  toHexString() {
    return (
      getHexStringFromColor(this.foregroundColor) +
      getHexStringFromColor(this.backgroundColor) +
      getHexStringFromCodePoint(this.codePoint)
    );
  }

  /**
   * Get JSON string representation of glyph instance.
   * @returns JSON string representation of glyph instance.
   */
  toJsonString() {
    const fg = this.foregroundColor;
    const bg = this.backgroundColor;

    return JSON.stringify([
      this.codePoint,
      [fg.red, fg.green, fg.blue].concat(fg.alpha !== 255 ? [fg.alpha] : []),
      [bg.red, bg.green, bg.blue].concat(bg.alpha !== 255 ? [bg.alpha] : [])
    ] as GlyphJson);
  }

  /**
   * Get string representation of glyph instance.
   * @returns String representation of glyph instance.
   */
  toString() {
    return this.toJsonString();
  }
}

////////////////////////////////////////////////////////////////////////////////
// GlyphLike
////////////////////////////////////////////////////////////////////////////////

/**
 * Object mapping character, foreground color, & optional background color types that
 * can be used to represent a glyph.
 */
export type GlyphLikeObject = { ch: CharLike; fg: ColorLike; bg?: ColorLike };

/**
 * Tuple of character, foreground color, & optional background color types that
 * can be used to represent a glyph.
 */
export type GlyphLikeTuple = [CharLike, ColorLike, ColorLike?];

/**
 * Character, foreground color, & optional background color data that can be
 * used to represent a glyph.
 */
export type GlyphLike = GlyphLikeObject | GlyphLikeTuple;

/**
 * Normalize specified GlyphLike to {@link Glyph} instance.
 * @param glyph GlyphLike to normalize.
 * @returns A {@link Glyph} instance corresponding to specified GlyphLike.
 * @throws Error if ColorLike component(s) are an invalid type or an invalid
 * color string.
 */
export function normalizeGlyphLike(glyph: GlyphLike) {
  let codePoint: number;
  let foregroundColor: Phaser.Display.Color;
  let backgroundColorCandidate: ColorLike;

  if (Array.isArray(glyph)) {
    codePoint = normalizeCharLike(glyph[0]);
    foregroundColor = normalizeColorLike(glyph[1]);
    backgroundColorCandidate = glyph.length === 3 ? glyph[2] : undefined;
  } else {
    codePoint = normalizeCharLike(glyph.ch);
    foregroundColor = normalizeColorLike(glyph.fg);
    backgroundColorCandidate = glyph.bg;
  }

  return new Glyph(
    codePoint,
    foregroundColor,
    normalizeColorLike(
      backgroundColorCandidate !== undefined && backgroundColorCandidate !== null
        ? backgroundColorCandidate
        : 'rgba(0, 0, 0, 0)'
    )
  );
}
