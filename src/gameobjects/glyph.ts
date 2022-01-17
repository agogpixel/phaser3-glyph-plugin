/**
 * Glyph game object module.
 *
 * @author kidthales <kidthales@agogpixel.com>
 * @copyright 2021-present AgogPixel
 * @license {@link https://agogpixel.github.io/phaser3-glyph-plugin/LICENSE|MIT License}
 * @module
 */

declare const WEBGL_RENDERER: unknown;
declare const CANVAS_RENDERER: unknown;

import { Mask, Size, TextureCrop, Tint } from '@agogpixel/phaser3-ts-utils/mixins/gameobjects/components';

import { CharLike, ColorLike, GlyphLike, GlyphLikeTuple, normalizeCharLike, normalizeColorLike } from '../glyph';
import { Glyph } from '../glyph';
import type { CodePoint, Font } from '../utils';

import type {
  GlyphPluginGameObjectCanvasRenderer,
  GlyphPluginGameObjectConfig,
  GlyphPluginGameObjectWebGLRenderer
} from './base';
import { GlyphPluginGameObject } from './base';

////////////////////////////////////////////////////////////////////////////////
// Factories & Creators
////////////////////////////////////////////////////////////////////////////////

/**
 * Glyph GameObject factory type.
 */
export type GlyphGameObjectFactory = (
  ...args: ConstructorParameters<typeof GlyphGameObject> extends [unknown, ...infer R] ? R : never
) => GlyphGameObject;

/**
 * Glyph GameObject creator type.
 */
export type GlyphGameObjectCreator = (config?: GlyphGameObjectConfig, addToScene?: boolean) => GlyphGameObject;

/**
 * Glyph creator configuration.
 */
export interface GlyphGameObjectConfig extends GlyphPluginGameObjectConfig {
  /**
   * Glyphlike data.
   */
  glyph?: GlyphLike;
}

/**
 * Glyph game object factory.
 * @param this Phaser GameObject factory.
 * @param args Glyph game object instantiation arguments.
 * @returns Glyph game object instance.
 * @internal
 */
export const glyphGameObjectFactory: GlyphGameObjectFactory = function glyphGameObjectFactory(
  this: Phaser.GameObjects.GameObjectFactory,
  ...args
) {
  return this.displayList.add(new GlyphGameObject(this.scene, ...args)) as GlyphGameObject;
};

/**
 * Glyph game object creator.
 * @param this Phaser GameObject creator.
 * @param config Glyph game object creator configuration.
 * @param addToScene Add this Game Object to the Scene after creating it? If set
 * this argument overrides the `add` property in the config object.
 * @returns Glyph game object instance.
 * @internal
 */
export const glyphGameObjectCreator: GlyphGameObjectCreator = function glyphGameObjectCreator(
  this: Phaser.GameObjects.GameObjectCreator,
  config: GlyphGameObjectConfig = {},
  addToScene?: boolean
) {
  const glyph = new GlyphGameObject(
    this.scene,
    0,
    0,
    config.glyph,
    config.font,
    config.forceSquareRatio,
    config.pluginKey
  );

  if (addToScene !== undefined) {
    config.add = addToScene;
  }

  Phaser.GameObjects.BuildGameObject(this.scene, glyph, config);

  return glyph;
};

////////////////////////////////////////////////////////////////////////////////
// Renderers
////////////////////////////////////////////////////////////////////////////////

/**
 * Glyphmap WebGL renderer.
 * @internal
 */
let renderWebGL: GlyphPluginGameObjectWebGLRenderer<GlyphGameObject> = Phaser.Utils.NOOP;

/**
 * Glyphmap canvas renderer.
 * @internal
 */
let renderCanvas: GlyphPluginGameObjectCanvasRenderer<GlyphGameObject> = Phaser.Utils.NOOP;

if (typeof WEBGL_RENDERER) {
  renderWebGL = (renderer, src, camera, parentMatrix) => {
    const pipeline = renderer.pipelines.set(src.pipeline, src) as Phaser.Renderer.WebGL.Pipelines.MultiPipeline;
    pipeline.batchSprite(src as never, camera, parentMatrix);
  };
}

if (typeof CANVAS_RENDERER) {
  renderCanvas = (renderer, src, camera, parentMatrix) => {
    renderer.batchSprite(src, src.frame, camera, parentMatrix);
  };
}

////////////////////////////////////////////////////////////////////////////////
// GlyphGameObject Definition
////////////////////////////////////////////////////////////////////////////////

/**
 * Default glyphlike data.
 * @internal
 */
export const defaultGlyphLike = [' ', '#0000'] as GlyphLike;

/**
 * Glyph GameObject.
 */
export class GlyphGameObject extends Mask(Size(TextureCrop(Tint(class extends GlyphPluginGameObject {})))) {
  /**
   * Canvas renderer.
   * @protected
   * @internal
   */
  readonly renderCanvas = renderCanvas;

  /**
   * WebGL renderer.
   * @protected
   * @internal
   */
  readonly renderWebGL = renderWebGL;

  /**
   * Internal crop data object, as used by `setCrop` and passed to the `Frame.setCropUVs` method.
   * @internal
   */
  protected _crop: Record<string, unknown>;

  /**
   * Get background color.
   */
  get backgroundColor(): Phaser.Display.Color {
    return this.getGlyphFromTexture().backgroundColor;
  }

  /**
   * Set background color.
   * @see {@link GlyphGameObject.setBackgroundColor}
   */
  set backgroundColor(value: ColorLike) {
    this.setBackgroundColor(value);
  }

  /**
   * Get code point.
   */
  get codePoint(): CodePoint {
    return this.getGlyphFromTexture().codePoint;
  }

  /**
   * Set code point.
   * @see {@link GlyphGameObject.setCodePoint}
   */
  set codePoint(value: CharLike) {
    this.setCodePoint(value);
  }

  /**
   * Get foreground color.
   */
  get foregroundColor(): Phaser.Display.Color {
    return this.getGlyphFromTexture().foregroundColor;
  }

  /**
   * Set foreground color.
   * @see {@link GlyphGameObject.setForegroundColor}
   */
  set foregroundColor(value: ColorLike) {
    this.setForegroundColor(value);
  }

  /**
   * Get GlyphLike tuple corresponding to current glyph data. Color components
   * are in CSS functional color string notation.
   */
  get glyph(): GlyphLikeTuple {
    const glyph = this.getGlyphFromTexture();
    return [glyph.getCh(), ...glyph.getCssColors('functional')];
  }

  /**
   * Set glyph data.
   * @see {@link Glyph.setGlyph}
   */
  set glyph(value: GlyphLike) {
    this.setGlyph(value);
  }

  /**
   * Instantiate glyph game object.
   * @param scene The Scene to which this Game Object belongs.
   * @param x (Default: 0) World X-coordinate.
   * @param y (Default: 0) World Y-coordinate.
   * @param glyph (Default: [' ', '#0000']) Glyphlike data.
   * @param font (Default: 'normal normal normal 24px "Lucida Console", Courier, monospace')
   * Font to use.
   * @param forceSquareRatio (Optional) Force square glyph frames/cells,
   * using the greater of width or height of the associated glyph plugin's
   * measurement character.
   * @param pluginKey (Optional) Glyph plugin key.
   */
  constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    glyph: GlyphLike = defaultGlyphLike,
    font?: Font,
    forceSquareRatio?: boolean,
    pluginKey?: string
  ) {
    super(scene, 'Glyph', x, y, font, forceSquareRatio, pluginKey);

    this._crop = this['resetCropObject']();

    this.setGlyph(glyph || defaultGlyphLike) // Handle null.
      .setPosition(x, y)
      .setOriginFromFrame();
  }

  /**
   * Refresh glyph game object. Updates texture & size.
   * @returns Reference to glyph game object for further chaining.
   */
  refresh() {
    super.refresh();

    const glyph = this.getGlyphFromTexture();
    return this.setTexture(
      this._currentGlyphPlugin.getTexture(
        [glyph.codePoint, glyph.foregroundColor, glyph.backgroundColor],
        this._currentFont,
        this._currentForceSquareRatio
      ).key
    ).setSizeToFrame(undefined);
  }

  /**
   * Set background color. Updates texture.
   * @param value ColorLike to use.
   * @returns Reference to glyph game object for further chaining.
   */
  setBackgroundColor(value: ColorLike) {
    const glyph = this.getGlyphFromTexture();
    this.glyph = [glyph.codePoint, glyph.foregroundColor, normalizeColorLike(value)];
    return this;
  }

  /**
   * Set code point. Updates texture & size.
   * @param value CharLike to use.
   * @returns Reference to glyph game object for further chaining.
   */
  setCodePoint(value: CharLike) {
    const glyph = this.getGlyphFromTexture();
    this.glyph = [normalizeCharLike(value), glyph.foregroundColor, glyph.backgroundColor];
    return this;
  }

  /**
   * Set foreground color. Updates texture.
   * @param value ColorLike to use.
   * @returns Reference to glyph game object for further chaining.
   */
  setForegroundColor(value: ColorLike) {
    const glyph = this.getGlyphFromTexture();
    this.glyph = [glyph.codePoint, normalizeColorLike(value), glyph.backgroundColor];
    return this;
  }

  /**
   * Set glyph. Updates texture & size.
   * @param glyph GlyphLike data to use.
   * @returns Reference to glyph game object for further chaining.
   */
  setGlyph(glyph: GlyphLike) {
    return this.setTexture(
      this._currentGlyphPlugin.getTexture(glyph, this._currentFont, this._currentForceSquareRatio).key
    ).setSizeToFrame(undefined);
  }

  /**
   * Rehydrate glyph data from current texture.
   * @returns Glyph data for this glyph game object.
   */
  private getGlyphFromTexture() {
    return Glyph.fromTexture(this.texture);
  }
}
