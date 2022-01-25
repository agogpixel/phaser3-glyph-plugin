import { phaserWebGLRendererMockAdapter } from '../../test/mocks/phaser-webgl-renderer-mock-adapter';

import { GlyphLike } from '../glyph';
import { GlyphPlugin } from '../plugins';

import { GlyphGameObject } from './glyph';

// Squelch console.log output.
jest.spyOn(console, 'log').mockImplementation(() => undefined);
// Running game calls window.focus method.
jest.spyOn(window, 'focus').mockImplementation(() => undefined);

describe('Glyph GameObject Module', () => {
  let game: Phaser.Game;
  let scene: Phaser.Scene;

  afterAll(() => {
    game.destroy(true, true);
    game['runDestroy']();
  });

  beforeAll((done) => {
    game = new Phaser.Game({
      type: Phaser.HEADLESS,
      scene: {
        init: function () {
          scene = this as Phaser.Scene;
          done();
        }
      },
      plugins: {
        global: [{ key: 'GlyphPlugin', plugin: GlyphPlugin, mapping: 'glyph', start: true }]
      },
      callbacks: {
        postBoot: () => game.loop.stop()
      }
    });

    // TODO: Test env issue: Pretend that built-in textures were loaded...
    game.textures.emit(Phaser.Textures.Events.READY);
  });

  it('instantiates (defaults)', () => {
    const input = new GlyphGameObject(scene);
    const actual = input instanceof GlyphGameObject;
    const expected = true;
    expect(actual).toEqual(expected);

    input.destroy();
  });

  it('instantiates', () => {
    const input = new GlyphGameObject(scene, 0, 0, ['#', '#ffff']);
    const actual = input instanceof GlyphGameObject;
    const expected = true;
    expect(actual).toEqual(expected);

    input.destroy();
  });

  it('instantiates with null glyphlike', () => {
    const input = new GlyphGameObject(scene, 0, 0, null);
    const actual = input.glyph;
    const expected = [' ', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'];
    expect(actual).toEqual(expected);

    input.destroy();
  });

  it('gets background color', () => {
    const input = new GlyphGameObject(scene);
    const actual = input.backgroundColor;
    const expected = new Phaser.Display.Color(0, 0, 0, 0);
    expect(actual).toEqual(expected);

    input.destroy();
  });

  it('sets background color', () => {
    const input = '#F37C8903';

    const actual = (() => {
      const glyph = new GlyphGameObject(scene);
      glyph.backgroundColor = input;
      const result = glyph.backgroundColor;
      glyph.destroy();
      return result;
    })();

    const expected = new Phaser.Display.Color(0xf3, 0x7c, 0x89, 0x03);
    expect(actual).toEqual(expected);
  });

  it('gets code point', () => {
    const input = new GlyphGameObject(scene);
    const actual = input.codePoint;
    const expected = 0x20;
    expect(actual).toEqual(expected);

    input.destroy();
  });

  it('sets code point', () => {
    const input = 'e';

    const actual = (() => {
      const glyph = new GlyphGameObject(scene);
      glyph.codePoint = input;
      const result = glyph.codePoint;
      glyph.destroy();
      return result;
    })();

    const expected = 0x65;
    expect(actual).toEqual(expected);
  });

  it('gets foreground color', () => {
    const input = new GlyphGameObject(scene);
    const actual = input.foregroundColor;
    const expected = new Phaser.Display.Color(0, 0, 0, 0);
    expect(actual).toEqual(expected);

    input.destroy();
  });

  it('sets foreground color', () => {
    const input = '#F37C8903';

    const actual = (() => {
      const glyph = new GlyphGameObject(scene);
      glyph.foregroundColor = input;
      const result = glyph.foregroundColor;
      glyph.destroy();
      return result;
    })();

    const expected = new Phaser.Display.Color(0xf3, 0x7c, 0x89, 0x03);
    expect(actual).toEqual(expected);
  });

  it('gets current glyph data', () => {
    const input = new GlyphGameObject(scene);
    const actual = input.glyph;
    const expected = [' ', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'];
    expect(actual).toEqual(expected);

    input.destroy();
  });

  it('sets current glyph data', () => {
    const input = ['#', '#FFF', '#F00A'] as GlyphLike;

    const actual = (() => {
      const glyph = new GlyphGameObject(scene);
      glyph.glyph = input;
      const result = glyph.glyph;
      glyph.destroy();
      return result;
    })();

    const expected = ['#', 'rgb(255, 255, 255)', 'rgba(255, 0, 0, 0.667)'];
    expect(actual).toEqual(expected);
  });

  it('sets texture when glyph data set', () => {
    const input = ['#', '#FFF', '#F00A'] as GlyphLike;

    const actual = (() => {
      const glyph = new GlyphGameObject(scene);
      const spy = jest.spyOn(glyph, 'setTexture');
      glyph.glyph = input;
      glyph.destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('refreshes when current glyph plugin emits an update event', () => {
    const input = { measurementCodePoint: 0x4d };

    const actual = (() => {
      const gameObject = new GlyphGameObject(scene);
      const spy = jest.spyOn(gameObject, 'refresh');
      gameObject.glyphPlugin.setProperties(input);
      gameObject.destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);
  });

  describe('CANVAS_RENDERER', () => {
    it('renders an empty glyph game object (default)', () => {
      const input = [
        new Phaser.Renderer.Canvas.CanvasRenderer(game),
        new GlyphGameObject(scene),
        scene.cameras.main,
        undefined
      ] as const;

      const actual = (() => {
        const spy = jest.spyOn(input[0], 'batchSprite');
        input[1]['renderCanvas'](...input);
        input[1].destroy();
        input[0].destroy();
        return spy;
      })();

      const expected = 1;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });

    it('renders a non-empty glyph game object', () => {
      const input = [
        new Phaser.Renderer.Canvas.CanvasRenderer(game),
        new GlyphGameObject(scene),
        scene.cameras.main,
        undefined
      ] as const;

      const actual = (() => {
        const spy = jest.spyOn(input[0], 'batchSprite');
        input[1].setGlyph(['#', '#fff']);
        input[1]['renderCanvas'](...input);
        input[1].destroy();
        input[0].destroy();
        return spy;
      })();

      const expected = 1;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });
  });

  describe('WEBGL_RENDERER', () => {
    beforeAll(() => phaserWebGLRendererMockAdapter(game));

    it('renders an empty glyph game object (default)', () => {
      const input = [
        new Phaser.Renderer.WebGL.WebGLRenderer(game),
        new GlyphGameObject(scene),
        scene.cameras.main
      ] as const;

      const actual = (() => {
        game.renderer = input[0];
        input[0]['boot']();
        input[1].pipeline = input[0].pipelines.get('MultiPipeline');
        const spy = jest.spyOn(input[1].pipeline, 'batchSprite' as never);
        input[1]['renderWebGL'](...input);
        input[1].destroy();
        return spy;
      })();

      const expected = 1;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });

    it('renders a non-empty glyph game object', () => {
      const input = [
        new Phaser.Renderer.WebGL.WebGLRenderer(game),
        new GlyphGameObject(scene),
        scene.cameras.main
      ] as const;

      const actual = (() => {
        game.renderer = input[0];
        input[0]['boot']();
        input[1].pipeline = input[0].pipelines.get('MultiPipeline');
        const spy = jest.spyOn(input[1].pipeline, 'batchSprite' as never);
        input[1].setGlyph(['#', '#fff']);
        input[1]['renderWebGL'](...input);
        input[1].destroy();
        return spy;
      })();

      const expected = 1;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });
  });
});
