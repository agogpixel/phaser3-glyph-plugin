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

    const glyphs = src['glyphs'];
    const getKey = Glyphmap['getGlyphsKey'];
    const getTextureFromBuffer = src.glyphPlugin['getTextureFromBuffer'].bind(
      src.glyphPlugin
    ) as typeof src.glyphPlugin['getTextureFromBuffer'];

    renderer.pipelines.preBatch(src);

    for (let indexY = cullBoundsY; indexY < cullBoundsEndY; ++indexY) {
      for (let indexX = cullBoundsX; indexX < cullBoundsEndX; ++indexX) {
        const glyphsKey = getKey(indexX, indexY);

        if (!glyphs.has(glyphsKey)) {
          continue;
        }

        const buffer = glyphs.get(glyphsKey);
        const bufferLen = buffer.length;

        for (let ix = 0; ix < bufferLen; ix += bytesPerGlyph) {
          const texture = getTextureFromBuffer(buffer.subarray(ix, bytesPerGlyph), src.font, src.forceSquareRatio).get()
            .source.glTexture;

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

    const glyphs = src['glyphs'];
    const getKey = Glyphmap['getGlyphsKey'];
    const getTextureFromBuffer = src.glyphPlugin['getTextureFromBuffer'].bind(
      src.glyphPlugin
    ) as typeof src.glyphPlugin['getTextureFromBuffer'];

    for (let y = cullBoundsY; y < cullBoundsEndY; ++y) {
      for (let x = cullBoundsX; x < cullBoundsEndX; ++x) {
        const glyphsKey = getKey(x, y);

        if (!glyphs.has(glyphsKey)) {
          continue;
        }

        ctx.save();
        ctx.translate(x * cellWidth + halfWidth, y * cellHeight + halfHeight);

        const buffer = glyphs.get(glyphsKey);
        const bufferLen = buffer.length;

        for (let ix = 0; ix < bufferLen; ix += bytesPerGlyph) {
          const sourceImage = getTextureFromBuffer(
            buffer.subarray(ix, bytesPerGlyph),
            src.font,
            src.forceSquareRatio
          ).getSourceImage() as HTMLImageElement | HTMLCanvasElement;

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
  private static getGlyphsKey(x: number, y: number) {
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

    this.setOrigin(0).setPosition(x, y).updateDimensions().initPipeline(undefined);

    this.currentGlyphPlugin
      .on(GlyphPluginEvent.Update, this.updateDimensions, this)
      .once(GlyphPluginEvent.Destroy, this.glyphPluginDestroyEventListener, this);
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
    return this;
  }

  /**
   *
   * @param x
   * @param y
   * @returns
   */
  delete(x: number, y: number) {
    this.glyphs.delete(Glyphmap.getGlyphsKey(x, y));
    return this;
  }

  /**
   *
   * @param x
   * @param y
   * @param glyphs
   * @returns
   */
  set(x: number, y: number, glyphs: GlyphLike[]) {
    if (!this.checkBounds(x, y) || !glyphs.length) {
      return this;
    }

    if (!glyphs.length) {
      return this.delete(x, y);
    }

    this.glyphs.set(Glyphmap.getGlyphsKey(x, y), createGlyphsBuffer(glyphs));

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
    return this.updateDimensions();
  }

  /**
   *
   * @param value
   * @returns
   */
  setForceSquareRatio(value = true) {
    this.currentForceSquareRatio = value;
    return this.updateDimensions();
  }

  /**
   *
   * @param plugin
   * @returns
   */
  setGlyphPlugin(plugin: GlyphPlugin) {
    this.currentGlyphPlugin
      .off(GlyphPluginEvent.Update, this.updateDimensions, this)
      .off(GlyphPluginEvent.Destroy, this.glyphPluginDestroyEventListener, this);

    this.currentGlyphPlugin = plugin
      .on(GlyphPluginEvent.Update, this.updateDimensions, this)
      .once(GlyphPluginEvent.Destroy, this.glyphPluginDestroyEventListener, this);

    return this.updateDimensions();
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
   * @returns
   */
  private glyphPluginDestroyEventListener() {
    if (!this.scene) {
      return;
    }

    this.currentGlyphPlugin = (GlyphPlugin.findPlugin(this.scene.plugins) as GlyphPlugin).on(
      GlyphPluginEvent.Update,
      this.updateDimensions,
      this
    );
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

    this.currentCellWidth = width;
    this.currentCellHeight = height;

    return this.setSize(this.widthInCells * this.currentCellWidth, this.heightInCells * this.currentCellHeight);
  }
}
