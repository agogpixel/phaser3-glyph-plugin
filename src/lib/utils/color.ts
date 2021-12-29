import colorString from 'color-string';

/**
 * Union of various types suitable for RGB & RGBA color representation.
 */
export type ColorLike =
  | number
  | string
  | Phaser.Types.Display.ColorObject
  | Phaser.Types.Display.InputColorObject
  | Phaser.Display.Color;

export const colorBytesLength = 4;

/**
 * Get RGBA channel representation from colorlike.
 * @param colorlike Union of various types suitable for RGB & RGBA color representation:
 *   - `number`: Parse as ARGB representation with default 255 alpha when value is less than `0x01000000`.
 *   - `string`: Parse `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, `css-color-name`, `rgb(...)`, & `rgba(...)` representations, with default 255 alpha when not inferred.
 *   - `Phaser.Types.Display.ColorObject | Phaser.Types.Display.InputColorObject | Phaser.Display.Color`: Parse properties, default 255 alpha & 0 red or green or blue when not inferred.
 * @returns Uint8Array of size 4, representing ordered RGBA channels with values [0,255].
 * @throws Error if colorlike type is invalid.
 */
export function getColorBytes(colorlike: ColorLike) {
  const bytes = new Uint8Array(colorBytesLength);

  if (colorlike instanceof Phaser.Display.Color) {
    bytes[0] = colorlike.red;
    bytes[1] = colorlike.green;
    bytes[2] = colorlike.blue;
    bytes[3] = colorlike.alpha;
  } else if (colorlike && typeof colorlike === 'object') {
    bytes[0] = colorlike.r || 0;
    bytes[1] = colorlike.g || 0;
    bytes[2] = colorlike.b || 0;
    bytes[3] = colorlike.a || 255;
  } else if (typeof colorlike === 'number') {
    const c = Phaser.Display.Color.IntegerToRGB(colorlike);
    bytes[0] = c.r;
    bytes[1] = c.g;
    bytes[2] = c.b;
    bytes[3] = c.a;
  } else if (typeof colorlike === 'string') {
    const c = colorString.get.rgb(colorlike);

    if (!c) {
      throw new Error(`Invalid color string: ${colorlike}`);
    }

    bytes[0] = c[0];
    bytes[1] = c[1];
    bytes[2] = c[2];
    bytes[3] = Math.floor(c[3] * 255);
  } else {
    throw new TypeError(`Invalid colorlike type: ${colorlike.toString()}`);
  }

  return bytes;
}

/**
 * Get `rgba(...)` string representation from color channels.
 * @param bytes Uint8Array with a size that is a multiple of 4, representing ordered RGBA channels with values [0,255].
 * @param start [Default: 0] Start index (red channel index) from which to create the string. Must be a multiple of 4.
 * @returns `rgba(...)` formatted string suitable for use as a CSS color string. Ex: `rgba(0, 0, 255, 0.4)`.
 */
export function getCssRGBA(bytes: Uint8Array, start = 0) {
  if (!bytes.length || bytes.length % colorBytesLength !== 0) {
    throw new Error(
      `Invalid color channels length: ${bytes.length} (must be non-zero multiple of ${colorBytesLength})`
    );
  } else if (start % colorBytesLength !== 0) {
    throw new Error(`Invalid start index: ${start} (must be a multiple of ${colorBytesLength})`);
  } else if (start > bytes.length - colorBytesLength) {
    throw new Error(`Invalid start: ${start} (must be less than or equal to ${bytes.length - colorBytesLength})`);
  }

  return colorString.to.rgb(bytes[start], bytes[start + 1], bytes[start + 2], bytes[start + 3] / 255);
}
