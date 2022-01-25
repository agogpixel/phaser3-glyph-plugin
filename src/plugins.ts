/**
 * Plugins module.
 *
 * @author kidthales <kidthales@agogpixel.com>
 * @copyright 2021-present AgogPixel
 * @license {@link https://agogpixel.github.io/phaser3-glyph-plugin/LICENSE|MIT License}
 * @module
 */

import { createPluginApiMixin } from '@agogpixel/phaser3-ts-utils/mixins/scene/create-plugin-api-mixin';

import type { GlyphPluginEventListener, GlyphPluginUpdateEventData } from './events';
import { GlyphPluginEvent } from './events';
import type {
  GlyphGameObjectCreator,
  GlyphGameObjectFactory,
  GlyphmapGameObjectCreator,
  GlyphmapGameObjectFactory
} from './gameobjects';
import {
  glyphGameObjectCreator,
  glyphGameObjectFactory,
  glyphmapGameObjectCreator,
  glyphmapGameObjectFactory
} from './gameobjects';
import type { CharLike, GlyphLike } from './glyph';
import { normalizeCharLike, normalizeGlyphLike } from './glyph';
import type { CodePoint, Font } from './utils';
import { getHexStringFromCodePoint } from './utils';

/**
 * {@link GlyphPlugin} initialization data. Data can be passed to
 * {@link GlyphPlugin.init} via a [Phaser.Types.Core.PluginObjectItem](https://photonstorm.github.io/phaser3-docs/Phaser.Types.Core.html#.PluginObjectItem__anchor)
 * defined within a [Phaser.Types.Core.GameConfig](https://photonstorm.github.io/phaser3-docs/Phaser.Types.Core.html#.GameConfig__anchor).
 */
export interface GlyphPluginInitData {
  /**
   * **Experimental**: Use browser's advanced text metrics API. Default is
   * false.
   */
  advancedTextMetrics?: boolean;

  /**
   * Code point used for determining default texture frame dimensions.
   * Default is 0x57 ('W').
   */
  measurementCodePoint?: CharLike;
}

/**
 * {@link GlyphPlugin} state - corresponds to [Phaser.Plugins.PluginManager](https://photonstorm.github.io/phaser3-docs/Phaser.Plugins.PluginManager.html)
 * lifecycle.
 * @internal
 */
export enum GlyphPluginState {
  /**
   * Initialized state.
   */
  Initialized = 'initialized',

  /**
   * Started state.
   */
  Started = 'started',

  /**
   * Stopped state.
   */
  Stopped = 'stopped',

  /**
   * Destroyed state.
   */
  Destroyed = 'destroyed'
}

/**
 * Default measurement code point value.
 * @internal
 */
export const defaultMeasurementCodePoint = 0x57; // 'W'

/**
 * Default advanced text metrics flag.
 * @internal
 */
export const defaultAdvancedTextMetrics = false;

/**
 * Glyph plugin.
 */
export class GlyphPlugin extends Phaser.Plugins.BasePlugin {
  /**
   * Mixin the {@link GlyphPlugin} API with specified
   * [Phaser.Scene](https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html).
   */
  static readonly GlyphScene = createPluginApiMixin<
    GlyphPlugin,
    | 'advancedTextMetrics'
    | 'measurementCodePoint'
    | 'getFrameDimensions'
    | 'getTexture'
    | 'getTextureKey'
    | 'setAdvancedTextMetrics'
    | 'setMeasurementCodePoint'
    | 'setProperties',
    {
      /**
       * {@link GlyphGameObject} factory.
       * @param x (Default: 0) World X-coordinate.
       * @param y (Default: 0) World Y-coordinate.
       * @param glyph (Default: [' ', '#0000']) {@link GlyphLike} data.
       * @param font (Default: 'normal normal normal 24px "Lucida Console",
       * Courier, monospace') {@link Font} to use.
       * @param forceSquareRatio (Optional) Force square glyph frames/cells,
       * using the greater of width or height of the associated glyph plugin's
       * measurement code point.
       * @param pluginKey (Optional) Specify a specific {@link GlyphPlugin}
       * instance (in the plugin manager) to use for textures.
       * @returns A {@link GlyphGameObject} instance that has been added to the
       * scene's display list.
       */
      glyph: GlyphGameObjectFactory;

      /**
       * {@link GlyphmapGameObject} factory.
       * @param x (Default: 0) X-coordinate in world space.
       * @param y (Default: 0) Y-coordinate in world space.
       * @param width (Default: 80) Width in cells.
       * @param height (Default: 25) Height in cells.
       * @param font Default: 'normal normal normal 24px "Lucida Console",
       * Courier, monospace') {@link Font} to use.
       * @param pluginKey (Optional) Specify a specific {@link GlyphPlugin}
       * instance (in the plugin manager) to use for textures.
       * @returns A {@link GlyphmapGameObject} instance that has been added to
       * the scene's display list.
       */
      glyphmap: GlyphmapGameObjectFactory;
    },
    {
      /**
       * {@link GlyphGameObject} creator.
       * @param config The {@link GlyphGameObjectConfig configuration object}
       * this Game Object will use to create itself.
       * @param addToScene (Default: true) Add this Game Object to the Scene
       * after creating it? If set this argument overrides the `add` property in
       * the config object.
       * @returns A {@link GlyphGameObject} instance.
       */
      glyph: GlyphGameObjectCreator;

      /**
       * {@link GlyphmapGameObject} creator.
       * @param config The {@link GlyphmapGameObjectConfig configuration object}
       * this Game Object will use to create itself.
       * @param addToScene (Default: true) Add this Game Object to the Scene
       * after creating it? If set this argument overrides the `add` property in
       * the config object.
       * @returns A {@link GlyphmapGameObject} instance.
       */
      glyphmap: GlyphmapGameObjectCreator;
    }
  >();

  /**
   * Frame dimensions cache.
   * @internal
   */
  private static readonly frameDimensionsCache: Record<string, [number, number]> = {};

  /**
   * Text metrics cache.
   * @internal
   */
  private static readonly textMetricsCache: Record<string, TextMetrics> = {};

  /**
   * Get frame dimensions for specified {@link CharLike} & {@link Font}
   * combination.
   * @param charlike {@link CharLike} to use.
   * @param font {@link Font} to use.
   * @param forceSquareRatio (Default: false) Force square frame, using the
   * greater of width or height.
   * @param advancedTextMetrics (Default: false) **Experimental**: Use
   * browser's advanced text metrics API.
   * @returns Tuple containing width & height of the frame.
   */
  static getFrameDimensions(
    charlike: CharLike,
    font: Font,
    forceSquareRatio = false,
    advancedTextMetrics = false
  ): [number, number] {
    const codePoint = normalizeCharLike(charlike);
    const codePointHex = getHexStringFromCodePoint(codePoint);
    const fontCss = font.css;

    const textMetricsCacheKey = `${codePointHex} ${fontCss}` + (advancedTextMetrics ? ' advanced' : '');
    const frameDimensionsCacheKey = textMetricsCacheKey + (forceSquareRatio ? ' square' : '');

    let frameDimensions = GlyphPlugin.frameDimensionsCache[frameDimensionsCacheKey];

    if (frameDimensions) {
      return [...frameDimensions];
    }

    let textMetrics = GlyphPlugin.textMetricsCache[textMetricsCacheKey];

    if (!textMetrics) {
      const canvas = Phaser.Display.Canvas.CanvasPool.create(this);
      const ctx = canvas.getContext('2d');

      ctx.font = fontCss;

      GlyphPlugin.textMetricsCache[textMetricsCacheKey] = textMetrics = ctx.measureText(
        String.fromCodePoint(codePoint)
      );
      Phaser.Display.Canvas.CanvasPool.remove(canvas);
    }

    if (advancedTextMetrics) {
      // https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics#measuring_text_width
      frameDimensions = [
        Math.abs(textMetrics.actualBoundingBoxLeft) + Math.abs(textMetrics.actualBoundingBoxRight),
        Math.abs(textMetrics.actualBoundingBoxAscent) + Math.abs(textMetrics.actualBoundingBoxDescent)
      ];
    } else {
      frameDimensions = [textMetrics.width, font.size];
    }

    if (forceSquareRatio) {
      frameDimensions[0] = frameDimensions[1] = Math.max(...frameDimensions);
    }

    GlyphPlugin.frameDimensionsCache[frameDimensionsCacheKey] = frameDimensions;

    return [...frameDimensions];
  }

  /**
   * Generate, cache, & return a [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * for specified {@link GlyphLike}, {@link Font}, &
   * UTF-16 measurement {@link CharLike} combination. Defines frame dimensions using either
   * the dimensions associated with the specified measurement {@link CharLike}, or the
   * the {@link CharLike} component of the specified {@link GlyphLike},
   * whichever is greater.
   * @param textureManager [Phaser.Textures.TextureManager](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.TextureManager.html)
   * instance.
   * @param glyphlike {@link GlyphLike} to use.
   * @param font {@link Font} to use.
   * @param measurementCh Measurement {@link CharLike} to use.
   * @param forceSquareRatio (Default: false) Force square frames, using the
   * greater of width or height for each glyph.
   * @param advancedTextMetrics (Default: false) **Experimental**: Use
   * browser's advanced text metrics API.
   * @returns [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * representation of specified {@link GlyphLike}, {@link Font}, & UTF-16
   * measurement {@link CharLike} combination.
   */
  static getTexture(
    textureManager: Phaser.Textures.TextureManager,
    glyphlike: GlyphLike,
    font: Font,
    measurementCh: CharLike,
    forceSquareRatio = false,
    advancedTextMetrics = false
  ) {
    const key = GlyphPlugin.getTextureKey(glyphlike, font, measurementCh, forceSquareRatio, advancedTextMetrics);

    if (textureManager.exists(key)) {
      return textureManager.get(key);
    }

    const glyph = normalizeGlyphLike(glyphlike);

    const [defaultFrameWidth, defaultFrameHeight] = GlyphPlugin.getFrameDimensions(
      measurementCh,
      font,
      forceSquareRatio,
      advancedTextMetrics
    );

    const [glyphFrameWidth, glyphFrameHeight] = GlyphPlugin.getFrameDimensions(
      glyph.codePoint,
      font,
      forceSquareRatio,
      advancedTextMetrics
    );

    const textureWidth = Math.max(glyphFrameWidth, defaultFrameWidth);
    const textureHeight = Math.max(glyphFrameHeight, defaultFrameHeight);

    const texture = textureManager.createCanvas(key, textureWidth || 1, textureHeight || 1);
    const ctx = texture.getContext();

    const [fg, bg] = glyph.getCssColors('functional');

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, textureWidth, textureHeight);

    ctx.font = font.css;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = fg;
    ctx.fillText(glyph.getCh(), textureWidth / 2, textureHeight / 2);

    texture.add(0, 0, 0, 0, textureWidth, textureHeight);

    return texture.update();
  }

  /**
   * Get texture key for specified {@link GlyphLike}, {@link Font}, & UTF-16
   * measurement {@link CharLike} combination.
   * @param glyphlike {@link GlyphLike} to use.
   * @param font {@link Font} to use.
   * @param measurementCh Measurement {@link CharLike} to use.
   * @param forceSquareRatio (Default: false) Force square frames.
   * @param advancedTextMetrics (Default: false) **Experimental**.
   * @returns Key for corresponding texture that would be generated with
   * specified parameters.
   * @see {@link GlyphPlugin.getTexture}
   */
  static getTextureKey(
    glyphlike: GlyphLike,
    font: Font,
    measurementCh: CharLike,
    forceSquareRatio = false,
    advancedTextMetrics = false
  ) {
    const glyph = normalizeGlyphLike(glyphlike);
    const measurementCodePoint = normalizeCharLike(measurementCh);

    return (
      `${glyph.toHexString()} ${getHexStringFromCodePoint(measurementCodePoint)} ${font.css}` +
      (forceSquareRatio ? ' square' : '' + (advancedTextMetrics ? ' advanced' : ''))
    );
  }

  /**
   * Flag that this plugin instance is a GlyphPlugin.
   * @internal
   */
  readonly isGlyphPlugin = true;

  /**
   * Event emitter to emit {@link GlyphPluginEvent}s to listeners.
   * @internal
   */
  private readonly eventEmitter = new Phaser.Events.EventEmitter();

  /**
   * Current plugin state with respect to the PluginManager.
   * @internal
   */
  private currentState: GlyphPluginState;

  /**
   * Tracks current measurement code point.
   * @internal
   */
  private currentMeasurementCodePoint = defaultMeasurementCodePoint;

  /**
   * Tracks current advanced text metrics value.
   * @internal
   */
  private currentAdvancedTextMetrics = defaultAdvancedTextMetrics;

  /**
   * Get measurement code point.
   */
  get measurementCodePoint(): CodePoint {
    return this.currentMeasurementCodePoint;
  }

  /**
   * Set measurement code point with specified {@link CharLike}.
   * @emits {@link GlyphPluginEvent.Update} when set.
   * @see {@link GlyphPlugin.setMeasurementCodePoint}
   */
  set measurementCodePoint(value: CharLike) {
    this.setMeasurementCodePoint(value);
  }

  /**
   * Get advanced text metrics.
   */
  get advancedTextMetrics() {
    return this.currentAdvancedTextMetrics;
  }

  /**
   * Set advanced text metrics.
   * @emits {@link GlyphPluginEvent.Update} when set.
   * @see {@link GlyphPlugin.setAdvancedTextMetrics}
   */
  set advancedTextMetrics(value: boolean) {
    this.setAdvancedTextMetrics(value);
  }

  /**
   * Instantiate {@link GlyphPlugin}.
   * @param pluginManager A reference to a [Phaser.Plugins.PluginManager](https://photonstorm.github.io/phaser3-docs/Phaser.Plugins.PluginManager.html)
   * instance.
   */
  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);

    pluginManager.registerGameObject('glyph', glyphGameObjectFactory, glyphGameObjectCreator);
    pluginManager.registerGameObject('glyphmap', glyphmapGameObjectFactory, glyphmapGameObjectCreator);
  }
  /**
   * Destroy instance and associated resources.
   * @emits {@link GlyphPluginEvent.Destroy} prior to destroying the internal
   * EventEmitter.
   */
  destroy() {
    if (this.currentState === GlyphPluginState.Started) {
      this.stop();
    }

    super.destroy();
    this.eventEmitter.emit(GlyphPluginEvent.Destroy);
    this.eventEmitter.destroy();

    this.currentState = GlyphPluginState.Destroyed;
  }

  /**
   * Get frame dimensions for specified {@link CharLike} & {@link Font}
   * combination.
   * @param charlike {@link CharLike} to use.
   * @param font {@link Font} to use.
   * @param forceSquareRatio (Default: false) Force square frame, using the
   * greater of width or height.
   * @returns Tuple containing width & height of the frame.
   */
  getFrameDimensions(charlike: CharLike, font: Font, forceSquareRatio = false): [number, number] {
    return GlyphPlugin.getFrameDimensions(charlike, font, forceSquareRatio, this.currentAdvancedTextMetrics);
  }

  /**
   * Generate, cache, & return a [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * for specified {@link GlyphLike} & {@link Font} combination. Defines frame
   * dimensions using either the dimensions associated with this plugin's
   * measurement {@link CodePoint}, or the {@link CharLike} component of the
   * specified {@link GlyphLike}, whichever is greater.
   * @param glyphlike {@link GlyphLike} to use.
   * @param font {@link Font} to use.
   * @param forceSquareRatio (Default: false) Force square frames, using the
   * greater of width or height for each glyph.
   * @returns [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * representation of specified {@link GlyphLike} & {@link Font} combination.
   */
  getTexture(glyphlike: GlyphLike, font: Font, forceSquareRatio = false) {
    return GlyphPlugin.getTexture(
      this.game.textures,
      glyphlike,
      font,
      this.currentMeasurementCodePoint,
      forceSquareRatio,
      this.currentAdvancedTextMetrics
    );
  }

  /**
   * Get texture key for specified {@link GlyphLike} & {@link Font} combination.
   * @param glyphlike {@link GlyphLike} to use.
   * @param font {@link Font} to use.
   * @param forceSquareRatio (Default: false) Force square frames.
   * @returns Key for corresponding texture that would be generated with
   * specified parameters.
   * @see {@link GlyphPlugin.getTexture}
   */
  getTextureKey(glyphlike: GlyphLike, font: Font, forceSquareRatio = false) {
    return GlyphPlugin.getTextureKey(
      glyphlike,
      font,
      this.currentMeasurementCodePoint,
      forceSquareRatio,
      this.currentAdvancedTextMetrics
    );
  }

  /**
   * The [Phaser.Plugins.PluginManager](https://photonstorm.github.io/phaser3-docs/Phaser.Plugins.PluginManager.html)
   * calls this method when the {@link GlyphPlugin} is first instantiated. It
   * will never be called again on this instance. If set to automatically start,
   * then {@link GlyphPlugin.start} will be called immediately after this.
   * @param data (Optional) {@link GlyphPluginInitData} from the data property of the
   * {@link GlyphPlugin}'s [configuration object](https://photonstorm.github.io/phaser3-docs/Phaser.Types.Core.html#.PluginObjectItem__anchor)
   * (if started at game boot) or passed in the PluginManager's [install method](https://photonstorm.github.io/phaser3-docs/Phaser.Plugins.PluginManager.html#install__anchor)
   * (if started manually).
   * @throws Error when not in a valid state.
   */
  init(data?: GlyphPluginInitData) {
    if (this.currentState !== undefined) {
      throw new Error(`Current state invalid: ${this.currentState}; expected undefined`);
    }

    super.init();
    this.setProperties(data || {}).currentState = GlyphPluginState.Initialized;
  }

  /**
   * Remove the listeners of a given {@link GlyphPluginEvent}.
   * @param event The event name.
   * @param fn Only remove the listeners that match this function.
   * @param context Only remove the listeners that have this context.
   * @param once Only remove one-time listeners.
   * @returns The {@link GlyphPlugin} instance for further chaining.
   */
  off<E extends GlyphPluginEvent>(event: E, fn: GlyphPluginEventListener<E>, context?: unknown, once?: boolean) {
    this.eventEmitter.off(event, fn, context, once);
    return this;
  }

  /**
   * Add a listener for a given {@link GlyphPluginEvent}.
   * @param event The event name.
   * @param fn The listener function.
   * @param context The context to invoke the listener with. Default this.
   * @returns The {@link GlyphPlugin} instance for further chaining.
   */
  on<E extends GlyphPluginEvent>(event: E, fn: GlyphPluginEventListener<E>, context?: unknown) {
    this.eventEmitter.on(event, fn, context);
    return this;
  }

  /**
   * Add a one-time listener for a given {@link GlyphPluginEvent}.
   * @param event The event name.
   * @param fn The listener function.
   * @param context The context to invoke the listener with. Default this.
   * @returns The {@link GlyphPlugin} instance for further chaining.
   */
  once<E extends GlyphPluginEvent>(event: E, fn: GlyphPluginEventListener<E>, context?: unknown) {
    this.eventEmitter.once(event, fn, context);
    return this;
  }

  /**
   * Set advanced text metrics.
   * @param value (Default: true) Advanced text metrics flag.
   * @returns The {@link GlyphPlugin} instance for further chaining.
   * @emits {@link GlyphPluginEvent.Update} when flag has changed.
   */
  setAdvancedTextMetrics(value = true) {
    return this.setProperties({ advancedTextMetrics: value });
  }

  /**
   * Set measurement {@link CodePoint}.
   * @param charlike {@link CharLike} to use.
   * @returns The {@link GlyphPlugin} instance for further chaining.
   * @emits {@link GlyphPluginEvent.Update} when code point value has changed.
   */
  setMeasurementCodePoint(charlike: CharLike) {
    return this.setProperties({ measurementCodePoint: charlike });
  }

  /**
   * Set {@link GlyphPlugin} properties.
   * @param data The {@link GlyphPluginInitData properties} to set.
   * @returns The {@link GlyphPlugin} instance for further chaining.
   * @emits {@link GlyphPluginEvent.Update} when at least one property has
   * changed.
   */
  setProperties(data: GlyphPluginInitData) {
    const { advancedTextMetrics, measurementCodePoint } = data;
    const normalizedData: { -readonly [K in keyof GlyphPluginUpdateEventData]: GlyphPluginUpdateEventData[K] } = {};

    if (typeof advancedTextMetrics === 'boolean' && this.currentAdvancedTextMetrics !== advancedTextMetrics) {
      normalizedData.advancedTextMetrics = this.currentAdvancedTextMetrics = advancedTextMetrics;
    }

    if (measurementCodePoint !== undefined && measurementCodePoint !== null) {
      const codePoint = normalizeCharLike(measurementCodePoint);

      if (this.currentMeasurementCodePoint !== codePoint) {
        normalizedData.measurementCodePoint = this.currentMeasurementCodePoint = codePoint;
      }
    }

    if (this.currentState === GlyphPluginState.Started && Object.keys(normalizedData).length) {
      this.eventEmitter.emit(GlyphPluginEvent.Update, normalizedData);
    }

    return this;
  }

  /**
   * The [Phaser.Plugins.PluginManager](https://photonstorm.github.io/phaser3-docs/Phaser.Plugins.PluginManager.html)
   * calls this method on when the {@link GlyphPlugin} is started. If a
   * {@link GlyphPlugin} is stopped, and then started again, this will get
   * called again. Typically called immediately after {@link GlyphPlugin.init}.
   * @throws Error when not in a valid state.
   */
  start() {
    if (this.currentState !== GlyphPluginState.Initialized && this.currentState !== GlyphPluginState.Stopped) {
      throw new Error(
        `Current state invalid: ${this.currentState}; expected ${GlyphPluginState.Initialized} or ${GlyphPluginState.Stopped}`
      );
    }

    super.start();
    this.currentState = GlyphPluginState.Started;
  }

  /**
   * The [Phaser.Plugins.PluginManager](https://photonstorm.github.io/phaser3-docs/Phaser.Plugins.PluginManager.html)
   * calls this method on when the {@link GlyphPlugin} is stopped. It is
   * now considered 'inactive' by the [Phaser.Plugins.PluginManager](https://photonstorm.github.io/phaser3-docs/Phaser.Plugins.PluginManager.html).
   * If the {@link GlyphPlugin} is started again then {@link GlyphPlugin.start}
   * will be called again.
   * @throws Error when not in a valid state.
   */
  stop() {
    if (this.currentState !== GlyphPluginState.Started) {
      throw new Error(`Current state invalid: ${this.currentState}; expected ${GlyphPluginState.Started}`);
    }

    super.stop();
    this.currentState = GlyphPluginState.Stopped;
  }
}
