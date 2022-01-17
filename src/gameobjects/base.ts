/**
 * Base GameObject module.
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

import type { GlyphPluginUpdateEventData } from '../events';
import { GlyphPluginEvent } from '../events';
import type { GlyphPlugin } from '../plugins';
import { Font } from '../utils';

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
 * Find glyph plugin in plugin manager.
 * @param pluginManager Plugin manager instance.
 * @param key (Optional) Plugin key to search for.
 * @returns Returns glyph plugin as specified by key, or fallback to first
 * glyph plugin found.
 * @throws Error if no glyph plugin instance exists in the plugin manager.
 */
export function findGlyphPlugin(pluginManager: Phaser.Plugins.PluginManager, key?: string) {
  let plugin: GlyphPlugin;

  if (typeof key === 'string') {
    plugin = pluginManager.get(key, true) as GlyphPlugin;
  }

  if (!plugin) {
    plugin = pluginManager.plugins.find((p) => p.plugin['isGlyphPlugin'])?.plugin as unknown as GlyphPlugin;
  }

  if (!plugin) {
    throw new Error('GlyphPlugin instance not found in Phaser pluginManager. Have you started the plugin?');
  }

  return plugin;
}

/**
 * Default font.
 * @internal
 */
export const defaultFont = new Font(24, '"Lucida Console", Courier, monospace');

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
  _currentFont: Font;

  /**
   * Track current force square ratio flag.
   * @protected
   */
  _currentForceSquareRatio: boolean;

  /**
   * Track current glyph plugin.
   * @protected
   */
  _currentGlyphPlugin: GlyphPlugin;

  /**
   * Get readonly reference to font.
   */
  get font(): Readonly<Font> {
    return this._currentFont;
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
    return this._currentForceSquareRatio;
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
    return this._currentGlyphPlugin;
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
   * @param font (Default: 'normal normal normal 24px "Lucida Console", Courier, monospace')
   * Font to use.
   * @param forceSquareRatio (Default: false) Force square glyph frames/cells,
   * using the greater of width or height of the associated glyph plugin's
   * measurement character.
   * @param pluginKey (Optional) Glyph plugin key.
   */
  constructor(
    scene: Phaser.Scene,
    type: string,
    x = 0,
    y = 0,
    font = defaultFont,
    forceSquareRatio = false,
    pluginKey?: string
  ) {
    super(scene, type);

    this._currentGlyphPlugin = findGlyphPlugin(scene.game.plugins, pluginKey);
    this._currentFont = Font.clone(font || defaultFont); // Handle null.
    this._currentForceSquareRatio = forceSquareRatio;

    this.setPosition(x, y)._addGlyphPluginEventListeners().initPipeline(undefined);
  }

  /**
   * Destroy glyph plugin game object & resources.
   * @param fromScene (Default: false) Is Game Object is being destroyed by the
   * Scene?
   */
  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
    this._removeGlyphPluginEventListeners();
  }

  /**
   * Refresh glyph plugin game object.
   * @returns Glyph plugin game object instance for further chaining.
   */
  refresh() {
    return this;
  }

  /**
   * Set font. Refreshes glyph plugin game object.
   * @param font Font.
   * @returns Glyph plugin game object instance for further chaining.
   */
  setFont(font: Font) {
    this._currentFont = Font.clone(font);
    return this.refresh();
  }

  /**
   * Set force square ratio. Refreshes glyph plugin game object.
   * @param value (Default: true) Force square ratio flag.
   * @returns Glyph plugin game object instance for further chaining.
   */
  setForceSquareRatio(value = true) {
    this._currentForceSquareRatio = value;
    return this.refresh();
  }

  /**
   * Set associated glyph plugin & update event listeners. Refreshes glyph
   * plugin game object.
   * @param plugin Glyph plugin instance.
   * @returns Glyph plugin game object instance for further chaining.
   */
  setGlyphPlugin(plugin: GlyphPlugin) {
    this._removeGlyphPluginEventListeners();
    this._currentGlyphPlugin = plugin;
    return this.refresh()._addGlyphPluginEventListeners();
  }

  /**
   * Add glyph plugin event listeners.
   * @returns Glyph plugin game object instance for further chaining.
   * @private
   */
  _addGlyphPluginEventListeners() {
    if (this._currentGlyphPlugin) {
      this._currentGlyphPlugin
        .on(GlyphPluginEvent.Update, this._glyphPluginUpdateEventListener, this)
        .once(GlyphPluginEvent.Destroy, this._glyphPluginDestroyEventListener, this);
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
  _glyphPluginDestroyEventListener() {
    if (!this.scene) {
      return;
    }

    this._currentGlyphPlugin = findGlyphPlugin(this.scene.plugins);
    this.refresh()._addGlyphPluginEventListeners();
  }

  /**
   * When associated glyph plugin emits update event, refresh the glyph plugin
   * game object.
   * @private
   */
  _glyphPluginUpdateEventListener(data: GlyphPluginUpdateEventData) {
    if (data.advancedTextMetrics !== undefined || data.measurementCodePoint !== undefined) {
      this.refresh();
    }
  }

  /**
   * Remove glyph plugin event listeners.
   * @returns Glyph plugin game object instance for further chaining.
   * @private
   */
  _removeGlyphPluginEventListeners() {
    if (this._currentGlyphPlugin) {
      this._currentGlyphPlugin
        .off(GlyphPluginEvent.Update, this._glyphPluginUpdateEventListener, this)
        .off(GlyphPluginEvent.Destroy, this._glyphPluginDestroyEventListener, this, true);
    }

    return this;
  }
}
