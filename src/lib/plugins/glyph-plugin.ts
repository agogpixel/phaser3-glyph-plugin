import { createPluginApiMixin } from '@agogpixel/phaser3-ts-utils/mixins/scene/create-plugin-api-mixin';

import { Glyphmap } from '../gameobjects/glyphmap';
import type { CharLike } from '../utils/char';
import { getChar, getCharBytes } from '../utils/char';
import type { ColorLike } from '../utils/color';
import type { FontArgs } from '../utils/font';
import { Font } from '../utils/font';
import { getGlyphBytes, getGlyphCanvasData } from '../utils/glyph';

const defaultMeasurementCh = 'W';

export interface GlyphPluginInitData {
  measurementCh?: string;
}

export enum GlyphPluginEvent {
  MeasurementCh = 'measurementCh',
  Destroy = 'destroy'
}

export interface GlyphmapConfig extends Phaser.Types.GameObjects.GameObjectConfig {
  width?: number;
  height?: number;
  fontArgs?: FontArgs;
  pluginKey?: string;
}

export class GlyphPlugin extends Phaser.Plugins.BasePlugin {
  static readonly GlyphScene = createPluginApiMixin<
    GlyphPlugin,
    'measurementCh' | 'getFrameDimensions' | 'getTextMetrics' | 'getTexture',
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
      glyphmap: typeof GlyphPlugin.glyphmapFactory;
    },
    {
      /**
       * Glyphmap creator.
       * @param config The configuration object this Game Object will use to create itself.
       * @param addToScene Add this Game Object to the Scene after creating it? If set this argument overrides the `add` property in the config object.
       * @returns Glyphmap GameObject instance.
       */
      glyphmap: typeof GlyphPlugin.glyphmapCreator;
    }
  >();

  static findPlugin(pluginManager: Phaser.Plugins.PluginManager) {
    const plugin = pluginManager.plugins.find((p) => p.plugin instanceof GlyphPlugin)?.plugin as unknown as GlyphPlugin;

    if (!plugin) {
      throw new Error('GlyphPlugin instance not found in Phaser pluginManager. Have you started the plugin?');
    }

    return plugin;
  }

  private static textMetricsCache: Record<string, TextMetrics> = {};

  private static charToHex(ch: string) {
    return `0x${ch.charCodeAt(0).toString(16).padStart(4, '0')}`;
  }

  private static glyphmapFactory(
    this: Phaser.GameObjects.GameObjectFactory,
    ...args: ConstructorParameters<typeof Glyphmap> extends [unknown, ...infer R] ? R : never
  ) {
    return this.displayList.add(new Glyphmap(this.scene, ...args)) as Glyphmap;
  }

  private static glyphmapCreator(
    this: Phaser.GameObjects.GameObjectCreator,
    config: GlyphmapConfig = {},
    addToScene?: boolean
  ) {
    const glyphmap = new Glyphmap(this.scene, 0, 0, config.width, config.height, config.fontArgs, config.pluginKey);

    if (addToScene !== undefined) {
      config.add = addToScene;
    }

    Phaser.GameObjects.BuildGameObject(this.scene, glyphmap, config);

    return glyphmap;
  }

  private currentMeasurementCh = defaultMeasurementCh;

  private eventEmitter = new Phaser.Events.EventEmitter();

  get measurementCh() {
    return this.currentMeasurementCh;
  }

  set measurementCh(value: string) {
    this.setMeasurementCh(value);
  }

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);

    pluginManager.registerGameObject('glyphmap', GlyphPlugin.glyphmapFactory, GlyphPlugin.glyphmapCreator);
  }

  destroy(): void {
    super.destroy();
    this.eventEmitter.emit(GlyphPluginEvent.Destroy);
    this.eventEmitter.destroy();
  }

  getFrameDimensions(charlike: CharLike, ...fontArgs: FontArgs): [number, number] {
    return [this.getTextMetrics(charlike, ...fontArgs).width, fontArgs[0]];
  }

  getTextMetrics(charlike: CharLike, ...fontArgs: FontArgs) {
    const ch = getChar(getCharBytes(charlike));
    const font = new Font(...fontArgs);

    const cacheKey = `${GlyphPlugin.charToHex(ch)} ${font.css}`;
    const cacheValue = GlyphPlugin.textMetricsCache[cacheKey];

    if (cacheValue) {
      return cacheValue;
    }

    const canvas = Phaser.Display.Canvas.CanvasPool.create(this);
    const ctx = canvas.getContext('2d');

    ctx.font = font.css;

    const metrics = (GlyphPlugin.textMetricsCache[cacheKey] = ctx.measureText(ch));
    Phaser.Display.Canvas.CanvasPool.remove(canvas);

    return metrics;
  }

  getTexture(charlike: CharLike, fgColorlike: ColorLike, bgColorlike?: ColorLike, ...fontArgs: FontArgs) {
    const glyph = getGlyphBytes(charlike, fgColorlike, bgColorlike);
    const font = new Font(...fontArgs);

    const [ch, fg, bg] = getGlyphCanvasData(glyph);
    const key = `${GlyphPlugin.charToHex(ch)} ${fg} ${bg} ${font.css} ${GlyphPlugin.charToHex(
      this.currentMeasurementCh
    )}`;

    if (this.game.textures.exists(key)) {
      return this.game.textures.get(key);
    }

    const [frameWidth, frameHeight] = this.getFrameDimensions(this.currentMeasurementCh, ...fontArgs);

    const texture = this.game.textures.createCanvas(key, frameWidth || 1, frameHeight || 1);
    const ctx = texture.getContext();

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, frameWidth, frameHeight);

    ctx.font = font.css;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = fg;
    ctx.fillText(ch, frameWidth / 2, frameHeight / 2);

    texture.add(0, 0, 0, 0, frameWidth, frameHeight);
    texture.update();

    return texture;
  }

  init(data?: GlyphPluginInitData) {
    super.init();

    if (!data) {
      return;
    }

    if (typeof data.measurementCh !== undefined && typeof data.measurementCh !== null) {
      this.setMeasurementCh(data.measurementCh);
    }
  }

  off<F extends (...args: unknown[]) => void, T>(event: GlyphPluginEvent, fn: F, context?: T, once?: boolean) {
    this.eventEmitter.off(event, fn, context, once);
    return this;
  }

  on<F extends (...args: unknown[]) => void, T>(event: GlyphPluginEvent, fn: F, context?: T) {
    this.eventEmitter.on(event, fn, context);
    return this;
  }

  once<F extends (...args: unknown[]) => void, T>(event: GlyphPluginEvent, fn: F, context?: T) {
    this.eventEmitter.once(event, fn, context);
    return this;
  }

  setMeasurementCh(charlike: CharLike) {
    const ch = getChar(getCharBytes(charlike));
    this.currentMeasurementCh = ch;
    this.eventEmitter.emit(GlyphPluginEvent.MeasurementCh, ch);
    return this;
  }
}
