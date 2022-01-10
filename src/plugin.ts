/**
 * Glyph plugin module.
 *
 * @author kidthales <kidthales@agogpixel.com>
 * @copyright 2021-present AgogPixel
 * @license {@link https://agogpixel.github.io/phaser3-glyph-plugin/LICENSE|MIT License}
 * @module
 */

import { createPluginApiMixin } from '@agogpixel/phaser3-ts-utils/mixins/scene/create-plugin-api-mixin';

import type { GlyphCreator, GlyphFactory } from './gameobjects/glyph';
import type { GlyphmapCreator, GlyphmapFactory } from './gameobjects/glyphmap';
import type { CharLike, GlyphLike } from './shared';
import {
  convertBufferToHexString,
  convertCharLikeToHexString,
  convertCharLikeToString,
  createGlyphsBuffer,
  Font,
  readGlyphsFromBuffer
} from './shared';

/**
 * Glyph plugin initialization data.
 */
export interface GlyphPluginInitData {
  /**
   * **Experimental**: Use browser's advanced text metrics API.
   */
  advancedTextMetrics?: boolean;

  /**
   * Character used for determining default texture frame dimensions.
   */
  measurementCh?: CharLike;
}

/**
 * Glyph plugin event.
 */
export enum GlyphPluginEvent {
  /**
   * Emitted when `measurementCh` or `advancedTextMetrics` plugin properties
   * are set.
   */
  Update = 'update',

  /**
   * Emitted when plugin is destroyed.
   */
  Destroy = 'destroy'
}

/**
 * Glyph plugin. Provides on the fly glyph texture generation.
 */
export class GlyphPlugin extends Phaser.Plugins.BasePlugin {
  /**
   * Mixin GlyphPlugin API with specified scene type.
   */
  static readonly GlyphScene = createPluginApiMixin<
    GlyphPlugin,
    'advancedTextMetrics' | 'measurementCh' | 'getFrameDimensions' | 'getTexture',
    {
      /**
       * Glyph factory.
       * @param x (Default: 0) World X-coordinate.
       * @param y (Default: 0) World Y-coordinate.
       * @param glyph (Optional) Glyphlike data.
       * @param font (Optional) Font to use.
       * @param forceSquareRatio (Optional) Force square glyph frames/cells,
       * using the greater of width or height of the associated glyph plugin's
       * measurement character.
       * @param pluginKey (Optional) Glyph plugin key.
       * @returns Glyph GameObject instance that has been added to the
       * scene's display list.
       */
      glyph: GlyphFactory;

      /**
       * Glyphmap factory.
       * @param x (Default: 0) X-coordinate in world space.
       * @param y (Default: 0) Y-coordinate in world space.
       * @param width (Default: 80) Width in cells.
       * @param height (Default: 25) Height in cells.
       * @param font (Optional) Font to use.
       * @param pluginKey (Optional) Specify a specific glyph plugin instance
       * (in the plugin manager) to use for textures.
       * @returns Glyphmap GameObject instance that has been added to the
       * scene's display list.
       */
      glyphmap: GlyphmapFactory;
    },
    {
      /**
       * Glyph creator.
       * @param config The configuration object this Game Object will use to
       * create itself.
       * @param addToScene (Default: true) Add this Game Object to the Scene
       * after creating it? If set this argument overrides the `add` property in
       * the config object.
       * @returns Glyph GameObject instance.
       */
      glyph: GlyphCreator;

      /**
       * Glyphmap creator.
       * @param config The configuration object this Game Object will use to
       * create itself.
       * @param addToScene (Default: true) Add this Game Object to the Scene
       * after creating it? If set this argument overrides the `add` property in
       * the config object.
       * @returns Glyphmap GameObject instance.
       */
      glyphmap: GlyphmapCreator;
    }
  >();

  /**
   * Frame dimensions cache.
   */
  private static readonly frameDimensionsCache: Record<string, [number, number]> = {};

  /**
   * Text metrics cache.
   */
  private static readonly textMetricsCache: Record<string, TextMetrics> = {};

  /**
   * Find glyph plugin in plugin manager.
   * @param pluginManager Plugin manager instance.
   * @param key (Optional) Plugin key to search for.
   * @returns Returns glyph plugin as specified by key, or fallback to first
   * glyph plugin found.
   * @throws Error if no glyph plugin instance exists in the plugin manager.
   */
  static findPlugin(pluginManager: Phaser.Plugins.PluginManager, key?: string) {
    let plugin: GlyphPlugin;

    if (typeof key === 'string') {
      plugin = pluginManager.get(key, true) as GlyphPlugin;
    }

    if (!plugin) {
      plugin = pluginManager.plugins.find((p) => p.plugin instanceof GlyphPlugin)?.plugin as unknown as GlyphPlugin;
    }

    if (!plugin) {
      throw new Error('GlyphPlugin instance not found in Phaser pluginManager. Have you started the plugin?');
    }

    return plugin;
  }

  /**
   * Get frame dimensions for specified charlike & font combination.
   * @param charlike Charlike to use.
   * @param font Font to use.
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
    const ch = convertCharLikeToString(charlike);
    const chHex = convertCharLikeToHexString(ch);
    const fontCss = font.css;

    const textMetricsCacheKey = `${chHex} ${fontCss}` + (advancedTextMetrics ? ' advanced' : '');
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

      GlyphPlugin.textMetricsCache[textMetricsCacheKey] = textMetrics = ctx.measureText(ch);
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
   * Generate, cache, & return a texture for specified glyphlikes, font, &
   * measurement character combination. Defines frame dimensions for each glyph
   * in the texture, using either the dimensions of the measurement character,
   * or the glyph's dimensions - whichever is greater.
   * @param textures Texture manager instance.
   * @param glyphs Glyphlikes to draw to texture, left to right.
   * @param font Font to use.
   * @param measurementCh Measurement character to use.
   * @param forceSquareRatio (Default: false) Force square frames, using the
   * greater of width or height for each glyph.
   * @param advancedTextMetrics (Default: false) **Experimental**: Use
   * browser's advanced text metrics API.
   * @returns Texture representation of specified glyphlikes.
   */
  static getTexture(
    textures: Phaser.Textures.TextureManager,
    glyphs: GlyphLike[],
    font: Font,
    measurementCh: CharLike,
    forceSquareRatio = false,
    advancedTextMetrics = false
  ) {
    return GlyphPlugin.getTextureFromBuffer(
      textures,
      createGlyphsBuffer(glyphs),
      font,
      measurementCh,
      forceSquareRatio,
      advancedTextMetrics
    );
  }

  /**
   * Get texture key for specified glyphlikes, font, & measurement character
   * combination.
   * @param glyphs Glyphlikes to use.
   * @param font Font to use.
   * @param measurementCh Measurement character.
   * @param forceSquareRatio (Default: false) Force square frames.
   * @param advancedTextMetrics (Default: false) **Experimental**.
   * @returns Key for corresponding texture that would be generated with
   * specified parameters.
   */
  static getTextureKey(
    glyphs: GlyphLike[],
    font: Font,
    measurementCh: CharLike,
    forceSquareRatio = false,
    advancedTextMetrics = false
  ) {
    return GlyphPlugin.getTextureKeyFromBuffer(
      createGlyphsBuffer(glyphs),
      font,
      measurementCh,
      forceSquareRatio,
      advancedTextMetrics
    );
  }

  /**
   * Get texture from internal glyph buffer representation.
   * @param textures Texture manager.
   * @param buffer Buffer to read from.
   * @param font Font to use.
   * @param measurementCh Measurement character to use.
   * @param forceSquareRatio (Optional) Force square frames, using the
   * greater of width or height for each glyph.
   * @param advancedTextMetrics (Optional) **Experimental**: Use
   * browser's advanced text metrics API.
   * @returns Texture representation of specified glyph buffer.
   */
  private static getTextureFromBuffer(
    textures: Phaser.Textures.TextureManager,
    buffer: Uint8Array,
    font: Font,
    measurementCh: CharLike,
    forceSquareRatio?: boolean,
    advancedTextMetrics?: boolean
  ): Phaser.Textures.Texture {
    const key = GlyphPlugin.getTextureKeyFromBuffer(buffer, font, measurementCh, forceSquareRatio, advancedTextMetrics);

    if (textures.exists(key)) {
      return textures.get(key);
    }

    const glyphs = readGlyphsFromBuffer('rgba', buffer);

    const [defaultFrameWidth, defaultFrameHeight] = GlyphPlugin.getFrameDimensions(
      measurementCh,
      font,
      forceSquareRatio,
      advancedTextMetrics
    );

    const glyphFrames: [number, number][] = [];

    let textureWidth = 0;
    let textureHeight = 0;

    for (const glyph of glyphs) {
      const [glyphFrameWidth, glyphFrameHeight] = GlyphPlugin.getFrameDimensions(
        glyph[0],
        font,
        forceSquareRatio,
        advancedTextMetrics
      );

      const glyphFrame: [number, number] = [
        Math.max(glyphFrameWidth, defaultFrameWidth),
        Math.max(glyphFrameHeight, defaultFrameHeight)
      ];

      textureWidth += glyphFrame[0];
      textureHeight = Math.max(textureHeight, glyphFrame[1]);

      glyphFrames.push(glyphFrame);
    }

    const texture = textures.createCanvas(key, textureWidth || 1, textureHeight || 1);
    const ctx = texture.getContext();

    const glyphsLen = glyphs.length;

    let frameX = 0;
    let frameY = 0;

    for (let i = 0; i < glyphsLen; ++i) {
      const [ch, fg, bg] = glyphs[i];
      const [frameWidth, frameHeight] = glyphFrames[i];

      ctx.fillStyle = bg;
      ctx.fillRect(frameX, frameY, frameWidth, frameHeight);

      ctx.font = font.css;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = fg;
      ctx.fillText(ch, frameX + frameWidth / 2, frameY + frameHeight / 2);

      texture.add(i, 0, frameX, frameY, frameWidth, frameHeight);

      frameX += frameWidth;
      frameY += 0;
    }

    texture.update();

    return texture;
  }

  /**
   * Get texture from internal glyph buffer representation.
   * @param buffer The buffer to read from.
   * @param font Font to use.
   * @param measurementCh Measurement character to use.
   * @param forceSquareRatio (Optional) Force square frames.
   * @param advancedTextMetrics (Optional) **Experimental**.
   * @returns Key for corresponding texture that would be generated with
   * specified parameters.
   */
  private static getTextureKeyFromBuffer(
    buffer: Uint8Array,
    font: Font,
    measurementCh: CharLike,
    forceSquareRatio?: boolean,
    advancedTextMetrics?: boolean
  ) {
    return (
      `${convertBufferToHexString(buffer)} ${convertCharLikeToHexString(measurementCh)} ${font.css}` +
      (forceSquareRatio ? ' square' : '' + (advancedTextMetrics ? ' advanced' : ''))
    );
  }

  /**
   * Event emitter to send {@link GlyphPluginEvent}s to subscribers.
   */
  private readonly eventEmitter = new Phaser.Events.EventEmitter();

  /**
   * Tracks current measurement character value.
   */
  private currentMeasurementCh = 'W';

  /**
   * Tracks current advanced text metrics value.
   */
  private currentAdvancedTextMetrics = false;

  /**
   * Get measurement character.
   */
  get measurementCh() {
    return this.currentMeasurementCh;
  }

  /**
   * Set measurement character.
   * @emits {@link GlyphPluginEvent.Update} when set.
   * @see {@link GlyphPlugin.setMeasurementCh}
   */
  set measurementCh(value: string) {
    this.setMeasurementCh(value);
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
   * Instantiate glyph plugin.
   * @param pluginManager A reference to the Plugin Manager.
   */
  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { glyphFactory, glyphCreator } = require('./gameobjects/glyph');
    pluginManager.registerGameObject('glyph', glyphFactory, glyphCreator);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { glyphmapFactory, glyphmapCreator } = require('./gameobjects/glyphmap');
    pluginManager.registerGameObject('glyphmap', glyphmapFactory, glyphmapCreator);
  }

  /**
   * Destroy glyph plugin & resources.
   * @emits {@link GlyphPluginEvent.Destroy} when invoked.
   */
  destroy() {
    super.destroy();
    this.eventEmitter.emit(GlyphPluginEvent.Destroy);
    this.eventEmitter.destroy();
  }

  /**
   * Get frame dimensions for specified charlike & font combination.
   * @param charlike Charlike to use.
   * @param font Font to use.
   * @param forceSquareRatio (Default: false) Force square frame, using the
   * greater of width or height.
   * @returns Tuple containing width & height of the frame.
   */
  getFrameDimensions(charlike: CharLike, font: Font, forceSquareRatio = false): [number, number] {
    return GlyphPlugin.getFrameDimensions(charlike, font, forceSquareRatio, this.currentAdvancedTextMetrics);
  }

  /**
   * Generate, cache, & return a texture for specified glyphlikes & font
   * combination. Defines frame dimensions for each glyph in the texture, using
   * either the dimensions of the measurement character, or the glyph's
   * dimensions - whichever is greater.
   * @param glyphs Glyphlikes to draw to texture, left to right.
   * @param font Font to use.
   * @param forceSquareRatio (Default: false) Force square frames, using the
   * greater of width or height for each glyph.
   * @returns Texture representation of specified glyphlikes.
   */
  getTexture(glyphs: GlyphLike[], font: Font, forceSquareRatio = false) {
    return GlyphPlugin.getTexture(
      this.game.textures,
      glyphs,
      font,
      this.currentMeasurementCh,
      forceSquareRatio,
      this.currentAdvancedTextMetrics
    );
  }

  /**
   * Get texture key for specified glyphlikes & font combination.
   * @param glyphs Glyphlikes to use.
   * @param font Font to use.
   * @param forceSquareRatio (Default: false) Force square frames.
   * @returns Key for corresponding texture that would be generated with
   * specified parameters.
   */
  getTextureKey(glyphs: GlyphLike[], font: Font, forceSquareRatio = false) {
    return GlyphPlugin.getTextureKey(
      glyphs,
      font,
      this.currentMeasurementCh,
      forceSquareRatio,
      this.currentAdvancedTextMetrics
    );
  }

  /**
   * Called by the plugin manager when glyph plugin is initialized.
   * @param data Glyph plugin initialization data.
   * @emits {@link GlyphPluginEvent.Update} when initialization data provided.
   */
  init(data?: GlyphPluginInitData) {
    super.init();

    if (!data) {
      return;
    }

    if (typeof data.measurementCh !== undefined && typeof data.measurementCh !== null) {
      this.setMeasurementCh(data.measurementCh);
    }

    if (typeof data.advancedTextMetrics !== undefined && typeof data.advancedTextMetrics !== null) {
      this.setAdvancedTextMetrics(data.advancedTextMetrics);
    }
  }

  /**
   * Remove the listeners of a given event.
   * @param event The event name.
   * @param fn Only remove the listeners that match this function.
   * @param context Only remove the listeners that have this context.
   * @param once Only remove one-time listeners.
   * @returns Glyph plugin instance for further chaining.
   */
  off<F extends (...args: unknown[]) => void, T>(event: GlyphPluginEvent, fn: F, context?: T, once?: boolean) {
    this.eventEmitter.off(event, fn, context, once);
    return this;
  }

  /**
   * Add a listener for a given event.
   * @param event The event name.
   * @param fn The listener function.
   * @param context The context to invoke the listener with. Default this.
   * @returns Glyph plugin instance for further chaining.
   */
  on<F extends (...args: unknown[]) => void, T>(event: GlyphPluginEvent, fn: F, context?: T) {
    this.eventEmitter.on(event, fn, context);
    return this;
  }

  /**
   * Add a one-time listener for a given event.
   * @param event The event name.
   * @param fn The listener function.
   * @param context The context to invoke the listener with. Default this.
   * @returns Glyph plugin instance for further chaining.
   */
  once<F extends (...args: unknown[]) => void, T>(event: GlyphPluginEvent, fn: F, context?: T) {
    this.eventEmitter.once(event, fn, context);
    return this;
  }

  /**
   * Set advanced text metrics.
   * @param value (Default: true) Advanced text metrics flag.
   * @returns Glyph plugin instance for further chaining.
   * @emits {@link GlyphPluginEvent.Update} when set.
   */
  setAdvancedTextMetrics(value = true) {
    this.currentAdvancedTextMetrics = value;
    this.eventEmitter.emit(GlyphPluginEvent.Update);
    return this;
  }

  /**
   * Set measurement character.
   * @param charlike Charlike.
   * @returns Glyph plugin instance for further chaining.
   * @emits {@link GlyphPluginEvent.Update} when set.
   */
  setMeasurementCh(charlike: CharLike) {
    const ch = convertCharLikeToString(charlike);
    this.currentMeasurementCh = ch;
    this.eventEmitter.emit(GlyphPluginEvent.Update);
    return this;
  }

  /**
   * Get texture from internal glyph buffer representation.
   * @param buffer Buffer to read from.
   * @param font Font to use.
   * @param forceSquareRatio (Optional) Force square frames, using the
   * greater of width or height for each glyph.
   * @returns Texture representation of specified glyph buffer.
   */
  protected getTextureFromBuffer(buffer: Uint8Array, font: Font, forceSquareRatio?: boolean) {
    return GlyphPlugin.getTextureFromBuffer(
      this.game.textures,
      buffer,
      font,
      this.currentMeasurementCh,
      forceSquareRatio,
      this.currentAdvancedTextMetrics
    );
  }
}
