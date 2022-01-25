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
 * @see {@link CodePoint}
 */
export type CharLike = CodePoint | string;

/**
 * Normalize specified {@link CharLike} to UTF-16 {@link CodePoint}.
 *
 * @param ch {@link CharLike} to normalize.
 * @returns UTF-16 {@link CodePoint}.
 * @internal
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
 * @see [Phaser.Types.Display.ColorObject](https://photonstorm.github.io/phaser3-docs/Phaser.Types.Display.html#.ColorObject__anchor)
 * @see [Phaser.Types.Display.InputColorObject](https://photonstorm.github.io/phaser3-docs/Phaser.Types.Display.html#.InputColorObject__anchor)
 * @see [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 */
export type ColorLike =
  | number
  | string
  | Phaser.Types.Display.ColorObject
  | Phaser.Types.Display.InputColorObject
  | Phaser.Display.Color;

/**
 * Normalize specified {@link ColorLike} to [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance. Accepts the following:
 * - `number`: Parsed as `0xRRGGBB` or `0xAARRGGBB` as appropriate.
 * - `string`: CSS color name, hexadecimal string (`#RGB`, `#RRGGBB`, `#RGBA`,
 * `#RRGGBBAA`), or functional string (`rgb(...)` or `rgba(...)`).
 * - [Phaser.Types.Display.ColorObject](https://photonstorm.github.io/phaser3-docs/Phaser.Types.Display.html#.ColorObject__anchor)
 * - [Phaser.Types.Display.InputColorObject](https://photonstorm.github.io/phaser3-docs/Phaser.Types.Display.html#.InputColorObject__anchor)
 * - [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * @param color {@link ColorLike} to normalize.
 * @returns [Phaser.Display.Color](https://photonstorm.github.io/phaser3-docs/Phaser.Display.Color.html)
 * instance.
 * @throws Error if {@link ColorLike} is an invalid type or an invalid color string.
 * @internal
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
 * - `[codePoint, fgColor, bgColor]`
 *   - fgColor: `[red, green, blue, alpha]`
 *   - bgColor: `[red, green, blue, alpha]`
 * @internal
 */
export type GlyphJson = [number, [number, number, number, number?], [number, number, number, number?]];

/**
 * Glyph abstract data type.
 * @internal
 */
export class Glyph {
  /**
   * Rehydrate a {@link Glyph} instance from hex string representation.
   * @param hex Hexadecimal string.
   * @returns A {@link Glyph} instance.
   * @throws Error if hex string contains invalid characters or has length that
   * is not 20 or 24.
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
   * Rehydrate a {@link Glyph} instance from JSON string representation.
   * @param json JSON string.
   * @returns A {@link Glyph} instance.
   * @throws Error if JSON string contains invalid characters or does not
   * conform to {@link GlyphJson} type.
   */
  static fromJsonString(json: string) {
    const glyph = JSON.parse(json) as GlyphJson;
    return new Glyph(glyph[0], new Phaser.Display.Color(...glyph[1]), new Phaser.Display.Color(...glyph[2]));
  }

  /**
   * Rehydrate a {@link Glyph} instance from a [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * instance that contains a valid key.
   * @param texture [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * instance.
   * @returns A {@link Glyph} instance.
   * @throws Error if texture key is invalid.
   */
  static fromTexture(texture: Phaser.Textures.Texture) {
    return Glyph.fromHexString(Glyph.readHexStringFromTexture(texture));
  }

  /**
   * Read hex string from a [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * instance that contains a valid key.
   * @param texture [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * instance.
   * @returns Hex string.
   * @throws Error if texture key is invalid.
   */
  static readHexStringFromTexture(texture: Phaser.Textures.Texture) {
    return texture.key.split(' ')[0];
  }

  /**
   * Instantiate {@link Glyph} abstract data type.
   * @param codePoint Code point.
   * @param foregroundColor Foreground color.
   * @param backgroundColor Background color.
   */
  constructor(
    public codePoint: CodePoint,
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
   * Get hex string representation of {@link Glyph} instance.
   * @returns Hex string representation of {@link Glyph} instance.
   */
  toHexString() {
    return (
      getHexStringFromColor(this.foregroundColor) +
      getHexStringFromColor(this.backgroundColor) +
      getHexStringFromCodePoint(this.codePoint)
    );
  }

  /**
   * Get JSON string representation of {@link Glyph} instance.
   * @returns JSON string representation of {@link Glyph} instance.
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
   * Get string representation of {@link Glyph} instance.
   * @returns String representation of {@link Glyph} instance.
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
 * @see {@link CharLike}
 * @see {@link ColorLike}
 */
export type GlyphLikeObject = { ch: CharLike; fg: ColorLike; bg?: ColorLike };

/**
 * Tuple of character, foreground color, & optional background color types that
 * can be used to represent a glyph.
 * @see {@link CharLike}
 * @see {@link ColorLike}
 */
export type GlyphLikeTuple = [CharLike, ColorLike, ColorLike?];

/**
 * Character, foreground color, & optional background color data that can be
 * used to represent a glyph.
 * @see {@link CharLike}
 * @see {@link ColorLike}
 * @see {@link GlyphLikeObject}
 * @see {@link GlyphLikeTuple}
 */
export type GlyphLike = GlyphLikeObject | GlyphLikeTuple;

/**
 * Normalize specified {@link GlyphLike} to {@link Glyph} instance.
 * @param glyph {@link GlyphLike} to normalize.
 * @returns A {@link Glyph} instance corresponding to specified {@link GlyphLike}.
 * @throws Error if {@link ColorLike} component(s) are an invalid type or an invalid
 * color string.
 * @internal
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
