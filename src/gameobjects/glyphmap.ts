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

import { ComputedSize } from '@agogpixel/phaser3-ts-utils/mixins/gameobjects/components/computed-size';

import { GlyphPlugin } from '../plugin';
import type { Font } from '../shared';
import { convertHexStringToBuffer, GlyphLike } from '../shared';

import type {
  GlyphPluginGameObjectCanvasRenderer,
  GlyphPluginGameObjectWebGLRenderer
} from './glyph-plugin-gameobject';
import { GlyphPluginGameObject } from './glyph-plugin-gameobject';

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
let renderWebGL: GlyphPluginGameObjectWebGLRenderer<Glyphmap> = Phaser.Utils.NOOP;

/**
 * Glyphmap canvas renderer.
 * @internal
 */
let renderCanvas: GlyphPluginGameObjectCanvasRenderer<Glyphmap> = Phaser.Utils.NOOP;

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
    const getKey = Glyphmap['getKey'];

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
    const getKey = Glyphmap['getKey'];

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

/**
 * Displays glyph data as a grid.
 */
export class Glyphmap extends ComputedSize(class extends GlyphPluginGameObject {}) {
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
   * Refresh glyphmap dimensions & textures.
   * @returns Glyphmap instance for further chaining.
   * @protected
   */
  readonly refresh = () => this.updateDimensions().updateTextures();

  /**
   * Dynamically track & manage glyph textures.
   */
  private readonly glyphset = new Glyphset();

  /**
   * Glyphmap data, mapping position key to glyph texture ids.
   */
  private readonly mapData = new Map<string, number[]>();

  /**
   * Track current glyph cell height, in pixels.
   */
  private currentCellHeight: number;

  /**
   * Track current glyph cell width, in pixels.
   */
  private currentCellWidth: number;

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
   * Instantiate glyphmap game object.
   *
   * @param scene The Scene to which this Game Object belongs.
   * @param x (Default: 0) World X-coordinate.
   * @param y (Default: 0) World Y-coordinate.
   * @param width (Default: 80) Width in glyph cells.
   * @param height (Default: 25) Height in glyph cells.
   * @param font (Optional) Font to use.
   * @param forceSquareRatio (Optional) Force square glyph frames/cells,
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
    this.mapData.clear();
    this.glyphset.clear();
    return this;
  }

  /**
   * Erase glyphs at specified cell position.
   * @param x Cell X-coordinate.
   * @param y Cell Y-coordinate.
   * @returns Glyphmap instance for further chaining.
   */
  erase(x: number, y: number) {
    const key = Glyphmap.getKey(x, y);

    if (!this.mapData.has(key)) {
      return this;
    }

    this.mapData.get(key).forEach((id) => this.glyphset.remove(id));
    this.mapData.delete(key);

    return this;
  }

  /**
   * Destroy glyphmap & resources.
   * @param fromScene (Default: false) Is Game Object is being destroyed by the
   * Scene?
   */
  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
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
    const glyphset = this.glyphset;
    const font = this.currentFont;
    const forceSquareRatio = this.currentForceSquareRatio;

    this.mapData.set(
      key,
      glyphs.map((glyph) => glyphset.add(glyphPlugin.getTexture([glyph], font, forceSquareRatio)))
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
    this.glyphset.update(this.glyphPlugin, this.currentFont, this.currentForceSquareRatio);
    return this;
  }
}

/**
 * Manages glyphmap textures.
 */
export class Glyphset {
  /**
   * Read the first section of glyph texture key (hex string containing ch, fg, & bg data).
   * @param texture Texture generated by a glyph plugin.
   * @returns Hex string containing ch, fg, & bg data.
   */
  private static readMinimalGlyphString(texture: Phaser.Textures.Texture) {
    return texture.key.split(' ')[0] as `0x${string}`;
  }

  /**
   * Map numeric id to texture.
   */
  private readonly textures = new Map<number, Phaser.Textures.Texture>();

  /**
   * Map hex string to numeric id.
   */
  private readonly texturesIndex = new Map<`0x${string}`, number>();

  /**
   * Track the number of times a numeric id has been added & removed.
   */
  private readonly idCounts = new Map<number, number>();

  /**
   * Current id count.
   */
  private idCount = 0;

  /**
   * Add texture to glyphset. If duplicate, id is maintained and count is
   * increased.
   * @param texture Texture generated by a glyph plugin.
   * @returns The numeric id of this texture in the glyphset.
   */
  add(texture: Phaser.Textures.Texture) {
    const hex = Glyphset.readMinimalGlyphString(texture);

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
   * Clear glyphset data & state.
   * @returns Reference to glyphset for further chaining.
   */
  clear() {
    this.textures.clear();
    this.texturesIndex.clear();
    this.idCounts.clear();
    this.idCount = 0;
    return this;
  }

  /**
   * Get texture referenced by specified ID.
   * @param id Numeric texture ID.
   * @returns Reference to texture, if it exists.
   */
  get(id: number) {
    return this.textures.get(id);
  }

  /**
   * Check if texture reference by specified ID exists in the glyphset.
   * @param id Numeric texture ID.
   * @returns Boolean value indicating existence within the glyphset.
   */
  has(id: number) {
    return this.textures.has(id);
  }

  /**
   * Remove texture reference by specified ID from glyphset. If this texture
   * has been duplicated, texture is kept and ID count is decreased.
   * @param id Numeric texture ID.
   * @returns Reference to glyphset for further chaining.
   */
  remove(id: number) {
    if (!this.textures.has(id)) {
      return this;
    }

    const idCount = this.idCounts.get(id) - 1;

    if (idCount <= 0) {
      const texture = this.textures.get(id);
      const hex = Glyphset.readMinimalGlyphString(texture);

      this.textures.delete(id);
      this.texturesIndex.delete(hex);
      this.idCounts.delete(id);
    } else {
      this.idCounts.set(id, idCount);
    }

    return this;
  }

  /**
   * Update textures contained within the glyphset on the fly using specified
   * plugin, font, & force square ratio combination.
   * @param glyphPlugin Glyph plugin to use.
   * @param font Font to use.
   * @param forceSquareRatio Force square ratio?
   * @returns Reference to glyphset for further chaining.
   */
  update(glyphPlugin: GlyphPlugin, font: Font, forceSquareRatio: boolean) {
    const textures = this.textures;

    const getTextureFromBuffer = glyphPlugin['getTextureFromBuffer'].bind(
      glyphPlugin
    ) as typeof glyphPlugin['getTextureFromBuffer'];

    for (const [key, texture] of textures) {
      textures.set(
        key,
        getTextureFromBuffer(convertHexStringToBuffer(Glyphset.readMinimalGlyphString(texture)), font, forceSquareRatio)
      );
    }

    return this;
  }
}
