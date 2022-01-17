/**
 * Events module.
 *
 * @author kidthales <kidthales@agogpixel.com>
 * @copyright 2021-present AgogPixel
 * @license {@link https://agogpixel.github.io/phaser3-glyph-plugin/LICENSE|MIT License}
 * @module
 */

import type { CodePoint } from './utils';

/**
 * Glyph plugin update event data.
 */
export type GlyphPluginUpdateEventData = Readonly<
  Partial<{
    /**
     * Measurement code point.
     */
    measurementCodePoint: CodePoint;

    /**
     * Advanced text metrics flag.
     */
    advancedTextMetrics: boolean;
  }>
>;

/**
 * Glyph plugin update event listener type.
 */
export type GlyphPluginUpdateEventListener = (data: GlyphPluginUpdateEventData) => void;

/**
 * Glyph plugin destroy event listener type.
 */
export type GlyphPluginDestroyEventListener = () => void;

/**
 * Get glyph plugin event listener type from glyph event name.
 */
export type GlyphPluginEventListener<E extends GlyphPluginEvent> = E extends GlyphPluginEvent.Update
  ? GlyphPluginUpdateEventListener
  : GlyphPluginDestroyEventListener;

/**
 * Glyph plugin event.
 */
export enum GlyphPluginEvent {
  /**
   * Emitted when `measurementCodePoint` or `advancedTextMetrics` plugin properties
   * are updated.
   */
  Update = 'update',

  /**
   * Emitted when plugin is destroyed.
   */
  Destroy = 'destroy'
}
