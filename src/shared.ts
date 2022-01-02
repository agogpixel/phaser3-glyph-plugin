import colorString from 'color-string';

/**
 * Union of types suitable for representing a string character.
 */
export type CharLike = number | string;

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
 * Font arguments tuple type.
 */
export type FontArgs = ConstructorParameters<typeof Font>;

/**
 * Union of CSS font family values.
 */
export type FontFamily =
  | 'sans-serif'
  | 'Arial, sans-serif'
  | 'Helvetica, sans-serif'
  | 'Verdana, sans-serif'
  | 'Trebuchet MS, sans-serif'
  | 'Gill Sans, sans-serif'
  | 'Noto Sans, sans-serif'
  | 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif'
  | 'Optima, sans-serif'
  | 'Arial Narrow, sans-serif'
  | 'serif'
  | 'Times, Times New Roman, serif'
  | 'Didot, serif'
  | 'Georgia, serif'
  | 'Palatino, URW Palladio L, serif'
  | 'Bookman, URW Bookman L, serif'
  | 'New Century Schoolbook, TeX Gyre Schola, serif'
  | 'American Typewriter, serif'
  | 'monospace'
  | 'Andale Mono, monospace'
  | 'Courier New, monospace'
  | 'Courier, monospace'
  | 'FreeMono, monospace'
  | 'OCR A Std, monospace'
  | 'DejaVu Sans Mono, monospace'
  | 'cursive'
  | 'Comic Sans MS, Comic Sans, cursive'
  | 'Apple Chancery, cursive'
  | 'Bradley Hand, cursive'
  | 'Brush Script MT, Brush Script Std, cursive'
  | 'Snell Roundhand, cursive'
  | 'URW Chancery L, cursive'
  | 'fantasy'
  | 'Impact, fantasy'
  | 'Luminari, fantasy'
  | 'Chalkduster, fantasy'
  | 'Jazz LET, fantasy'
  | 'Blippo, fantasy'
  | 'Stencil Std, fantasy'
  | 'Marker Felt, fantasy'
  | 'Trattatello, fantasy';

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
 *
 */
export type GlyphLike = [CharLike, ColorLike, ColorLike?];

/**
 *
 */
export type ReadColorsFormat = 'number' | '#RGBA' | 'rgba';

/**
 *
 */
export const bytesPerChar = 2;

/**
 *
 */
export const bytesPerColor = 4;

/**
 *
 */
export const bytesPerGlyph = bytesPerChar + 2 * bytesPerColor;

/**
 *
 */
export const defaultGlyphBackgroundColor = 'rgba(0, 0, 0, 0)';

/**
 *
 * @param start
 * @param end
 * @param multiple
 */
export function checkAmount(start: number, end: number, multiple: number) {
  const amount = end - start;

  if (amount <= 0 || amount % multiple !== 0) {
    throw new Error(
      `Amount of bytes to be read must be a positive non-zero multiple of ${multiple}; amount: ${amount}, start: ${start}, end: ${end}`
    );
  }
}

/**
 *
 * @param buffer
 * @param start
 * @param end
 */
export function checkBufferIndexing(buffer: Uint8Array, start: number, end: number) {
  const result = start >= 0 && end > 0 && end - start > 0 && end <= buffer.length;

  if (!result) {
    throw new Error(`Provided indexes invalid; buffer length: ${buffer.length}, start: ${start}, end: ${end}`);
  }
}

/**
 *
 * @param buffer
 * @param start
 * @param end
 * @returns
 */
export function convertBufferToHexString(buffer: Uint8Array, start = 0, end?: number) {
  end = normalizeBufferEndIndex(buffer, end);
  checkBufferIndexing(buffer, start, end);

  let hex = '';

  for (let i = start; i < end; ++i) {
    hex += buffer[i].toString(16).padStart(2, '0');
  }

  return `0x${hex}`;
}

/**
 *
 * @param charlike
 * @returns
 */
export function convertCharLikeToHexString(charlike: CharLike) {
  const ch = convertCharLikeToString(charlike);
  const len = ch.length;

  if (!len) {
    throw new Error('Empty string');
  }

  let hex = '';

  for (let i = 0; i < len; ++i) {
    hex += ch
      .charCodeAt(i)
      .toString(16)
      .padStart(2 * bytesPerChar, '0');
  }

  return `0x${hex}`;
}

/**
 *
 * @param charlike
 * @returns
 */
export function convertCharLikeToString(charlike: CharLike) {
  return typeof charlike === 'number' ? String.fromCharCode(charlike) : charlike;
}

/**
 *
 * @param glyphs
 * @returns
 */
export function createGlyphsBuffer(glyphs: GlyphLike[]) {
  return writeGlyphsToBuffer(glyphs, new Uint8Array(bytesPerGlyph * glyphs.length));
}

/**
 *
 * @param buffer
 * @param end
 * @returns
 */
export function normalizeBufferEndIndex(buffer: Uint8Array, end?: number) {
  return typeof end !== 'number' ? buffer.length : end;
}

/**
 *
 * @param readColorsFormat
 * @param buffer
 * @param start
 * @param end
 * @returns
 */
export function readColorsFromBuffer<T extends ReadColorsFormat>(
  readColorsFormat: T,
  buffer: Uint8Array,
  start = 0,
  end?: number
) {
  end = normalizeBufferEndIndex(buffer, end);
  checkBufferIndexing(buffer, start, end);
  checkAmount(start, end, bytesPerColor);

  const colors = [] as T extends 'number' ? number[] : string[];

  for (let i = start; i < end; i += bytesPerColor) {
    switch (readColorsFormat) {
      case 'number':
        (colors as number[]).push(
          Phaser.Display.Color.GetColor32(buffer[i], buffer[i + 1], buffer[i + 2], buffer[i + 3])
        );
        break;
      case '#RGBA':
      case 'rgba':
        (colors as string[]).push(
          colorString.to[readColorsFormat === 'rgba' ? 'rgb' : 'hex'](
            buffer[i],
            buffer[i + 1],
            buffer[i + 2],
            +(Math.round((buffer[start + 3] / 255 + 'e+3') as unknown as number) + 'e-3') // Three decimal places.
          )
        );
        break;
    }
  }

  return colors;
}

/**
 *
 * @param readColorsFormat
 * @param buffer
 * @param start
 * @param end
 * @returns
 */
export function readGlyphsFromBuffer<T extends ReadColorsFormat>(
  readColorsFormat: T,
  buffer: Uint8Array,
  start = 0,
  end?: number
) {
  end = normalizeBufferEndIndex(buffer, end);
  checkBufferIndexing(buffer, start, end);
  checkAmount(start, end, bytesPerGlyph);

  const glyphs = [] as T extends 'number' ? [string, number, number][] : [string, string, string][];

  for (let i = start; i < end; i += bytesPerGlyph) {
    const chStart = i;
    const chEnd = chStart + bytesPerChar;
    const fgStart = chEnd;
    const fgEnd = fgStart + bytesPerColor;
    const bgStart = fgEnd;
    const bgEnd = bgStart + bytesPerColor;

    glyphs.push([
      readStringFromBuffer(buffer, chStart, chEnd),
      readColorsFromBuffer(readColorsFormat, buffer, fgStart, fgEnd)[0] as never,
      readColorsFromBuffer(readColorsFormat, buffer, bgStart, bgEnd)[0] as never
    ]);
  }

  return glyphs;
}

/**
 *
 * @param buffer
 * @param start
 * @param end
 * @returns
 */
export function readStringFromBuffer(buffer: Uint8Array, start = 0, end?: number) {
  end = normalizeBufferEndIndex(buffer, end);
  checkBufferIndexing(buffer, start, end);
  checkAmount(start, end, bytesPerChar);

  let str = '';

  for (let i = start; i < end; i += bytesPerChar) {
    str += String.fromCharCode(((buffer[i] & 0xff) << 8) | (buffer[i + 1] & 0xff));
  }

  return str;
}

/**
 *
 * @param charlike
 * @param buffer
 * @param start
 * @returns
 */
export function writeCharLikeToBuffer(charlike: CharLike, buffer: Uint8Array, start = 0) {
  const codes = typeof charlike === 'number' ? [charlike] : Array.from(charlike).map((ch) => ch.charCodeAt(0));
  const codesLen = codes.length;
  const end = start + bytesPerChar * codesLen;

  checkBufferIndexing(buffer, start, end);

  for (let i = 0; i < codesLen; ++i) {
    const code = codes[i];
    const ix = start + bytesPerChar * i;

    buffer[ix] = (code >> 8) & 0xff;
    buffer[ix + 1] = code & 0xff;
  }

  return buffer;
}

/**
 *
 * @param colorlike
 * @param buffer
 * @param start
 * @returns
 */
export function writeColorLikeToBuffer(colorlike: ColorLike | ColorLike[], buffer: Uint8Array, start = 0) {
  const colors = Array.isArray(colorlike) ? colorlike : [colorlike];
  const colorsLen = colors.length;
  const end = start + bytesPerColor * colorsLen;

  checkBufferIndexing(buffer, start, end);

  for (let i = 0; i < colorsLen; ++i) {
    const color = colors[i];
    const ix = start + bytesPerColor * i;

    let colorBuffer: number[];

    if (color instanceof Phaser.Display.Color) {
      colorBuffer = [color.red, color.green, color.blue, color.alpha];
    } else if (color && typeof color === 'object') {
      colorBuffer = [color.r || 0, color.g || 0, color.b || 0, typeof color.a !== 'number' ? 255 : color.a];
    } else if (typeof color === 'number') {
      const c = Phaser.Display.Color.IntegerToRGB(color);
      colorBuffer = [c.r, c.g, c.b, c.a];
    } else if (typeof color === 'string') {
      const c = colorString.get.rgb(color);

      if (!c) {
        throw new Error(`Invalid color string at index ${i}; color: ${color}`);
      }

      colorBuffer = [c[0], c[1], c[2], Math.round(c[3] * 255)];
    } else {
      throw new TypeError(`Invalid colorlike type at index ${i}`);
    }

    for (let j = 0; j < bytesPerColor; ++j) {
      buffer[ix + j] = colorBuffer[j];
    }
  }

  return buffer;
}

/**
 *
 * @param glyphs
 * @param buffer
 * @param start
 * @returns
 */
export function writeGlyphsToBuffer(glyphs: GlyphLike[], buffer: Uint8Array, start = 0) {
  const glyphsLen = glyphs.length;
  const end = start + bytesPerGlyph * glyphsLen;

  checkBufferIndexing(buffer, start, end);

  for (let i = 0; i < glyphsLen; ++i) {
    const glyph = glyphs[i];
    const ix = start + bytesPerGlyph * i;
    const chStart = ix;
    const fgStart = chStart + bytesPerChar;
    const bgStart = fgStart + bytesPerColor;

    writeCharLikeToBuffer(glyph[0], buffer, chStart);
    writeColorLikeToBuffer(glyph[1], buffer, fgStart);
    writeColorLikeToBuffer(
      glyph.length !== 3 || glyph[2] === undefined ? defaultGlyphBackgroundColor : glyph[2],
      buffer,
      bgStart
    );
  }

  return buffer;
}

/**
 * Maintains state for a given CSS font configuration.
 */
export class Font {
  /**
   *
   * @param font
   * @returns
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
   * @param weight [Default: normal] Font weight.
   * @param style [Default: normal] Font style
   * @param variant [Default: normal] Font variant
   */
  constructor(
    public size: number,
    public family: FontFamily,
    public weight: FontWeight = 'normal',
    public style: FontStyle = 'normal',
    public variant: FontVariant = 'normal'
  ) {}

  /**
   * Get a string representation of a font object.
   * @returns A string representing the font object.
   */
  toString() {
    return `Font: ${this.css}`;
  }
}
