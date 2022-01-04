import 'phaser';

import { Glyphmap, GlyphPlugin } from '@agogpixel/phaser3-glyph-plugin';

describe('Phaser Glyph Plugin', () => {
  // Squelch console.log output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  // Running game calls window.focus method.
  jest.spyOn(window, 'focus').mockImplementation(() => undefined);

  class Scene extends GlyphPlugin.GlyphScene('glyph', class extends Phaser.Scene {}) {}

  let game: Phaser.Game;
  let scene: Scene;

  beforeAll((done) => {
    game = new Phaser.Game({
      type: Phaser.HEADLESS,
      scene: {
        init: function () {
          scene = this as Scene;
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

  afterAll(() => {
    game.destroy(true);
    game['runDestroy']();
  });

  it('maps to a scene', () => {
    const input = [['glyph', 'W', false]] as const;

    const actual = input.every(
      ([p, c, a]) =>
        scene[p] instanceof GlyphPlugin && scene[p].measurementCh === c && scene[p].advancedTextMetrics === a
    );

    const expected = true;

    expect(actual).toEqual(expected);
  });

  it('maps a glyphmap factory to a scene', () => {
    const input = scene.add.glyphmap;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('adds a glyphmap to a scene via its factory', () => {
    const input = [] as const;

    const actual = (() => {
      const glyphmap = scene.add.glyphmap(...input);
      const result = scene.children.exists(glyphmap);
      glyphmap.destroy();
      return result;
    })();

    const expected = true;

    expect(actual).toEqual(expected);
  });

  it('maps a glyphmap creator to a scene', () => {
    const input = scene.make.glyphmap;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('makes a glyphmap via creator mapped to scene', () => {
    const input = [{}, false] as const;

    const actual = (() => {
      const glyphmap = scene.make.glyphmap(...input);
      const result = !scene.children.exists(glyphmap) && glyphmap instanceof Glyphmap;
      glyphmap.destroy();
      return result;
    })();

    const expected = true;

    expect(actual).toEqual(expected);
  });

  it('adds a glyphmap to a scene via its creator', () => {
    const input = [] as const;

    const actual = (() => {
      const glyphmap = scene.make.glyphmap(...input);
      const result = scene.children.exists(glyphmap);
      glyphmap.destroy();
      return result;
    })();

    const expected = true;

    expect(actual).toEqual(expected);
  });
});
