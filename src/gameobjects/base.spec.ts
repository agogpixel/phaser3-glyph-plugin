import { GlyphPlugin } from '../plugins';
import { Font } from '../utils';

import { defaultFont, findGlyphPlugin, GlyphPluginGameObject } from './base';

// Squelch console.log output.
jest.spyOn(console, 'log').mockImplementation(() => undefined);
// Running game calls window.focus method.
jest.spyOn(window, 'focus').mockImplementation(() => undefined);

describe('Base GameObject Module', () => {
  describe('findPlugin', () => {
    it('is a function', () => {
      const input = findGlyphPlugin;
      const actual = typeof input;
      const expected = 'function';
      expect(actual).toEqual(expected);
    });

    it('throws error if no GlyphPlugin found', () => {
      let game: Phaser.Game;

      const input = [
        new Phaser.Plugins.PluginManager(
          (game = new Phaser.Game({
            type: Phaser.HEADLESS,
            callbacks: {
              postBoot: () => game.loop.stop()
            }
          }))
        ),
        'failit'
      ] as const;

      const actual = () => findGlyphPlugin(...input);
      const expected = 'GlyphPlugin instance not found in Phaser pluginManager. Have you started the plugin?';
      expect(actual).toThrow(expected);

      input[0].game.destroy(true);
    });
  });

  describe('GlyphPluginGameObject', () => {
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

    it('instantiates', () => {
      const input = new GlyphPluginGameObject(scene, 'test');
      const actual = input instanceof GlyphPluginGameObject;
      const expected = true;
      expect(actual).toEqual(expected);

      input.destroy();
    });

    it('instantiates with null font', () => {
      const input = new GlyphPluginGameObject(scene, 'test', 0, 0, null);
      const actual = input.font;
      const expected = defaultFont;
      expect(actual).toEqual(expected);

      input.destroy();
    });

    it('gets current font', () => {
      const input = new GlyphPluginGameObject(scene, 'test');
      const actual = input.font;
      const expected = defaultFont;
      expect(actual).toEqual(expected);

      input.destroy();
    });

    it('sets current font', () => {
      const input = new Font(10, 'Arial, sans-serif');

      const actual = (() => {
        const gameObject = new GlyphPluginGameObject(scene, 'test');
        gameObject.font = input;
        const result = gameObject.font;
        gameObject.destroy();
        return result;
      })();

      const expected = input;
      expect(actual).toEqual(expected);
    });

    it('refreshes when font set', () => {
      const input = new Font(10, 'Arial, sans-serif');

      const actual = (() => {
        const gameObject = new GlyphPluginGameObject(scene, 'test');
        const spy = jest.spyOn(gameObject, 'refresh');
        gameObject.font = input;
        gameObject.destroy();
        return spy;
      })();

      const expected = 1;
      expect(actual).toHaveBeenCalledTimes(expected);
    });

    it('gets force square ratio', () => {
      const input = new GlyphPluginGameObject(scene, 'test');
      const actual = input.forceSquareRatio;
      const expected = false;
      expect(actual).toEqual(expected);

      input.destroy();
    });

    it('sets force square ratio (default)', () => {
      const input = undefined;

      const actual = (() => {
        const gameObject = new GlyphPluginGameObject(scene, 'test');
        gameObject.setForceSquareRatio(input);
        const result = gameObject.forceSquareRatio;
        gameObject.destroy();
        return result;
      })();

      const expected = true;
      expect(actual).toEqual(expected);
    });

    it('sets force square ratio', () => {
      const input = true;

      const actual = (() => {
        const gameObject = new GlyphPluginGameObject(scene, 'test');
        gameObject.forceSquareRatio = input;
        const result = gameObject.forceSquareRatio;
        gameObject.destroy();
        return result;
      })();

      const expected = true;
      expect(actual).toEqual(expected);
    });

    it('refreshes when force square ratio set', () => {
      const input = true;

      const actual = (() => {
        const gameObject = new GlyphPluginGameObject(scene, 'test');
        const spy = jest.spyOn(gameObject, 'refresh');
        gameObject.forceSquareRatio = input;
        gameObject.destroy();
        return spy;
      })();

      const expected = 1;
      expect(actual).toHaveBeenCalledTimes(expected);
    });

    it('gets glyph plugin', () => {
      const input = new GlyphPluginGameObject(scene, 'test');
      const actual = input.glyphPlugin;
      const expected = game.plugins.get('GlyphPlugin');

      expect(actual).toEqual(expected);
      input.destroy();
    });

    it('sets glyph plugin', () => {
      const input = new GlyphPlugin(game.plugins);

      const actual = (() => {
        const gameObject = new GlyphPluginGameObject(scene, 'test');
        gameObject.glyphPlugin = input;
        const result = gameObject.glyphPlugin;
        gameObject.destroy();
        return result;
      })();

      const expected = input;
      expect(actual).toEqual(expected);

      input.destroy();
    });

    it('refreshes when glyph plugin set', () => {
      const input = new GlyphPlugin(game.plugins);

      const actual = (() => {
        const gameObject = new GlyphPluginGameObject(scene, 'test');
        const spy = jest.spyOn(gameObject, 'refresh');
        gameObject.glyphPlugin = input;
        gameObject.destroy();
        return spy;
      })();

      const expected = 1;
      expect(actual).toHaveBeenCalledTimes(expected);

      input.destroy();
    });

    it('falls back to first glyph plugin found when current glyph plugin is destroyed', () => {
      const input = new GlyphPlugin(game.plugins);

      const actual = (() => {
        const gameObject = new GlyphPluginGameObject(scene, 'test');
        const spy = jest.spyOn(gameObject, '_glyphPluginDestroyEventListener');
        gameObject.glyphPlugin = input;
        input.destroy();
        gameObject.destroy();
        return spy;
      })();

      const expected = 1;
      expect(actual).toHaveBeenCalledTimes(expected);
    });

    it('refreshes when current glyph plugin emits an update event', () => {
      const input = { measurementCodePoint: 0x4d, advancedTextMetrics: true };

      const actual = (() => {
        const gameObject = new GlyphPluginGameObject(scene, 'test');
        const spy = jest.spyOn(gameObject, 'refresh');
        gameObject.glyphPlugin.setProperties(input);
        gameObject.destroy();
        return spy;
      })();

      const expected = 1;
      expect(actual).toHaveBeenCalledTimes(expected);
    });

    it('refreshes when current glyph plugin emits an update event (value change)', () => {
      const input = { measurementCodePoint: 0x49 };

      const actual = (() => {
        const gameObject = new GlyphPluginGameObject(scene, 'test');
        const spy = jest.spyOn(gameObject, 'refresh');
        gameObject.glyphPlugin.setProperties(input);
        gameObject.destroy();
        return spy;
      })();

      const expected = 1;
      expect(actual).toHaveBeenCalledTimes(expected);
    });

    it('does not refresh when update event data is not set', () => {
      const input = {};

      const actual = (() => {
        const gameObject = new GlyphPluginGameObject(scene, 'test');
        const spy = jest.spyOn(gameObject, 'refresh');
        gameObject.glyphPlugin.setProperties(input);
        gameObject.destroy();
        return spy;
      })();

      const expected = 0;
      expect(actual).toHaveBeenCalledTimes(expected);
    });
  });
});
