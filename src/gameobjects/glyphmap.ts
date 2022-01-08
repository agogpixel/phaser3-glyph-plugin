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
 *
 */
export type GlyphmapFactory = (
  ...args: ConstructorParameters<typeof Glyphmap> extends [unknown, ...infer R] ? R : never
) => Glyphmap;

/**
 *
 */
export type GlyphmapCreator = (config?: GlyphmapConfig, addToScene?: boolean) => Glyphmap;

/**
 *
 */
export interface GlyphmapConfig extends Phaser.Types.GameObjects.GameObjectConfig {
  /**
   *
   */
  width?: number;

  /**
   *
   */
  height?: number;

  /**
   *
   */
  font?: Font;

  /**
   *
   */
  forceSquareRatio?: boolean;

  /**
   *
   */
  pluginKey?: string;
}

/**
 *
 * @param this
 * @param args
 * @returns
 */
export const glyphmapFactory: GlyphmapFactory = function glyphmapFactory(
  this: Phaser.GameObjects.GameObjectFactory,
  ...args
) {
  return this.displayList.add(new Glyphmap(this.scene, ...args)) as Glyphmap;
};

/**
 *
 * @param this
 * @param config
 * @param addToScene
 * @returns
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
 *
 */
const bounds = new Phaser.Geom.Rectangle();

/**
 *
 * @param map
 * @param camera
 * @returns
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
 *
 */
let renderWebGL: (
  renderer: Phaser.Renderer.WebGL.WebGLRenderer,
  src: Glyphmap,
  camera: Phaser.Cameras.Scene2D.Camera
) => void = Phaser.Utils.NOOP;

/**
 *
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
 *
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
   *
   * @param x
   * @param y
   * @returns
   */
  private static getKey(x: number, y: number) {
    return `${x},${y}`;
  }

  /**
   *
   */
  readonly heightInCells: number;

  /**
   *
   */
  readonly widthInCells: number;

  /**
   *
   */
  cullPaddingX = 1;

  /**
   *
   */
  cullPaddingY = 1;

  /**
   *
   */
  skipCull = false;

  /**
   *
   */
  protected readonly renderCanvas = renderCanvas;

  /**
   *
   */
  protected readonly renderWebGL = renderWebGL;

  /**
   *
   */
  private readonly glyphs = new Map<string, Uint8Array>();

  /**
   *
   */
  private readonly textures = new Map<string, Phaser.Textures.Texture[]>();

  /**
   *
   */
  private currentCellHeight: number;

  /**
   *
   */
  private currentCellWidth: number;

  /**
   *
   */
  private currentFont: Font;

  /**
   *
   */
  private currentGlyphPlugin: GlyphPlugin;

  /**
   *
   */
  private currentForceSquareRatio: boolean;

  /**
   *
   */
  get cellWidth() {
    return this.currentCellWidth;
  }

  /**
   *
   */
  get cellHeight() {
    return this.currentCellHeight;
  }

  /**
   *
   */
  get font(): Readonly<Font> {
    return this.currentFont;
  }
  set font(value: Font) {
    this.setFont(value);
  }

  /**
   *
   */
  get forceSquareRatio() {
    return this.currentForceSquareRatio;
  }
  set forceSquareRatio(value: boolean) {
    this.setForceSquareRatio(value);
  }

  /**
   *
   */
  get glyphPlugin() {
    return this.currentGlyphPlugin;
  }
  set glyphPlugin(value: GlyphPlugin) {
    this.setGlyphPlugin(value);
  }

  /**
   *
   * @param scene
   * @param x
   * @param y
   * @param width
   * @param height
   * @param font
   * @param forceSquareRatio
   * @param pluginKey
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
   *
   * @param cellX
   * @param originX
   * @param camera
   * @returns
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
   *
   * @param cellY
   * @param originY
   * @param camera
   * @returns
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
   *
   * @param cellX
   * @param cellY
   * @param originX
   * @param originY
   * @param camera
   * @returns
   */
  cellToWorldXY(cellX: number, cellY: number, originX = 0.5, originY = 0.5, camera?: Phaser.Cameras.Scene2D.Camera) {
    return [this.cellToWorldX(cellX, originX, camera), this.cellToWorldY(cellY, originY, camera)] as [number, number];
  }

  /**
   *
   * @param x
   * @param y
   * @returns
   */
  checkBounds(x: number, y: number) {
    return x >= 0 && x < this.widthInCells && y >= 0 && y < this.heightInCells;
  }

  /**
   *
   * @returns
   */
  clear() {
    this.glyphs.clear();
    this.textures.clear();

    return this;
  }

  /**
   *
   * @param x
   * @param y
   * @returns
   */
  erase(x: number, y: number) {
    const key = Glyphmap.getKey(x, y);

    this.glyphs.delete(key);
    this.textures.delete(key);

    return this;
  }

  /**
   * {@inheritdoc}
   * @param fromScene `True` if this Game Object is being destroyed by the Scene, `false` if not. Default false.
   */
  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
    this.removeGlyphPluginEventListeners();
  }

  /**
   *
   * @param x
   * @param y
   * @param glyphs
   * @returns
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
   *
   * @param paddingX
   * @param paddingY
   * @returns
   */
  setCullPadding(paddingX = 1, paddingY = 1) {
    this.cullPaddingX = paddingX;
    this.cullPaddingY = paddingY;
    return this;
  }

  /**
   *
   * @param font
   * @returns
   */
  setFont(font: Font) {
    this.currentFont = Font.clone(font);
    return this.refresh();
  }

  /**
   *
   * @param value
   * @returns
   */
  setForceSquareRatio(value = true) {
    this.currentForceSquareRatio = value;
    return this.refresh();
  }

  /**
   *
   * @param plugin
   * @returns
   */
  setGlyphPlugin(plugin: GlyphPlugin) {
    this.removeGlyphPluginEventListeners();
    this.currentGlyphPlugin = plugin;
    return this.refresh().addGlyphPluginEventListeners();
  }

  /**
   *
   * @param value
   * @returns
   */
  setSkipCull(value = true) {
    this.skipCull = value;
    return this;
  }

  /**
   *
   * @param worldX
   * @param snapToFloor
   * @param camera
   * @returns
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
   *
   * @param worldY
   * @param snapToFloor
   * @param camera
   * @returns
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

  worldToCellXY(worldX: number, worldY: number, snapToFloor = true, camera?: Phaser.Cameras.Scene2D.Camera) {
    return [this.worldToCellX(worldX, snapToFloor, camera), this.worldToCellY(worldY, snapToFloor, camera)] as [
      number,
      number
    ];
  }

  /**
   *
   * @returns
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
   *
   * @returns
   */
  private glyphPluginDestroyEventListener() {
    if (!this.scene) {
      return;
    }

    this.currentGlyphPlugin = GlyphPlugin.findPlugin(this.scene.plugins);
    this.addGlyphPluginEventListeners();
  }

  /**
   *
   * @returns
   */
  private glyphPluginUpdateEventListener() {
    this.refresh();
  }

  /**
   *
   * @returns
   */
  private refresh() {
    return this.updateDimensions().updateTextures();
  }

  /**
   *
   * @returns
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
   *
   * @returns
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
   *
   * @returns
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
