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
 * Represents the changed properties for a given {@link GlyphPlugin} instance.
 * This data is emitted whenever {@link GlyphPluginEvent.Update} is fired.
 * @see {@link GlyphPluginUpdateEventListener}
 */
export interface GlyphPluginUpdateEventData {
  /**
   * New measurement code point value.
   */
  readonly measurementCodePoint?: CodePoint;

  /**
   * New advanced text metrics flag.
   */
  readonly advancedTextMetrics?: boolean;
}

/**
 * Represents a {@link GlyphPlugin}
 * {@link GlyphPluginEvent.Update update event} listener.
 */
export type GlyphPluginUpdateEventListener = (data: GlyphPluginUpdateEventData) => void;

/**
 * Represents a {@link GlyphPlugin}
 * {@link GlyphPluginEvent.Destroy destroy event} listener.
 */
export type GlyphPluginDestroyEventListener = () => void;

/**
 * Resolves a given {@link GlyphPluginEvent} to its corresponding event listener
 * type.
 * @template E The {@link GlyphPluginEvent} to resolve.
 * @see {@link GlyphPluginUpdateEventListener}
 * @see {@link GlyphPluginDestroyEventListener}
 */
export type GlyphPluginEventListener<E extends GlyphPluginEvent> = E extends GlyphPluginEvent.Update
  ? GlyphPluginUpdateEventListener
  : GlyphPluginDestroyEventListener;

/**
 * {@link GlyphPlugin} event enumeration.
 */
export enum GlyphPluginEvent {
  /**
   * Emits {@link GlyphPluginUpdateEventData} when plugin properties are
   * updated.
   */
  Update = 'update',

  /**
   * Fired when a given {@link GlyphPlugin} instance is destroyed (its
   * {@link GlyphPlugin.destroy} method is called).
   */
  Destroy = 'destroy'
}
