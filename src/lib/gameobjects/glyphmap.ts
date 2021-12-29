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

import { GlyphPlugin, GlyphPluginEvent } from '../plugins/glyph-plugin';
import type { CharLike } from '../utils/char';
import type { ColorLike } from '../utils/color';
import type { FontArgs } from '../utils/font';
import { Font } from '../utils/font';
import { getGlyphBytes, getGlyphCanvasData, glyphBytesLength } from '../utils/glyph';

const bounds = new Phaser.Geom.Rectangle();

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

declare const WEBGL_RENDERER: unknown;
declare const CANVAS_RENDERER: unknown;

let renderWebGL: (
  renderer: Phaser.Renderer.WebGL.WebGLRenderer,
  src: Glyphmap,
  camera: Phaser.Cameras.Scene2D.Camera
) => void = Phaser.Utils.NOOP;

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

    renderer.pipelines.preBatch(src);

    for (let indexY = cullBoundsY; indexY < cullBoundsEndY; ++indexY) {
      for (let indexX = cullBoundsX; indexX < cullBoundsEndX; ++indexX) {
        const glyphsKey = getKey(indexX, indexY);

        if (!glyphs.has(glyphsKey)) {
          continue;
        }

        const glyphBytes = glyphs.get(glyphsKey);

        for (let ix = 0; ix < glyphBytes.length; ix += glyphBytesLength) {
          const [ch, fg, bg] = getGlyphCanvasData(glyphBytes, ix);
          const texture = src.glyphPlugin.getTexture(ch, fg, bg, ...src.font).get().source.glTexture;
          const textureUnit = pipeline.setTexture2D(texture);
          //const [frameWidth, frameHeight] = src.glyphPlugin.getFrameDimensions(ch, ...src.font);
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
            cellWidth, // frameWidth,
            cellHeight, // frameHeight,
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

    for (let y = cullBoundsY; y < cullBoundsEndY; ++y) {
      for (let x = cullBoundsX; x < cullBoundsEndX; ++x) {
        const glyphsKey = getKey(x, y);

        if (!glyphs.has(glyphsKey)) {
          continue;
        }

        ctx.save();
        ctx.translate(x * cellWidth + halfWidth, y * cellHeight + halfHeight);

        const glyphBytes = glyphs.get(glyphsKey);

        for (let ix = 0; ix < glyphBytes.length; ix += glyphBytesLength) {
          const [ch, fg, bg] = getGlyphCanvasData(glyphBytes, ix);
          const texture = src.glyphPlugin.getTexture(ch, fg, bg, ...src.font);
          //const [srcFrameWidth, srcFrameHeight] = src.glyphPlugin.getFrameDimensions(ch, ...src.font);

          ctx.drawImage(
            texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement,
            0,
            0,
            cellWidth, //srcFrameWidth,
            cellHeight, //srcFrameHeight,
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
  private static getGlyphsKey(x: number, y: number) {
    return `${x},${y}`;
  }

  readonly heightInCells: number;

  readonly widthInCells: number;

  cullPaddingX = 1;

  cullPaddingY = 1;

  skipCull = false;

  protected readonly renderCanvas = renderCanvas;

  protected readonly renderWebGL = renderWebGL;

  private readonly glyphs = new Map<string, Uint8Array>();

  private currentCellHeight: number;

  private currentCellWidth: number;

  private currentFont: Font;

  private currentGlyphPlugin: GlyphPlugin;

  get cellWidth() {
    return this.currentCellWidth;
  }

  get cellHeight() {
    return this.currentCellHeight;
  }

  get font() {
    return this.currentFont.args;
  }

  set font(value: FontArgs) {
    this.setFont(...value);
  }

  get glyphPlugin() {
    return this.currentGlyphPlugin;
  }

  set glyphPlugin(value: GlyphPlugin) {
    this.setGlyphPlugin(value);
  }

  constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    width = 80,
    height = 25,
    fontArgs: FontArgs = [24, 'monospace'],
    pluginKey?: string
  ) {
    super(scene, 'Glyphmap');

    this.currentGlyphPlugin = (
      typeof pluginKey === 'string'
        ? scene.game.plugins.get(pluginKey, true) || GlyphPlugin.findPlugin(scene.plugins)
        : GlyphPlugin.findPlugin(scene.plugins)
    ) as GlyphPlugin;

    this.widthInCells = Math.floor(width < 0 ? 0 : width);
    this.heightInCells = Math.floor(height < 0 ? 0 : height);

    this.currentFont = new Font(...fontArgs);

    this.setOrigin(0).setPosition(x, y).updateDimensions().initPipeline(undefined);

    this.currentGlyphPlugin
      .on(GlyphPluginEvent.MeasurementCh, this.updateDimensions, this)
      .once(GlyphPluginEvent.Destroy, this.glyphPluginDestroyEventListener, this);
  }

  checkBounds(x: number, y: number) {
    return x >= 0 && x < this.widthInCells && y >= 0 && y < this.heightInCells;
  }

  clear() {
    this.glyphs.clear();
    return this;
  }

  delete(x: number, y: number) {
    this.glyphs.delete(Glyphmap.getGlyphsKey(x, y));
  }

  draw(x: number, y: number, glyphs: [CharLike, ColorLike, ColorLike?][]) {
    if (!this.checkBounds(x, y) || !glyphs.length) {
      return this;
    }

    const data = new Uint8Array(glyphs.length * glyphBytesLength);

    for (let ix = 0; ix < glyphs.length; ++ix) {
      data.set(getGlyphBytes(...glyphs[ix]), ix * glyphBytesLength);
    }

    this.glyphs.set(Glyphmap.getGlyphsKey(x, y), data);

    return this;
  }

  setCullPadding(paddingX = 1, paddingY = 1) {
    this.cullPaddingX = paddingX;
    this.cullPaddingY = paddingY;
    return this;
  }

  setFont(...args: FontArgs) {
    this.currentFont = new Font(...args);
    return this.updateDimensions();
  }

  setGlyphPlugin(plugin: GlyphPlugin) {
    this.currentGlyphPlugin
      .off(GlyphPluginEvent.MeasurementCh, this.updateDimensions, this)
      .off(GlyphPluginEvent.Destroy, this.glyphPluginDestroyEventListener, this);

    this.currentGlyphPlugin = plugin
      .on(GlyphPluginEvent.MeasurementCh, this.updateDimensions, this)
      .once(GlyphPluginEvent.Destroy, this.glyphPluginDestroyEventListener, this);

    return this.updateDimensions();
  }

  setSkipCull(value = true) {
    this.skipCull = value;
    return this;
  }

  private glyphPluginDestroyEventListener() {
    if (!this.scene) {
      return;
    }

    this.currentGlyphPlugin = (GlyphPlugin.findPlugin(this.scene.plugins) as GlyphPlugin).on(
      GlyphPluginEvent.MeasurementCh,
      this.updateDimensions,
      this
    );
  }

  private updateDimensions() {
    const [width, height] = this.currentGlyphPlugin.getFrameDimensions(
      this.currentGlyphPlugin.measurementCh,
      ...this.currentFont.args
    );

    this.currentCellWidth = width;
    this.currentCellHeight = height;

    return this.setSize(this.widthInCells * this.currentCellWidth, this.heightInCells * this.currentCellHeight);
  }
}
