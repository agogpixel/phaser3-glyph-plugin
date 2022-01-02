import { createPluginApiMixin } from '@agogpixel/phaser3-ts-utils/mixins/scene/create-plugin-api-mixin';

import { GlyphmapCreator, glyphmapCreator, GlyphmapFactory, glyphmapFactory } from './gameobjects/glyphmap';
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
 *
 */
export interface GlyphPluginInitData {
  /**
   *
   */
  advancedTextMetrics?: boolean;

  /**
   *
   */
  measurementCh?: CharLike;
}

/**
 *
 */
export enum GlyphPluginEvent {
  /**
   *
   */
  Update = 'update',

  /**
   *
   */
  Destroy = 'destroy'
}

/**
 *
 */
export class GlyphPlugin extends Phaser.Plugins.BasePlugin {
  /**
   *
   */
  static readonly GlyphScene = createPluginApiMixin<
    GlyphPlugin,
    'advancedTextMetrics' | 'measurementCh' | 'getFrameDimensions' | 'getTexture',
    {
      /**
       * Glyphmap factory.
       * @param x
       * @param y
       * @param width
       * @param height
       * @param fontArgs
       * @param pluginKey
       * @returns Glyphmap GameObject instance that has been added to the scene's display list.
       */
      glyphmap: GlyphmapFactory;
    },
    {
      /**
       * Glyphmap creator.
       * @param config The configuration object this Game Object will use to create itself.
       * @param addToScene Add this Game Object to the Scene after creating it? If set this argument overrides the `add` property in the config object.
       * @returns Glyphmap GameObject instance.
       */
      glyphmap: GlyphmapCreator;
    }
  >();

  /**
   *
   */
  private static readonly frameDimensionsCache: Record<string, [number, number]> = {};

  /**
   *
   */
  private static readonly textMetricsCache: Record<string, TextMetrics> = {};

  /**
   *
   * @param pluginManager
   * @returns
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
   *
   * @param charlike
   * @param font
   * @param forceSquareRatio
   * @returns
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
   *
   * @param textures
   * @param glyphs
   * @param font
   * @param measurementCh
   * @param forceSquareRatio
   * @param advancedTextMetrics
   * @returns
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
   *
   * @param glyphs
   * @param font
   * @param measurementCh
   * @param forceSquareRatio
   * @param advancedTextMetrics
   * @returns
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
   *
   * @param textures
   * @param buffer
   * @param font
   * @param measurementCh
   * @param forceSquareRatio
   * @param advancedTextMetrics
   * @returns
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
   *
   * @param buffer
   * @param font
   * @param measurementCh
   * @param forceSquareRatio
   * @param advancedTextMetrics
   * @returns
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
   *
   */
  private readonly eventEmitter = new Phaser.Events.EventEmitter();

  /**
   *
   */
  private currentMeasurementCh = 'W';

  /**
   *
   */
  private currentAdvancedTextMetrics = false;

  /**
   *
   */
  get measurementCh() {
    return this.currentMeasurementCh;
  }

  /**
   *
   */
  set measurementCh(value: string) {
    this.setMeasurementCh(value);
  }

  /**
   *
   */
  get advancedTextMetrics() {
    return this.currentAdvancedTextMetrics;
  }

  /**
   *
   */
  set advancedTextMetrics(value: boolean) {
    this.setAdvancedTextMetrics(value);
  }

  /**
   *
   * @param pluginManager
   */
  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);

    pluginManager.registerGameObject('glyphmap', glyphmapFactory, glyphmapCreator);
  }

  /**
   *
   */
  destroy(): void {
    super.destroy();
    this.eventEmitter.emit(GlyphPluginEvent.Destroy);
    this.eventEmitter.destroy();
  }

  /**
   *
   * @param charlike
   * @param font
   * @param forceSquareRatio
   * @returns
   */
  getFrameDimensions(charlike: CharLike, font: Font, forceSquareRatio = false): [number, number] {
    return GlyphPlugin.getFrameDimensions(charlike, font, forceSquareRatio, this.currentAdvancedTextMetrics);
  }

  /**
   *
   * @param glyphs
   * @param font
   * @param forceSquareRatio
   * @returns
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
   *
   * @param glyphs
   * @param font
   * @param forceSquareRatio
   * @returns
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
   *
   * @param data
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
   *
   * @param event
   * @param fn
   * @param context
   * @param once
   * @returns
   */
  off<F extends (...args: unknown[]) => void, T>(event: GlyphPluginEvent, fn: F, context?: T, once?: boolean) {
    this.eventEmitter.off(event, fn, context, once);
    return this;
  }

  /**
   *
   * @param event
   * @param fn
   * @param context
   * @returns
   */
  on<F extends (...args: unknown[]) => void, T>(event: GlyphPluginEvent, fn: F, context?: T) {
    this.eventEmitter.on(event, fn, context);
    return this;
  }

  /**
   *
   * @param event
   * @param fn
   * @param context
   * @returns
   */
  once<F extends (...args: unknown[]) => void, T>(event: GlyphPluginEvent, fn: F, context?: T) {
    this.eventEmitter.once(event, fn, context);
    return this;
  }

  /**
   *
   * @param value
   * @returns
   */
  setAdvancedTextMetrics(value = true) {
    this.currentAdvancedTextMetrics = value;
    this.eventEmitter.emit(GlyphPluginEvent.Update);
    return this;
  }

  /**
   *
   * @param charlike
   * @returns
   */
  setMeasurementCh(charlike: CharLike) {
    const ch = convertCharLikeToString(charlike);
    this.currentMeasurementCh = ch;
    this.eventEmitter.emit(GlyphPluginEvent.Update);
    return this;
  }

  /**
   *
   * @param buffer
   * @param font
   * @param forceSquareRatio
   * @returns
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
