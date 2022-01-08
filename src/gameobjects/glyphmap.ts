/**
 * Glyphmap game object module.
 *
 * Derived from {@link https://github.com/photonstorm/phaser/tree/master/src/tilemaps}.
 * @copyright 2020 Photon Storm Ltd.
 * @license {@link https://opensource.org/licenses/MIT|MIT License}
 *
 * @author kidthales <kidthales@agogpixel.com>
 * @copyright 2021-present AgogPixel
 * @license {@link https://agogpixel.github.io/phaser3-glyph-plugin/LICENSE|MIT License}
 * @module
 */

declare const WEBGL_RENDERER: unknown;
declare const CANVAS_RENDERER: unknown;

import {
  Alpha,
  BlendMode,
  ComputedSize,
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
import type { GlyphLike } from '../shared';
import { bytesPerGlyph, createGlyphsBuffer, Font } from '../shared';

/**
 * Glyphmap factory type.
 */
export type GlyphmapFactory = (
  ...args: ConstructorParameters<typeof Glyphmap> extends [unknown, ...infer R] ? R : never
) => Glyphmap;

/**
 * Glyphmap creator type.
 */
export type GlyphmapCreator = (config?: GlyphmapConfig, addToScene?: boolean) => Glyphmap;

/**
 * Glyphmap creator configuration.
 */
export interface GlyphmapConfig extends Phaser.Types.GameObjects.GameObjectConfig {
  /**
   * Width in glyph cells.
   */
  width?: number;

  /**
   * Height in glyph cells.
   */
  height?: number;

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
 * Glyphmap factory.
 * @param this Phaser GameObject factory.
 * @param args Glyphmap instantiation arguments.
 * @returns Glyphmap instance.
 * @internal
 */
export const glyphmapFactory: GlyphmapFactory = function glyphmapFactory(
  this: Phaser.GameObjects.GameObjectFactory,
  ...args
) {
  return this.displayList.add(new Glyphmap(this.scene, ...args)) as Glyphmap;
};

/**
 * Glyphmap creator.
 * @param this Phaser GameObject creator.
 * @param config Glyphmap creator configuration.
 * @param addToScene Add this Game Object to the Scene after creating it? If set
 * this argument overrides the `add` property in the config object.
 * @returns Glyphmap instance.
 * @internal
 */
export const glyphmapCreator: GlyphmapCreator = function glyphmapCreator(
  this: Phaser.GameObjects.GameObjectCreator,
  config: GlyphmapConfig = {},
  addToScene?: boolean
) {
  const glyphmap = new Glyphmap(
    this.scene,
    0,
    0,
    config.width,
    config.height,
    config.font,
    config.forceSquareRatio,
    config.pluginKey
  );

  if (addToScene !== undefined) {
    config.add = addToScene;
  }

  Phaser.GameObjects.BuildGameObject(this.scene, glyphmap, config);

  return glyphmap;
};

/**
 * Used for cull bounds pass.
 * @internal
 */
const bounds = new Phaser.Geom.Rectangle();

/**
 * Get cull bounds to potentially reduce number of cells that require rendering.
 * @param map Glyphmap instance.
 * @param camera Camera instance.
 * @returns Rectangular bounds of glyphmap that should be rendered.
 * @internal
 */
function getCullBounds(map: Glyphmap, camera: Phaser.Cameras.Scene2D.Camera) {
  if (map.skipCull || map.scrollFactorX !== 1 || map.scrollFactorY !== 1) {
    return bounds.setTo(0, 0, map.widthInCells, map.heightInCells);
  }

  const cellW = Math.floor(map.cellWidth * map.scaleX);
  const cellH = Math.floor(map.cellHeight * map.scaleY);

  const boundsLeft = Phaser.Math.Snap.Floor(camera.worldView.x - map.x, cellW, 0, true) - map.cullPaddingX;
  const boundsRight = Phaser.Math.Snap.Ceil(camera.worldView.right - map.x, cellW, 0, true) + map.cullPaddingX;

  const boundsTop = Phaser.Math.Snap.Floor(camera.worldView.y - map.y, cellH, 0, true) - map.cullPaddingY;
  const boundsBottom = Phaser.Math.Snap.Ceil(camera.worldView.bottom - map.y, cellH, 0, true) + map.cullPaddingY;

  return bounds.setTo(boundsLeft, boundsTop, boundsRight - boundsLeft, boundsBottom - boundsTop);
}

/**
 * Glyphmap WebGL renderer.
 * @internal
 */
let renderWebGL: (
  renderer: Phaser.Renderer.WebGL.WebGLRenderer,
  src: Glyphmap,
  camera: Phaser.Cameras.Scene2D.Camera
) => void = Phaser.Utils.NOOP;

/**
 * Glyphmap canvas renderer.
 * @internal
 */
let renderCanvas: (
  renderer: Phaser.Renderer.Canvas.CanvasRenderer,
  src: Glyphmap,
  camera: Phaser.Cameras.Scene2D.Camera,
  parentMatrix: Phaser.GameObjects.Components.TransformMatrix
) => void = Phaser.Utils.NOOP;

if (typeof WEBGL_RENDERER) {
  renderWebGL = (renderer, src, camera) => {
    const {
      x: cullBoundsX,
      y: cullBoundsY,
      width: cullBoundsWidth,
      height: cullBoundsHeight,
      bottom: cullBoundsEndY,
      right: cullBoundsEndX
    } = getCullBounds(src, camera);

    const cellCount = cullBoundsWidth * cullBoundsHeight;
    const alpha = camera.alpha * src.alpha;

    if (cellCount === 0 || alpha <= 0) {
      return;
    }

    const pipeline = renderer.pipelines.set(src.pipeline, src) as Phaser.Renderer.WebGL.Pipelines.MultiPipeline;

    const scrollFactorX = src.scrollFactorX;
    const scrollFactorY = src.scrollFactorY;

    const x = src.x;
    const y = src.y;

    const sx = src.scaleX;
    const sy = src.scaleY;

    const getTint = Phaser.Renderer.WebGL.Utils.getTintAppendFloatAlpha;

    const cellWidth = src.cellWidth;
    const cellHeight = src.cellHeight;

    const halfWidth = cellWidth * 0.5;
    const halfHeight = cellHeight * 0.5;

    const textures = src['textures'];
    const getKey = Glyphmap['getKey'];

    renderer.pipelines.preBatch(src);

    for (let indexY = cullBoundsY; indexY < cullBoundsEndY; ++indexY) {
      for (let indexX = cullBoundsX; indexX < cullBoundsEndX; ++indexX) {
        const key = getKey(indexX, indexY);

        if (!textures.has(key)) {
          continue;
        }

        const cellTextures = textures.get(key);
        const cellTexturesLen = cellTextures.length;

        for (let ix = 0; ix < cellTexturesLen; ++ix) {
          const texture = cellTextures[ix].get().source.glTexture;

          const textureUnit = pipeline.setTexture2D(texture);
          const tint = getTint(0xffffff, alpha);

          pipeline.batchTexture(
            src,
            texture,
            texture['width'],
            texture['height'],
            x + (halfWidth + indexX * cellWidth) * sx,
            y + (halfHeight + indexY * cellHeight) * sy,
            cellWidth,
            cellHeight,
            sx,
            sy,
            0,
            false,
            false,
            scrollFactorX,
            scrollFactorY,
            halfWidth,
            halfHeight,
            0,
            0,
            cellWidth,
            cellHeight,
            tint,
            tint,
            tint,
            tint,
            false as unknown as number,
            0,
            0,
            camera,
            null,
            true,
            textureUnit
          );
        }
      }
    }

    renderer.pipelines.postBatch(src);
  };
}

if (typeof CANVAS_RENDERER) {
  const tempMatrix1 = new Phaser.GameObjects.Components.TransformMatrix();
  const tempMatrix2 = new Phaser.GameObjects.Components.TransformMatrix();
  const tempMatrix3 = new Phaser.GameObjects.Components.TransformMatrix();

  renderCanvas = (renderer, src, camera, parentMatrix) => {
    const {
      x: cullBoundsX,
      y: cullBoundsY,
      width: cullBoundsWidth,
      height: cullBoundsHeight,
      bottom: cullBoundsEndY,
      right: cullBoundsEndX
    } = getCullBounds(src, camera);

    const cellCount = cullBoundsWidth * cullBoundsHeight;
    const alpha = camera.alpha * src.alpha;

    if (cellCount === 0 || alpha <= 0) {
      return;
    }

    const camMatrix = tempMatrix1;
    const mapMatrix = tempMatrix2;
    const calcMatrix = tempMatrix3;

    mapMatrix.applyITRS(src.x, src.y, src.rotation, src.scaleX, src.scaleY);

    camMatrix.copyFrom(camera['matrix']);

    const ctx = renderer.currentContext;

    ctx.save();

    if (parentMatrix) {
      //  Multiply the camera by the parent matrix
      camMatrix.multiplyWithOffset(
        parentMatrix,
        -camera.scrollX * src.scrollFactorX,
        -camera.scrollY * src.scrollFactorY
      );

      //  Undo the camera scroll
      mapMatrix.e = src.x;
      mapMatrix.f = src.y;

      //  Multiply by the Sprite matrix, store result in calcMatrix
      camMatrix.multiply(mapMatrix, calcMatrix);

      calcMatrix.copyToContext(ctx);
    } else {
      mapMatrix.e -= camera.scrollX * src.scrollFactorX;
      mapMatrix.f -= camera.scrollY * src.scrollFactorY;

      mapMatrix.copyToContext(ctx);
    }

    if (!renderer.antialias || src.scaleX > 1 || src.scaleY > 1) {
      ctx.imageSmoothingEnabled = false;
    }

    const cellWidth = src.cellWidth;
    const cellHeight = src.cellHeight;

    const halfWidth = cellWidth * 0.5;
    const halfHeight = cellHeight * 0.5;

    const textures = src['textures'];
    const getKey = Glyphmap['getKey'];

    for (let y = cullBoundsY; y < cullBoundsEndY; ++y) {
      for (let x = cullBoundsX; x < cullBoundsEndX; ++x) {
        const key = getKey(x, y);

        if (!textures.has(key)) {
          continue;
        }

        ctx.save();
        ctx.translate(x * cellWidth + halfWidth, y * cellHeight + halfHeight);

        const cellTextures = textures.get(key);
        const cellTexturesLen = cellTextures.length;

        for (let ix = 0; ix < cellTexturesLen; ++ix) {
          const sourceImage = cellTextures[ix].getSourceImage() as HTMLImageElement | HTMLCanvasElement;

          ctx.drawImage(
            sourceImage,
            0,
            0,
            sourceImage.width,
            sourceImage.height,
            -halfWidth,
            -halfHeight,
            cellWidth,
            cellHeight
          );
        }

        ctx.restore();
      }
    }

    ctx.restore();
  };
}

/**
 * Displays glyph data as a grid.
 */
export class Glyphmap extends CustomGameObject(
  Alpha,
  BlendMode,
  ComputedSize,
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
   * Get position key from coordinates.
   * @param x X-coordinate.
   * @param y Y-coordinate.
   * @returns String of the form `X,Y`.
   */
  private static getKey(x: number, y: number) {
    return `${x},${y}`;
  }

  /**
   * Height of map in glyph cells.
   */
  readonly heightInCells: number;

  /**
   * Width of map in glyph cells.
   */
  readonly widthInCells: number;

  /**
   * The amount of extra glyph cells to add into the cull bounds when
   * calculating its horizontal size.
   * @see {@link Glyphmap.setCullPadding}
   */
  cullPaddingX = 1;

  /**
   * The amount of extra glyph cells to add into the cull bounds when
   * calculating its vertical size.
   * @see {@link Glyphmap.setCullPadding}
   */
  cullPaddingY = 1;

  /**
   * Control if a camera should cull glyph cells before rendering them or not.
   * @see {@link Glyphmap.setSkipCull}
   */
  skipCull = false;

  /**
   * Canvas renderer.
   */
  protected readonly renderCanvas = renderCanvas;

  /**
   * WebGL renderer.
   */
  protected readonly renderWebGL = renderWebGL;

  /**
   * Glyph data, mapping position key to glyphs buffer.
   */
  private readonly glyphs = new Map<string, Uint8Array>();

  /**
   * Glyph texture data, mapping position key to glyph textures.
   */
  private readonly textures = new Map<string, Phaser.Textures.Texture[]>();

  /**
   * Track current glyph cell height, in pixels.
   */
  private currentCellHeight: number;

  /**
   * Track current glyph cell width, in pixels.
   */
  private currentCellWidth: number;

  /**
   * Track current font.
   */
  private currentFont: Font;

  /**
   * Track current glyph plugin.
   */
  private currentGlyphPlugin: GlyphPlugin;

  /**
   * Track current force square ratio flag.
   */
  private currentForceSquareRatio: boolean;

  /**
   * Get glyph cell width, in pixels.
   */
  get cellWidth() {
    return this.currentCellWidth;
  }

  /**
   * Get glyph cell height, in pixels.
   */
  get cellHeight() {
    return this.currentCellHeight;
  }

  /**
   * Get readonly reference to font.
   */
  get font(): Readonly<Font> {
    return this.currentFont;
  }

  /**
   * Set font.
   * @see {@link Glyphmap.setFont}
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
   * @see {@link Glyphmap.setForceSquareRatio}
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
   * Get glyph plugin.
   * @see {@link Glyphmap.setGlyphPlugin}
   */
  set glyphPlugin(value: GlyphPlugin) {
    this.setGlyphPlugin(value);
  }

  /**
   * Instantiate glyphmap game object.
   *
   * @param scene The Scene to which this Game Object belongs.
   * @param x (Default: 0) World X-coordinate.
   * @param y (Default: 0) World Y-coordinate.
   * @param width (Default: 80) Width in glyph cells.
   * @param height (Default: 25) Height in glyph cells.
   * @param font (Optional) Font to use.
   * @param forceSquareRatio (Default: false) Force square glyph frames/cells,
   * using the greater of width or height of the associated glyph plugin's
   * measurement character.
   * @param pluginKey (Optional) Glyph plugin key.
   */
  constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    width = 80,
    height = 25,
    font = new Font(24, 'monospace'),
    forceSquareRatio = false,
    pluginKey?: string
  ) {
    super(scene, 'Glyphmap');

    this.currentGlyphPlugin = GlyphPlugin.findPlugin(scene.game.plugins, pluginKey);

    this.widthInCells = Math.floor(width < 0 ? 0 : width);
    this.heightInCells = Math.floor(height < 0 ? 0 : height);

    this.currentFont = Font.clone(font);
    this.currentForceSquareRatio = forceSquareRatio;

    this.setOrigin(0).setPosition(x, y).refresh().addGlyphPluginEventListeners().initPipeline(undefined);
  }

  /**
   * Converts from glyph cell X-coordinate to world X-coordinate (pixels),
   * factoring in the glyphmap's position, scale and scroll.
   * @param cellX Glyph cell X-coordinate.
   * @param originX (Default: 0) Glyph cell horizontal origin [0..1].
   * @param camera (Optional) Camera to use.
   * @returns World X-coordinate corresponding to specified cell X-coordinate.
   */
  cellToWorldX(cellX: number, originX = 0, camera?: Phaser.Cameras.Scene2D.Camera) {
    const cellWidth = this.currentCellWidth * this.scaleX;

    camera = camera || this.scene.cameras.main;

    // Find the world position relative to top left origin, factoring in the
    // camera's horizontal scroll.
    const worldX = this.getTopLeft().x + camera.scrollX * (1 - this.scrollFactorX);

    return worldX + cellX * cellWidth + originX * cellWidth;
  }

  /**
   * Converts from glyph cell Y-coordinate to world Y-coordinate (pixels),
   * factoring in the glyphmap's position, scale and scroll.
   * @param cellY Glyph cell Y-coordinate.
   * @param originY (Default: 0) Glyph cell vertical origin [0..1].
   * @param camera (Optional) Camera to use.
   * @returns World Y-coordinate corresponding to specified cell Y-coordinate.
   */
  cellToWorldY(cellY: number, originY = 0, camera?: Phaser.Cameras.Scene2D.Camera) {
    const cellHeight = this.currentCellHeight * this.scaleY;

    camera = camera || this.scene.cameras.main;

    // Find the world position relative to top left origin, factoring in the
    // camera's vertical scroll.
    const worldY = this.getTopLeft().y + camera.scrollY * (1 - this.scrollFactorY);

    return worldY + cellY * cellHeight + originY * cellHeight;
  }

  /**
   * Converts from glyph cell X,Y coordinates to world X,Y coordinates (pixels),
   * factoring in the glyphmap's position, scale and scroll.
   * @param cellX Glyph cell X-coordinate.
   * @param cellY Glyph cell Y-coordinate.
   * @param originX (Default: 0) Glyph cell horizontal origin [0..1].
   * @param originY (Default: 0) Glyph cell vertical origin [0..1].
   * @param camera (Optional) Camera to use.
   * @returns World X,Y coordinates tuple corresponding to specified cell X,Y
   * coordinates.
   */
  cellToWorldXY(cellX: number, cellY: number, originX = 0, originY = 0, camera?: Phaser.Cameras.Scene2D.Camera) {
    return [this.cellToWorldX(cellX, originX, camera), this.cellToWorldY(cellY, originY, camera)] as [number, number];
  }

  /**
   * Check that specified glyph cell coordinates are within the glyphmap's
   * bounds.
   * @param x Glyph cell X-coordinate.
   * @param y Glyph cell Y-coordinate.
   * @returns True if in bounds, false otherwise.
   */
  checkBounds(x: number, y: number) {
    return x >= 0 && x < this.widthInCells && y >= 0 && y < this.heightInCells;
  }

  /**
   * Clear all glyph data & textures from the glyphmap.
   * @returns Glyphmap instance for further chaining.
   */
  clear() {
    this.glyphs.clear();
    this.textures.clear();

    return this;
  }

  /**
   * Erase glyphs at specified cell position.
   * @param x
   * @param y
   * @returns Glyphmap instance for further chaining.
   */
  erase(x: number, y: number) {
    const key = Glyphmap.getKey(x, y);

    this.glyphs.delete(key);
    this.textures.delete(key);

    return this;
  }

  /**
   * Destroy glyphmap & resources.
   * @param fromScene (Default: false) Is Game Object is being destroyed by the
   * Scene?
   */
  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
    this.removeGlyphPluginEventListeners();
  }

  /**
   * Draw glyphs at specified cell position. Overwrites any previous glyphs
   * drawn to the same position.
   * @param x Glyph cell X-coordinate.
   * @param y Glyph cell Y-coordinate.
   * @param glyphs Glyphlikes to draw. An empty array is equivalent to erasing
   * the cell.
   * @returns Glyphmap instance for further chaining.
   */
  draw(x: number, y: number, glyphs: GlyphLike[]) {
    if (!this.checkBounds(x, y)) {
      return this;
    }

    if (!glyphs.length) {
      return this.erase(x, y);
    }

    const key = Glyphmap.getKey(x, y);

    const glyphPlugin = this.glyphPlugin;
    const font = this.currentFont;
    const forceSquareRatio = this.currentForceSquareRatio;

    this.glyphs.set(key, createGlyphsBuffer(glyphs));

    this.textures.set(
      key,
      glyphs.map((glyph) => glyphPlugin.getTexture([glyph], font, forceSquareRatio))
    );

    return this;
  }

  /**
   * When a Camera culls the cells in a Glyphmap it does so using its view into
   * the world, building up a rectangle inside which the cells must exist or
   * they will be culled. Sometimes you may need to expand the size of this
   * 'cull rectangle', especially if you plan on rotating the Camera viewing the
   * Glyphmap. Do so by providing the padding values. The values given are in
   * cells, not pixels. So if the cell width was 16px and you set `paddingX` to
   * be 4, it would add 16px x 4 to the cull rectangle (adjusted for scale).
   * @param paddingX (Default: 1) The amount of extra horizontal cells to add to
   * the cull check padding.
   * @param paddingY (Default: 1) The amount of extra vertical cells to add to
   * the cull check padding.
   * @returns Glyphmap instance for further chaining.
   */
  setCullPadding(paddingX = 1, paddingY = 1) {
    this.cullPaddingX = paddingX;
    this.cullPaddingY = paddingY;
    return this;
  }

  /**
   * Set font. Refreshes glyphmap.
   * @param font Font.
   * @returns Glyphmap instance for further chaining.
   */
  setFont(font: Font) {
    this.currentFont = Font.clone(font);
    return this.refresh();
  }

  /**
   * Set force square ratio. Refreshes glyphmap.
   * @param value (Default: true) Force square ratio flag.
   * @returns Glyphmap instance for further chaining.
   */
  setForceSquareRatio(value = true) {
    this.currentForceSquareRatio = value;
    return this.refresh();
  }

  /**
   * Set associated glyph plugin & update event listeners. Refreshes glyphmap.
   * @param plugin Glyph plugin instance.
   * @returns Glyphmap instance for further chaining.
   */
  setGlyphPlugin(plugin: GlyphPlugin) {
    this.removeGlyphPluginEventListeners();
    this.currentGlyphPlugin = plugin;
    return this.refresh().addGlyphPluginEventListeners();
  }

  /**
   * Control if the Cameras should cull cells before rendering.
   * @param value (Default: true) Skip cull flag.
   * @returns Glyphmap instance for further chaining.
   */
  setSkipCull(value = true) {
    this.skipCull = value;
    return this;
  }

  /**
   * Converts from world X-coordinate (pixels) to glyph cell X-coordinate,
   * factoring in the glyphmap's position, scale and scroll.
   * @param worldX World X-coordinate, in pixels.
   * @param snapToFloor (Default: true) Round result down to nearest integer.
   * @param camera (Optional) Camera to use.
   * @returns Cell X-coordinate corresponding to specified world X-coordinate.
   */
  worldToCellX(worldX: number, snapToFloor = true, camera?: Phaser.Cameras.Scene2D.Camera) {
    const cellWidth = this.currentCellWidth * this.scaleX;

    camera = camera || this.scene.cameras.main;

    // Find the world position relative to top left origin, factoring in the
    // camera's horizontal scroll.
    worldX = worldX - (this.getTopLeft().x + camera.scrollX * (1 - this.scrollFactorX));

    const cellX = worldX / cellWidth;

    return snapToFloor ? Math.floor(cellX) : cellX;
  }

  /**
   * Converts from world Y-coordinate (pixels) to glyph cell Y-coordinate,
   * factoring in the glyphmap's position, scale and scroll.
   * @param worldY World Y-coordinate, in pixels.
   * @param snapToFloor (Default: true) Round result down to nearest integer.
   * @param camera (Optional) Camera to use.
   * @returns Cell Y-coordinate corresponding to specified world Y-coordinate.
   */
  worldToCellY(worldY: number, snapToFloor = true, camera?: Phaser.Cameras.Scene2D.Camera) {
    const cellHeight = this.currentCellHeight * this.scaleY;

    camera = camera || this.scene.cameras.main;

    // Find the world position relative to top left origin, factoring in the
    // camera's vertical scroll.
    worldY = worldY - (this.getTopLeft().y + camera.scrollY * (1 - this.scrollFactorY));

    const cellY = worldY / cellHeight;

    return snapToFloor ? Math.floor(cellY) : cellY;
  }

  /**
   * Converts from world X,Y coordinates (pixels) to glyph cell X,Y coordinates,
   * factoring in the glyphmap's position, scale and scroll.
   * @param worldX World X-coordinate, in pixels.
   * @param worldY World Y-coordinate, in pixels.
   * @param snapToFloor (Default: true) Round result down to nearest integer.
   * @param camera (Optional) Camera to use.
   * @returns Cell X,Y coordinates tuple corresponding to specified world X,Y
   * coordinates.
   */
  worldToCellXY(worldX: number, worldY: number, snapToFloor = true, camera?: Phaser.Cameras.Scene2D.Camera) {
    return [this.worldToCellX(worldX, snapToFloor, camera), this.worldToCellY(worldY, snapToFloor, camera)] as [
      number,
      number
    ];
  }

  /**
   * Add glyph plugin event listeners.
   * @returns Glyphmap instance for further chaining.
   */
  private addGlyphPluginEventListeners() {
    if (this.currentGlyphPlugin) {
      this.currentGlyphPlugin
        .on(GlyphPluginEvent.Update, this.glyphPluginUpdateEventListener, this)
        .once(GlyphPluginEvent.Destroy, this.glyphPluginDestroyEventListener, this);
    }

    return this;
  }

  /**
   * When associated glyph plugin is destroyed, glyphmap will attempt to
   * fallback to first glyph plugin found in the plugins manager, refreshing &
   * registering new event listeners.
   * @throws Error if no glyph plugin is found in the plugin manager.
   */
  private glyphPluginDestroyEventListener() {
    if (!this.scene) {
      return;
    }

    this.currentGlyphPlugin = GlyphPlugin.findPlugin(this.scene.plugins);
    this.refresh().addGlyphPluginEventListeners();
  }

  /**
   * When associated glyph plugin emits update event, refresh the glyphmap.
   */
  private glyphPluginUpdateEventListener() {
    this.refresh();
  }

  /**
   * Refresh glyphmap dimensions & textures.
   * @returns Glyphmap instance for further chaining.
   */
  private refresh() {
    return this.updateDimensions().updateTextures();
  }

  /**
   * Remove glyph plugin event listeners.
   * @returns Glyphmap instance for further chaining.
   */
  private removeGlyphPluginEventListeners() {
    if (this.currentGlyphPlugin) {
      this.currentGlyphPlugin
        .off(GlyphPluginEvent.Update, this.glyphPluginUpdateEventListener, this)
        .off(GlyphPluginEvent.Destroy, this.glyphPluginDestroyEventListener, this, true);
    }

    return this;
  }

  /**
   * Update glyphmap dimensions.
   * @returns Glyphmap instance for further chaining.
   */
  private updateDimensions() {
    const [width, height] = this.currentGlyphPlugin.getFrameDimensions(
      this.currentGlyphPlugin.measurementCh,
      this.font,
      this.currentForceSquareRatio
    );

    this.currentCellWidth = width || 1;
    this.currentCellHeight = height || 1;

    return this.setSize(this.widthInCells * this.currentCellWidth, this.heightInCells * this.currentCellHeight);
  }

  /**
   * Update glyphmap textures.
   * @returns Glyphmap instance for further chaining.
   */
  private updateTextures() {
    const font = this.currentFont;
    const forceSquareRatio = this.currentForceSquareRatio;
    const textures = this.textures;

    const getTextureFromBuffer = this.glyphPlugin['getTextureFromBuffer'].bind(
      this.glyphPlugin
    ) as typeof this.glyphPlugin['getTextureFromBuffer'];

    for (const [key, buffer] of this.glyphs) {
      const cellTextures: Phaser.Textures.Texture[] = [];
      const bufferLen = buffer.length;

      for (let ix = 0; ix < bufferLen; ix += bytesPerGlyph) {
        cellTextures.push(getTextureFromBuffer(buffer.subarray(ix, ix + bytesPerGlyph), font, forceSquareRatio));
      }

      textures.set(key, cellTextures);
    }

    return this;
  }
}
