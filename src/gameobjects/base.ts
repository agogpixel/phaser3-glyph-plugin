/**
 * Base GameObject module.
 *
 * @author kidthales <kidthales@agogpixel.com>
 * @copyright 2021-present AgogPixel
 * @license {@link https://agogpixel.github.io/phaser3-glyph-plugin/LICENSE|MIT License}
 * @module
 * @internal
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
 * {@link GlyphPluginGameObject} WebGL renderer type.
 * @internal
 */
export type GlyphPluginGameObjectWebGLRenderer<T extends GlyphPluginGameObject = GlyphPluginGameObject> = (
  renderer: Phaser.Renderer.WebGL.WebGLRenderer,
  src: T,
  camera: Phaser.Cameras.Scene2D.Camera,
  parentMatrix?: Phaser.GameObjects.Components.TransformMatrix
) => void;

/**
 * {@link GlyphPluginGameObject} canvas renderer type.
 * @internal
 */
export type GlyphPluginGameObjectCanvasRenderer<T extends GlyphPluginGameObject = GlyphPluginGameObject> = (
  renderer: Phaser.Renderer.Canvas.CanvasRenderer,
  src: T,
  camera: Phaser.Cameras.Scene2D.Camera,
  parentMatrix?: Phaser.GameObjects.Components.TransformMatrix
) => void;

/**
 * {@link GlyphPluginGameObject} creator configuration.
 * @internal
 */
export interface GlyphPluginGameObjectConfig extends Phaser.Types.GameObjects.GameObjectConfig {
  /**
   * {@link Font} to be used.
   */
  font?: Font;

  /**
   * Force square ratio?
   */
  forceSquareRatio?: boolean;

  /**
   * Key indicating the specific {@link GlyphPlugin} instance that the
   * {@link GlyphPluginGameObject} will use.
   */
  pluginKey?: string;
}

/**
 * Find {@link GlyphPlugin} in [Phaser.Plugins.PluginManager](https://photonstorm.github.io/phaser3-docs/Phaser.Plugins.PluginManager.html).
 * @param pluginManager [Phaser.Plugins.PluginManager](https://photonstorm.github.io/phaser3-docs/Phaser.Plugins.PluginManager.html)
 * instance.
 * @param key (Optional) {@link GlyphPlugin} key to search for.
 * @returns Returns {@link GlyphPlugin} as specified by key, or fallback to first
 * {@link GlyphPlugin} found.
 * @throws Error if no {@link GlyphPlugin} instance exists in the
 * [Phaser.Plugins.PluginManager](https://photonstorm.github.io/phaser3-docs/Phaser.Plugins.PluginManager.html).
 * @internal
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
 * Default {@link Font}.
 * @internal
 */
export const defaultFont = new Font(24, '"Lucida Console", Courier, monospace');

/**
 * Base [Phaser.GameObject.GameObject](https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.GameObject.html)
 * with {@link GlyphPlugin} functionality.
 * @internal
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
   * {@link GlyphPluginGameObject} WebGL renderer.
   * @protected
   * @internal
   */
  readonly renderWebGL: GlyphPluginGameObjectWebGLRenderer = Phaser.Utils.NOOP;

  /**
   * {@link GlyphPluginGameObject} canvas renderer.
   * @protected
   * @internal
   */
  readonly renderCanvas: GlyphPluginGameObjectCanvasRenderer = Phaser.Utils.NOOP;

  /**
   * Track current {@link Font}.
   * @protected
   * @internal
   */
  _currentFont: Font;

  /**
   * Track current force square ratio flag.
   * @protected
   * @internal
   */
  _currentForceSquareRatio: boolean;

  /**
   * Track current {@link GlyphPlugin}.
   * @protected
   * @internal
   */
  _currentGlyphPlugin: GlyphPlugin;

  /**
   * Get readonly reference to {@link Font}.
   */
  get font(): Readonly<Font> {
    return this._currentFont;
  }

  /**
   * Set {@link Font}.
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
   * Get {@link GlyphPlugin}.
   */
  get glyphPlugin() {
    return this._currentGlyphPlugin;
  }

  /**
   * Set {@link GlyphPlugin}.
   * @see {@link GlyphPluginGameObject.setGlyphPlugin}
   */
  set glyphPlugin(value: GlyphPlugin) {
    this.setGlyphPlugin(value);
  }

  /**
   * Instantiate {@link GlyphPluginGameObject}.
   * @param scene The [Phaser.Scene](https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html)
   * to which this {@link GlyphPluginGameObject} belongs.
   * @param type A textual representation of this {@link GlyphPluginGameObject},
   * i.e. glyph. Used internally by Phaser.
   * @param x (Default: 0) World X-coordinate.
   * @param y (Default: 0) World Y-coordinate.
   * @param font (Default: 'normal normal normal 24px "Lucida Console", Courier, monospace')
   * {@link Font} to use.
   * @param forceSquareRatio (Default: false) Force square a frame.
   * @param pluginKey (Optional) {@link GlyphPlugin} key.
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
   * Destroy {@link GlyphPluginGameObject} & resources.
   * @param fromScene (Default: false) Destroyed by the
   * [Phaser.Scene](https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html)?
   */
  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
    this._removeGlyphPluginEventListeners();
  }

  /**
   * Refresh {@link GlyphPluginGameObject}.
   * @returns The {@link GlyphPluginGameObject} instance for further chaining.
   */
  refresh() {
    return this;
  }

  /**
   * Set {@link Font}. Refreshes {@link GlyphPluginGameObject}.
   * @param font {@link Font} to use.
   * @returns The {@link GlyphPluginGameObject} instance for further chaining.
   */
  setFont(font: Font) {
    this._currentFont = Font.clone(font);
    return this.refresh();
  }

  /**
   * Set force square ratio. Refreshes {@link GlyphPluginGameObject}.
   * @param value (Default: true) Force square ratio flag.
   * @returns The {@link GlyphPluginGameObject} instance for further chaining.
   */
  setForceSquareRatio(value = true) {
    this._currentForceSquareRatio = value;
    return this.refresh();
  }

  /**
   * Set associated {@link GlyphPlugin} & update event listeners.
   * Refreshes {@link GlyphPluginGameObject}.
   * @param plugin {@link GlyphPlugin} instance.
   * @returns The {@link GlyphPluginGameObject} instance for further chaining.
   */
  setGlyphPlugin(plugin: GlyphPlugin) {
    this._removeGlyphPluginEventListeners();
    this._currentGlyphPlugin = plugin;
    return this.refresh()._addGlyphPluginEventListeners();
  }

  /**
   * Add {@link GlyphPlugin} event listeners.
   * @returns The {@link GlyphPluginGameObject} instance for further chaining.
   * @private
   * @internal
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
   * When associated {@link GlyphPlugin} is destroyed,
   * {@link GlyphPluginGameObject} will attempt to fallback to first
   * {@link GlyphPlugin} found in the [Phaser.Plugins.PluginManager](https://photonstorm.github.io/phaser3-docs/Phaser.Plugins.PluginManager.html),
   * refreshing & registering new event listeners.
   * @throws Error if no {@link GlyphPlugin} is found in the
   * [Phaser.Plugins.PluginManager](https://photonstorm.github.io/phaser3-docs/Phaser.Plugins.PluginManager.html).
   * @private
   * @internal
   */
  _glyphPluginDestroyEventListener() {
    if (!this.scene) {
      return;
    }

    this._currentGlyphPlugin = findGlyphPlugin(this.scene.plugins);
    this.refresh()._addGlyphPluginEventListeners();
  }

  /**
   * When associated {@link GlyphPlugin} emits {@link GlyphPluginEvent.Update},
   * refresh the {@link GlyphPluginGameObject}.
   * @private
   * @internal
   */
  _glyphPluginUpdateEventListener(data: GlyphPluginUpdateEventData) {
    if (data.advancedTextMetrics !== undefined || data.measurementCodePoint !== undefined) {
      this.refresh();
    }
  }

  /**
   * Remove {@link GlyphPlugin} event listeners.
   * @returns The {@link GlyphPluginGameObject} instance for further chaining.
   * @private
   * @internal
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
