import { phaserWebGLRendererMockAdapter } from '../../test/mocks/phaser-webgl-renderer-mock-adapter';

import { GlyphPlugin } from '../plugin';
import { Font, GlyphLike } from '../shared';

import { Glyph } from './glyph';

describe('Glyph', () => {
  let game: Phaser.Game;
  let scene: Phaser.Scene;

  // Squelch console.log output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  // Running game calls window.focus method.
  jest.spyOn(window, 'focus').mockImplementation(() => undefined);

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

  it('instantiates', () => {
    const input = new Glyph(scene, 0, 0, ['#', '#ffff']);

    const actual = (() => {
      const result = input instanceof Glyph;
      input.destroy();
      return result;
    })();

    const expected = true;

    expect(actual).toEqual(expected);
  });

  it('gets current font', () => {
    const input = new Glyph(scene);
    const actual = input.font;
    const expected = new Font(24, 'monospace');

    expect(actual).toEqual(expected);
    input.destroy();
  });

  it('sets current font', () => {
    const input = new Font(10, 'Arial, sans-serif');

    const actual = (() => {
      const glyph = new Glyph(scene);
      glyph.font = input;
      const result = glyph.font;
      glyph.destroy();
      return result;
    })();

    const expected = input;

    expect(actual).toEqual(expected);
  });

  it('updates texture when font set', () => {
    const input = new Font(10, 'Arial, sans-serif');

    const actual = (() => {
      const glyph = new Glyph(scene);
      const spy = jest.spyOn(glyph, 'setTexture');
      glyph.font = input;
      glyph.destroy();
      return spy;
    })();

    const expected = 1;

    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('gets force square ratio', () => {
    const input = new Glyph(scene);
    const actual = input.forceSquareRatio;
    const expected = false;

    expect(actual).toEqual(expected);
    input.destroy();
  });

  it('sets force square ratio', () => {
    const input = true;

    const actual = (() => {
      const glyph = new Glyph(scene);
      glyph.forceSquareRatio = input;
      const result = glyph.forceSquareRatio;
      glyph.destroy();
      return result;
    })();

    const expected = input;

    expect(actual).toEqual(expected);
  });

  it('updates texture when force square ratio set', () => {
    const input = true;

    const actual = (() => {
      const glyph = new Glyph(scene);
      const spy = jest.spyOn(glyph, 'setTexture');
      glyph.forceSquareRatio = input;
      glyph.destroy();
      return spy;
    })();

    const expected = 1;

    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('gets glyph plugin', () => {
    const input = new Glyph(scene);
    const actual = input.glyphPlugin;
    const expected = game.plugins.get('GlyphPlugin');

    expect(actual).toEqual(expected);
    input.destroy();
  });

  it('sets glyph plugin', () => {
    const input = new GlyphPlugin(game.plugins);

    const actual = (() => {
      const glyph = new Glyph(scene);
      glyph.glyphPlugin = input;
      const result = glyph.glyphPlugin;
      glyph.destroy();
      return result;
    })();

    const expected = input;

    expect(actual).toEqual(expected);
    input.destroy();
  });

  it('updates texture when glyph plugin set', () => {
    const input = new GlyphPlugin(game.plugins);

    const actual = (() => {
      const glyph = new Glyph(scene);
      const spy = jest.spyOn(glyph, 'setTexture');
      glyph.glyphPlugin = input;
      glyph.destroy();
      return spy;
    })();

    const expected = 1;

    expect(actual).toHaveBeenCalledTimes(expected);
    input.destroy();
  });

  it('gets current glyph data', () => {
    const input = new Glyph(scene);
    const actual = input.glyph;
    const expected = [' ', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'];

    expect(actual).toEqual(expected);
    input.destroy();
  });

  it('sets current glyph data', () => {
    const input = ['#', '#FFF', '#F00A'] as GlyphLike;

    const actual = (() => {
      const glyph = new Glyph(scene);
      glyph.glyph = input;
      const result = glyph.glyph;
      glyph.destroy();
      return result;
    })();

    const expected = ['#', 'rgb(255, 255, 255)', 'rgba(255, 0, 0, 0.667)'];

    expect(actual).toEqual(expected);
  });

  it('updates texture when glyph data set', () => {
    const input = ['#', '#FFF', '#F00A'] as GlyphLike;

    const actual = (() => {
      const glyph = new Glyph(scene);
      const spy = jest.spyOn(glyph, 'setTexture');
      glyph.glyph = input;
      glyph.destroy();
      return spy;
    })();

    const expected = 1;

    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('falls back to first glyph plugin found when current glyph plugin is destroyed', () => {
    const input = new GlyphPlugin(game.plugins);

    const actual = (() => {
      const glyph = new Glyph(scene);
      const spy = jest.spyOn(glyph, 'glyphPluginDestroyEventListener');
      glyph.glyphPlugin = input;
      input.destroy();
      glyph.destroy();
      return spy;
    })();

    const expected = 1;

    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('refreshes when current glyph plugin emits an update event', () => {
    const input = ['M', true, new GlyphPlugin(scene.plugins)] as const;

    const actual = (() => {
      const glyph = new Glyph(scene);
      const spy = jest.spyOn(glyph, 'refresh');
      glyph.glyphPlugin.measurementCh = input[0];
      glyph.glyphPlugin.advancedTextMetrics = input[1];
      glyph.glyphPlugin = input[2];
      glyph.destroy();
      return spy;
    })();

    const expected = 3;

    expect(actual).toHaveBeenCalledTimes(expected);
  });

  describe('CANVAS_RENDERER', () => {
    it('renders an empty glyph (default)', () => {
      const input = [
        new Phaser.Renderer.Canvas.CanvasRenderer(game),
        new Glyph(scene),
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

    it('renders a non-empty glyph', () => {
      const input = [
        new Phaser.Renderer.Canvas.CanvasRenderer(game),
        new Glyph(scene),
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

    it('renders an empty glyph (default)', () => {
      const input = [new Phaser.Renderer.WebGL.WebGLRenderer(game), new Glyph(scene), scene.cameras.main] as const;

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
  });

  it('renders a non-empty glyph', () => {
    const input = [new Phaser.Renderer.WebGL.WebGLRenderer(game), new Glyph(scene), scene.cameras.main] as const;

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
