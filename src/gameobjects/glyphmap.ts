/**
 * Glyphmap GameObject module.
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

import { ComputedSize } from '@agogpixel/phaser3-ts-utils/mixins/gameobjects/components/computed-size';

import type { GlyphLike } from '../glyph';
import { Glyph } from '../glyph';
import type { GlyphPlugin } from '../plugins';
import type { Font } from '../utils';

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
 * {@link GlyphmapGameObject} factory type.
 */
export type GlyphmapGameObjectFactory = (
  ...args: ConstructorParameters<typeof GlyphmapGameObject> extends [unknown, ...infer R] ? R : never
) => GlyphmapGameObject;

/**
 * {@link GlyphmapGameObject} creator type.
 */
export type GlyphmapGameObjectCreator = (config?: GlyphmapGameObjectConfig, addToScene?: boolean) => GlyphmapGameObject;

/**
 * {@link GlyphmapGameObject} creator configuration.
 */
export interface GlyphmapGameObjectConfig extends GlyphPluginGameObjectConfig {
  /**
   * Width in cells.
   */
  width?: number;

  /**
   * Height in cells.
   */
  height?: number;
}

/**
 * {@link GlyphmapGameObject} factory.
 * @param this [Phaser.GameObjects.GameObjectFactory](https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.GameObjectFactory.html).
 * @param args {@link GlyphmapGameObject} instantiation arguments.
 * @returns A {@link GlyphmapGameObject} instance.
 * @internal
 */
export const glyphmapGameObjectFactory: GlyphmapGameObjectFactory = function glyphmapGameObjectFactory(
  this: Phaser.GameObjects.GameObjectFactory,
  ...args
) {
  return this.displayList.add(new GlyphmapGameObject(this.scene, ...args)) as GlyphmapGameObject;
};

/**
 * {@link GlyphmapGameObject} creator.
 * @param this [Phaser.GameObjects.GameObjectFactory](https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.GameObjectFactory.html).
 * @param config {@link GlyphmapGameObjectConfig}.
 * @param addToScene Add this {@link GlyphmapGameObject} to the [Phaser.Scene](https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html)
 * after creating it? If set this argument overrides the `add` property in the
 * {@link GlyphmapGameObjectConfig}.
 * @returns A {@link GlyphmapGameObject} instance.
 * @internal
 */
export const glyphmapGameObjectCreator: GlyphmapGameObjectCreator = function glyphmapGameObjectCreator(
  this: Phaser.GameObjects.GameObjectCreator,
  config: GlyphmapGameObjectConfig = {},
  addToScene?: boolean
) {
  const glyphmap = new GlyphmapGameObject(
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

////////////////////////////////////////////////////////////////////////////////
// Renderers
////////////////////////////////////////////////////////////////////////////////

/**
 * Used for cull bounds pass.
 * @internal
 */
const bounds = new Phaser.Geom.Rectangle();

/**
 * Get cull bounds to potentially reduce number of cells that require rendering.
 * @param map {@link GlyphmapGameObject} instance.
 * @param camera [Phaser.Cameras.Scene2D.Camera](https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html)
 * instance.
 * @returns Rectangular bounds of {@link GlyphmapGameObject} that should be
 * rendered.
 * @internal
 */
function getCullBounds(map: GlyphmapGameObject, camera: Phaser.Cameras.Scene2D.Camera) {
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
 * {@link GlyphmapGameObject} WebGL renderer.
 * @internal
 */
let renderWebGL: GlyphPluginGameObjectWebGLRenderer<GlyphmapGameObject> = Phaser.Utils.NOOP;

/**
 * {@link GlyphmapGameObject} canvas renderer.
 * @internal
 */
let renderCanvas: GlyphPluginGameObjectCanvasRenderer<GlyphmapGameObject> = Phaser.Utils.NOOP;

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

    const mapData = src['mapData'];
    const glyphset = src['glyphset'];
    const getKey = GlyphmapGameObject['getKey'];

    renderer.pipelines.preBatch(src);

    for (let indexY = cullBoundsY; indexY < cullBoundsEndY; ++indexY) {
      for (let indexX = cullBoundsX; indexX < cullBoundsEndX; ++indexX) {
        const key = getKey(indexX, indexY);

        if (!mapData.has(key)) {
          continue;
        }

        const cellTextureIds = mapData.get(key);
        const cellTextureIdsLen = cellTextureIds.length;

        for (let ix = 0; ix < cellTextureIdsLen; ++ix) {
          const texture = glyphset.get(cellTextureIds[ix]).get().source.glTexture;

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

    const mapData = src['mapData'];
    const glyphset = src['glyphset'];
    const getKey = GlyphmapGameObject['getKey'];

    for (let y = cullBoundsY; y < cullBoundsEndY; ++y) {
      for (let x = cullBoundsX; x < cullBoundsEndX; ++x) {
        const key = getKey(x, y);

        if (!mapData.has(key)) {
          continue;
        }

        ctx.save();
        ctx.translate(x * cellWidth + halfWidth, y * cellHeight + halfHeight);

        const cellTextureIds = mapData.get(key);
        const cellTextureIdsLen = cellTextureIds.length;

        for (let ix = 0; ix < cellTextureIdsLen; ++ix) {
          const sourceImage = glyphset.get(cellTextureIds[ix]).getSourceImage() as HTMLImageElement | HTMLCanvasElement;

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

////////////////////////////////////////////////////////////////////////////////
// GlyphmapGameObject Definition
////////////////////////////////////////////////////////////////////////////////

/**
 * Glyphmap GameObject.
 */
export class GlyphmapGameObject extends ComputedSize(class extends GlyphPluginGameObject {}) {
  /**
   * Get position key from coordinates.
   * @param x X-coordinate.
   * @param y Y-coordinate.
   * @returns String of the form `X,Y`.
   * @internal
   */
  private static getKey(x: number, y: number) {
    return `${x},${y}`;
  }

  /**
   * Height of {@link GlyphmapGameObject} in cells.
   */
  readonly heightInCells: number;

  /**
   * Width of {@link GlyphmapGameObject} in cells.
   */
  readonly widthInCells: number;

  /**
   * The amount of extra cells to add into the cull bounds when calculating its
   * horizontal size.
   * @see {@link Glyphmap.setCullPadding}
   */
  cullPaddingX = 1;

  /**
   * The amount of extra cells to add into the cull bounds when calculating its
   * vertical size.
   * @see {@link Glyphmap.setCullPadding}
   */
  cullPaddingY = 1;

  /**
   * Control if a [Phaser.Cameras.Scene2D.Camera](https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html)
   * should cull cells before rendering them or not.
   * @see {@link Glyphmap.setSkipCull}
   */
  skipCull = false;

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
   * Dynamically track & manage textures in use.
   * @see {@link Glyphset}
   * @internal
   */
  private readonly glyphset = new Glyphset();

  /**
   * Map position key to {@link Glyphset} texture ids.
   * @internal
   */
  private readonly mapData = new Map<string, number[]>();

  /**
   * Track current cell height, in pixels.
   * @internal
   */
  private currentCellHeight: number;

  /**
   * Track current cell width, in pixels.
   * @internal
   */
  private currentCellWidth: number;

  /**
   * Get cell width, in pixels.
   */
  get cellWidth() {
    return this.currentCellWidth;
  }

  /**
   * Get cell height, in pixels.
   */
  get cellHeight() {
    return this.currentCellHeight;
  }

  /**
   * Instantiate {@link GlyphmapGameObject}.
   *
   * @param scene The [Phaser.Scene](https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html)
   * to which this {@link GlyphmapGameObject}.
   * @param x (Default: 0) World X-coordinate.
   * @param y (Default: 0) World Y-coordinate.
   * @param width (Default: 80) Width in cells.
   * @param height (Default: 25) Height in cells.
   * @param font (Default: 'normal normal normal 24px "Lucida Console", Courier, monospace')
   * {@link Font} to use.
   * @param forceSquareRatio (Default: false) Force square cells.
   * @param pluginKey (Optional) {@link GlyphPlugin} key.
   */
  constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    width = 80,
    height = 25,
    font?: Font,
    forceSquareRatio?: boolean,
    pluginKey?: string
  ) {
    super(scene, 'Glyphmap', x, y, font, forceSquareRatio, pluginKey);

    this.widthInCells = Math.floor(width < 0 ? 0 : width);
    this.heightInCells = Math.floor(height < 0 ? 0 : height);

    this.setOrigin(0).refresh();
  }

  /**
   * Converts from cell X-coordinate to world X-coordinate (pixels),
   * factoring in the {@link GlyphmapGameObject}'s position, scale and scroll.
   * @param cellX Cell X-coordinate.
   * @param originX (Default: 0) Cell horizontal origin [0..1].
   * @param camera (Optional) [Phaser.Cameras.Scene2D.Camera](https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html)
   * to use.
   * @returns World X-coordinate corresponding to specified cell X-coordinate.
   */
  cellToWorldX(cellX: number, originX = 0, camera?: Phaser.Cameras.Scene2D.Camera) {
    const cellWidth = this.currentCellWidth * this.scaleX;

    camera = camera || this.scene.cameras.main;

    // Find the world position relative to top left origin, factoring in the
    // camera's horizontal scroll.
    const worldX = this.getTopLeft().x + camera.scrollX * (1 - this.scrollFactorX);

    originX = originX || 0; // Handle null.

    return worldX + cellX * cellWidth + originX * cellWidth;
  }

  /**
   * Converts from cell Y-coordinate to world Y-coordinate (pixels),
   * factoring in the {@link GlyphmapGameObject}'s position, scale and scroll.
   * @param cellY Cell Y-coordinate.
   * @param originY (Default: 0) Cell vertical origin [0..1].
   * @param camera (Optional) [Phaser.Cameras.Scene2D.Camera](https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html)
   * to use.
   * @returns World Y-coordinate corresponding to specified cell Y-coordinate.
   */
  cellToWorldY(cellY: number, originY = 0, camera?: Phaser.Cameras.Scene2D.Camera) {
    const cellHeight = this.currentCellHeight * this.scaleY;

    camera = camera || this.scene.cameras.main;

    // Find the world position relative to top left origin, factoring in the
    // camera's vertical scroll.
    const worldY = this.getTopLeft().y + camera.scrollY * (1 - this.scrollFactorY);

    originY = originY || 0; // Handle null.

    return worldY + cellY * cellHeight + originY * cellHeight;
  }

  /**
   * Converts from cell X,Y coordinates to world X,Y coordinates (pixels),
   * factoring in the {@link GlyphmapGameObject}'s position, scale and scroll.
   * @param cellX Cell X-coordinate.
   * @param cellY Cell Y-coordinate.
   * @param originX (Default: 0) Cell horizontal origin [0..1].
   * @param originY (Default: originX) Cell vertical origin [0..1].
   * @param camera (Optional) [Phaser.Cameras.Scene2D.Camera](https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html)
   * to use.
   * @returns World X,Y coordinates tuple corresponding to specified cell X,Y
   * coordinates.
   */
  cellToWorldXY(cellX: number, cellY: number, originX = 0, originY?: number, camera?: Phaser.Cameras.Scene2D.Camera) {
    originX = originX || 0; // Handle null.
    originY = typeof originY !== 'number' ? originX : originY;

    return [this.cellToWorldX(cellX, originX, camera), this.cellToWorldY(cellY, originY, camera)] as [number, number];
  }

  /**
   * Check that specified cell coordinates are within the
   * {@link GlyphmapGameObject}'s bounds.
   * @param x Cell X-coordinate.
   * @param y Cell Y-coordinate.
   * @returns True if in bounds, false otherwise.
   */
  checkBounds(x: number, y: number) {
    return x >= 0 && x < this.widthInCells && y >= 0 && y < this.heightInCells;
  }

  /**
   * Clear all data & textures from the {@link GlyphmapGameObject}.
   * @returns The {@link GlyphmapGameObject} instance for further chaining.
   */
  clear() {
    this.mapData.clear();
    this.glyphset.clear();
    return this;
  }

  /**
   * Erase data at specified cell position.
   * @param x Cell X-coordinate.
   * @param y Cell Y-coordinate.
   * @returns The {@link GlyphmapGameObject} instance for further chaining.
   */
  erase(x: number, y: number) {
    const key = GlyphmapGameObject.getKey(x, y);

    if (!this.mapData.has(key)) {
      return this;
    }

    this.mapData.get(key).forEach((id) => this.glyphset.remove(id));
    this.mapData.delete(key);

    return this;
  }

  /**
   * Destroy {@link GlyphmapGameObject} & resources.
   * @param fromScene (Default: false) Destroyed by the
   * [Phaser.Scene](https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html)?
   */
  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
  }

  /**
   * Draw to specified cell position. Overwrites any previous data drawn to the
   * same position.
   * @param x Cell X-coordinate.
   * @param y Cell Y-coordinate.
   * @param glyphs {@link GlyphLike} data to draw, in order. An empty array is
   * equivalent to erasing the cell data.
   * @returns The {@link GlyphmapGameObject} instance for further chaining.
   */
  draw(x: number, y: number, glyphs: GlyphLike[]) {
    if (!this.checkBounds(x, y)) {
      return this;
    }

    this.erase(x, y);

    if (!glyphs.length) {
      return this;
    }

    const key = GlyphmapGameObject.getKey(x, y);

    const glyphPlugin = this._currentGlyphPlugin;
    const glyphset = this.glyphset;
    const font = this._currentFont;
    const forceSquareRatio = this._currentForceSquareRatio;

    this.mapData.set(
      key,
      glyphs.map((glyph) => glyphset.add(glyphPlugin.getTexture(glyph, font, forceSquareRatio)))
    );

    return this;
  }

  /**
   * Refresh {@link GlyphmapGameObject}. Updates textures & size.
   * @returns Reference to {@link GlyphmapGameObject} game object for further
   * chaining.
   */
  refresh() {
    super.refresh();
    return this.updateDimensions().updateTextures();
  }

  /**
   * When a [Phaser.Cameras.Scene2D.Camera](https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html)
   * culls the cells in a {@link GlyphmapGameObject} it does so using its view
   * into the world, building up a rectangle inside which the cells must exist
   * or they will be culled. Sometimes you may need to expand the size of this
   * 'cull rectangle', especially if you plan on rotating the
   * [Phaser.Cameras.Scene2D.Camera](https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html)
   * viewing the {@link GlyphmapGameObject}. Do so by providing the padding
   * values. The values given are in cells, not pixels. So if the cell width was
   * 16px and you set `paddingX` to be 4, it would add 16px x 4 to the cull
   * rectangle (adjusted for scale).
   * @param paddingX (Default: 1) The amount of extra horizontal cells to add to
   * the cull check padding.
   * @param paddingY (Default: 1) The amount of extra vertical cells to add to
   * the cull check padding.
   * @returns The {@link GlyphmapGameObject} instance for further chaining.
   */
  setCullPadding(paddingX = 1, paddingY = 1) {
    this.cullPaddingX = paddingX;
    this.cullPaddingY = paddingY;
    return this;
  }

  /**
   * Control if the [Phaser.Cameras.Scene2D.Camera](https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html)
   * should cull cells before rendering.
   * @param value (Default: true) Skip cull flag.
   * @returns The {@link GlyphmapGameObject} instance for further chaining.
   */
  setSkipCull(value = true) {
    this.skipCull = value;
    return this;
  }

  /**
   * Converts from world X-coordinate (pixels) to cell X-coordinate,
   * factoring in the {@link GlyphmapGameObject}'s position, scale and scroll.
   * @param worldX World X-coordinate, in pixels.
   * @param snapToFloor (Default: true) Round result down to nearest integer.
   * @param camera (Optional) [Phaser.Cameras.Scene2D.Camera](https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html)
   * to use.
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
   * Converts from world Y-coordinate (pixels) to cell Y-coordinate,
   * factoring in the {@link GlyphmapGameObject}'s position, scale and scroll.
   * @param worldY World Y-coordinate, in pixels.
   * @param snapToFloor (Default: true) Round result down to nearest integer.
   * @param camera (Optional) [Phaser.Cameras.Scene2D.Camera](https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html)
   * to use.
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
   * Converts from world X,Y coordinates (pixels) to cell X,Y coordinates,
   * factoring in the {@link GlyphmapGameObject}'s position, scale and scroll.
   * @param worldX World X-coordinate, in pixels.
   * @param worldY World Y-coordinate, in pixels.
   * @param snapToFloor (Default: true) Round result down to nearest integer.
   * @param camera (Optional) [Phaser.Cameras.Scene2D.Camera](https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html)
   * to use.
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
   * Update {@link GlyphmapGameObject} dimensions.
   * @returns The {@link GlyphmapGameObject} instance for further chaining.
   * @internal
   */
  private updateDimensions() {
    const [width, height] = this._currentGlyphPlugin.getFrameDimensions(
      this._currentGlyphPlugin.measurementCodePoint,
      this.font,
      this._currentForceSquareRatio
    );

    this.currentCellWidth = width || 1;
    this.currentCellHeight = height || 1;

    return this.setSize(this.widthInCells * this.currentCellWidth, this.heightInCells * this.currentCellHeight);
  }

  /**
   * Update {@link GlyphmapGameObject} textures.
   * @returns The {@link GlyphmapGameObject} instance for further chaining.
   * @internal
   */
  private updateTextures() {
    this.glyphset.update(this.glyphPlugin, this._currentFont, this._currentForceSquareRatio);
    return this;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Glyphset Definition
////////////////////////////////////////////////////////////////////////////////

/**
 * Manages {@link GlyphmapGameObject} textures.
 * @internal
 */
export class Glyphset {
  /**
   * Map numeric id to [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html).
   */
  private readonly textures = new Map<number, Phaser.Textures.Texture>();

  /**
   * Map hex string to numeric id.
   */
  private readonly texturesIndex = new Map<string, number>();

  /**
   * Track the number of times a numeric id has been added & removed.
   */
  private readonly idCounts = new Map<number, number>();

  /**
   * Current id count.
   */
  private idCount = 0;

  /**
   * Add texture to {@link Glyphset}. If duplicate, id is maintained and count
   * is increased.
   * @param texture [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * generated by a glyph plugin.
   * @returns The numeric id of this [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * in the {@link Glyphset}.
   */
  add(texture: Phaser.Textures.Texture) {
    const hex = Glyph.readHexStringFromTexture(texture);

    if (this.texturesIndex.has(hex)) {
      const id = this.texturesIndex.get(hex);
      this.idCounts.set(id, this.idCounts.get(id) + 1);
      return id;
    }

    const id = ++this.idCount;

    this.textures.set(id, texture);
    this.texturesIndex.set(hex, id);

    if (!this.idCounts.has(id)) {
      this.idCounts.set(id, 0);
    }

    this.idCounts.set(id, this.idCounts.get(id) + 1);

    return id;
  }

  /**
   * Clear {@link Glyphset} data & state.
   * @returns Reference to {@link Glyphset} for further chaining.
   */
  clear() {
    this.textures.clear();
    this.texturesIndex.clear();
    this.idCounts.clear();
    this.idCount = 0;
    return this;
  }

  /**
   * Get [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * referenced by specified ID.
   * @param id Numeric texture ID.
   * @returns Reference to [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html),
   * if it exists.
   */
  get(id: number) {
    return this.textures.get(id);
  }

  /**
   * Check if [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * reference by specified ID exists in the {@link Glyphset}.
   * @param id Numeric texture ID.
   * @returns Boolean value indicating existence within the {@link Glyphset}.
   */
  has(id: number) {
    return this.textures.has(id);
  }

  /**
   * Remove [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * reference by specified ID from {@link Glyphset}. If this
   * [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)
   * has been duplicated, it is kept and ID count is decreased.
   * @param id Numeric texture ID.
   * @returns Reference to {@link Glyphset} for further chaining.
   */
  remove(id: number) {
    if (!this.textures.has(id)) {
      return this;
    }

    const idCount = this.idCounts.get(id) - 1;

    if (idCount <= 0) {
      const texture = this.textures.get(id);
      const hex = Glyph.readHexStringFromTexture(texture);

      this.textures.delete(id);
      this.texturesIndex.delete(hex);
      this.idCounts.delete(id);
    } else {
      this.idCounts.set(id, idCount);
    }

    return this;
  }

  /**
   * Update [Phaser.Textures.Texture](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.Texture.html)s
   * contained within the {@link Glyphset} on the fly using specified
   * {@link GlyphPlugin}, {@link Font}, & force square ratio combination.
   * @param glyphPlugin {@link GlyphPlugin} to use.
   * @param font {@link Font} to use.
   * @param forceSquareRatio Force square ratio?
   * @returns Reference to {@link Glyphset} for further chaining.
   */
  update(glyphPlugin: GlyphPlugin, font: Font, forceSquareRatio: boolean) {
    const textures = this.textures;

    for (const [key, texture] of textures) {
      const glyph = Glyph.fromTexture(texture);
      textures.set(
        key,
        glyphPlugin.getTexture([glyph.codePoint, glyph.foregroundColor, glyph.backgroundColor], font, forceSquareRatio)
      );
    }

    return this;
  }
}
