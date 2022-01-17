/**
 * Glyph plugin public API.
 *
 * @author kidthales <kidthales@agogpixel.com>
 * @copyright 2021-present AgogPixel
 * @license {@link https://agogpixel.github.io/phaser3-glyph-plugin/LICENSE|MIT License}
 * @module
 */

export type {
  GlyphPluginDestroyEventListener,
  GlyphPluginUpdateEventData,
  GlyphPluginUpdateEventListener
} from './events';
export { GlyphPluginEvent } from './events';

export type { GlyphGameObjectConfig, GlyphmapGameObjectConfig } from './gameobjects';
export { GlyphGameObject, GlyphmapGameObject } from './gameobjects';

export type { GlyphPluginInitData } from './plugins';
export { GlyphPlugin } from './plugins';

export type { CharLike, ColorLike, GlyphLike, GlyphLikeObject, GlyphLikeTuple } from './glyph';

export { Font } from './utils';
