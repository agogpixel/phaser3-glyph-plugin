/**
 * Glyph plugin game object module.
 *
 * @author kidthales <kidthales@agogpixel.com>
 * @copyright 2021-present AgogPixel
 * @license {@link https://agogpixel.github.io/phaser3-glyph-plugin/LICENSE|MIT License}
 * @module
 */

import {
  Alpha,
  BlendMode,
  Depth,
  Flip,
  GetBounds,
  Origin,
  Pipeline,
  ScrollFactor,
  Transform,
  Visible
} from '@agogpixel/phaser3-ts-utils/mixins/gameobjects/components';
import { CustomGameObject } from '@agogpixel/phaser3-ts-utils/mixins/gameobjects/custom-gameobject';

import { GlyphPlugin, GlyphPluginEvent } from '../plugin';
import { Font } from '../shared';

/**
 * Glyph plugin game object WebGL renderer type.
 * @internal
 */
export type GlyphPluginGameObjectWebGLRenderer<T extends GlyphPluginGameObject = GlyphPluginGameObject> = (
  renderer: Phaser.Renderer.WebGL.WebGLRenderer,
  src: T,
  camera: Phaser.Cameras.Scene2D.Camera,
  parentMatrix?: Phaser.GameObjects.Components.TransformMatrix
) => void;

/**
 * Glyph plugin game object canvas renderer type.
 * @internal
 */
export type GlyphPluginGameObjectCanvasRenderer<T extends GlyphPluginGameObject = GlyphPluginGameObject> = (
  renderer: Phaser.Renderer.Canvas.CanvasRenderer,
  src: T,
  camera: Phaser.Cameras.Scene2D.Camera,
  parentMatrix?: Phaser.GameObjects.Components.TransformMatrix
) => void;

/**
 * Glyph plugin game object configuration.
 */
export interface GlyphPluginGameObjectConfig extends Phaser.Types.GameObjects.GameObjectConfig {
  /**
   * Font.
   */
  font?: Font;

  /**
   * Force square ratio?
   */
  forceSquareRatio?: boolean;

  /**
   * Glyph plugin key.
   */
  pluginKey?: string;
}

/**
 * Base game object with glyph plugin functionality.
 */
export class GlyphPluginGameObject extends CustomGameObject(
  false,
  Alpha,
  BlendMode,
  Depth,
  Flip,
  GetBounds,
  Origin,
  Pipeline,
  ScrollFactor,
  Transform,
  Visible
) {
  /**
   * Glyph plugin game object WebGL renderer.
   * @protected
   * @internal
   */
  readonly renderWebGL: GlyphPluginGameObjectWebGLRenderer = Phaser.Utils.NOOP;

  /**
   * Glyph plugin game object canvas renderer.
   * @protected
   * @internal
   */
  readonly renderCanvas: GlyphPluginGameObjectCanvasRenderer = Phaser.Utils.NOOP;

  /**
   * Track current font.
   * @protected
   */
  currentFont: Font;

  /**
   * Track current force square ratio flag.
   * @protected
   */
  currentForceSquareRatio: boolean;

  /**
   * Track current glyph plugin.
   * @protected
   */
  currentGlyphPlugin: GlyphPlugin;

  /**
   * Refresh glyph plugin game object.
   * @returns Glyph plugin game object instance for further chaining.
   * @protected
   * @abstract
   */
  readonly refresh: () => this;

  /**
   * Get readonly reference to font.
   */
  get font(): Readonly<Font> {
    return this.currentFont;
  }

  /**
   * Set font.
   * @see {@link GlyphPluginGameObject.setFont}
   */
  set font(value: Font) {
    this.setFont(value);
  }

  /**
   * Get force square ratio.
   */
  get forceSquareRatio() {
    return this.currentForceSquareRatio;
  }

  /**
   * Set force square ratio.
   * @see {@link GlyphPluginGameObject.setForceSquareRatio}
   */
  set forceSquareRatio(value: boolean) {
    this.setForceSquareRatio(value);
  }

  /**
   * Get glyph plugin.
   */
  get glyphPlugin() {
    return this.currentGlyphPlugin;
  }

  /**
   * Set glyph plugin.
   * @see {@link GlyphPluginGameObject.setGlyphPlugin}
   */
  set glyphPlugin(value: GlyphPlugin) {
    this.setGlyphPlugin(value);
  }

  /**
   * Instantiate glyph plugin game object.
   * @param scene The Scene to which this Game Object belongs.
   * @param type A textual representation of this Game Object, i.e. sprite. Used
   * internally by Phaser but is available for your own custom classes to
   * populate.
   * @param x (Default: 0) World X-coordinate.
   * @param y (Default: 0) World Y-coordinate.
   * @param font (Optional) Font to use.
   * @param forceSquareRatio (Default: true) Force square glyph frames/cells,
   * using the greater of width or height of the associated glyph plugin's
   * measurement character.
   * @param pluginKey (Optional) Glyph plugin key.
   */
  constructor(
    scene: Phaser.Scene,
    type: string,
    x = 0,
    y = 0,
    font = new Font(24, 'monospace'),
    forceSquareRatio = false,
    pluginKey?: string
  ) {
    super(scene, type);

    this.currentGlyphPlugin = GlyphPlugin.findPlugin(scene.game.plugins, pluginKey);
    this.currentFont = Font.clone(font);
    this.currentForceSquareRatio = forceSquareRatio;

    this.setPosition(x, y).addGlyphPluginEventListeners().initPipeline(undefined);
  }

  /**
   * Destroy glyph plugin game object & resources.
   * @param fromScene (Default: false) Is Game Object is being destroyed by the
   * Scene?
   */
  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
    this.removeGlyphPluginEventListeners();
  }

  /**
   * Set font. Refreshes glyph plugin game object.
   * @param font Font.
   * @returns Glyph plugin game object instance for further chaining.
   */
  setFont(font: Font) {
    this.currentFont = Font.clone(font);
    return this.refresh();
  }

  /**
   * Set force square ratio. Refreshes glyph plugin game object.
   * @param value (Default: true) Force square ratio flag.
   * @returns Glyph plugin game object instance for further chaining.
   */
  setForceSquareRatio(value = true) {
    this.currentForceSquareRatio = value;
    return this.refresh();
  }

  /**
   * Set associated glyph plugin & update event listeners. Refreshes glyph
   * plugin game object.
   * @param plugin Glyph plugin instance.
   * @returns Glyph plugin game object instance for further chaining.
   */
  setGlyphPlugin(plugin: GlyphPlugin) {
    this.removeGlyphPluginEventListeners();
    this.currentGlyphPlugin = plugin;
    return this.refresh().addGlyphPluginEventListeners();
  }

  /**
   * Add glyph plugin event listeners.
   * @returns Glyph plugin game object instance for further chaining.
   * @private
   */
  addGlyphPluginEventListeners() {
    if (this.currentGlyphPlugin) {
      this.currentGlyphPlugin
        .on(GlyphPluginEvent.Update, this.glyphPluginUpdateEventListener, this)
        .once(GlyphPluginEvent.Destroy, this.glyphPluginDestroyEventListener, this);
    }

    return this;
  }

  /**
   * When associated glyph plugin is destroyed, glyph plugin game object will
   * attempt to fallback to first glyph plugin found in the plugins manager,
   * refreshing & registering new event listeners.
   * @throws Error if no glyph plugin is found in the plugin manager.
   * @private
   */
  glyphPluginDestroyEventListener() {
    if (!this.scene) {
      return;
    }

    this.currentGlyphPlugin = GlyphPlugin.findPlugin(this.scene.plugins);
    this.refresh().addGlyphPluginEventListeners();
  }

  /**
   * When associated glyph plugin emits update event, refresh the glyph plugin
   * game object.
   * @private
   */
  glyphPluginUpdateEventListener() {
    this.refresh();
  }

  /**
   * Remove glyph plugin event listeners.
   * @returns Glyph plugin game object instance for further chaining.
   * @private
   */
  removeGlyphPluginEventListeners() {
    if (this.currentGlyphPlugin) {
      this.currentGlyphPlugin
        .off(GlyphPluginEvent.Update, this.glyphPluginUpdateEventListener, this)
        .off(GlyphPluginEvent.Destroy, this.glyphPluginDestroyEventListener, this, true);
    }

    return this;
  }
}
