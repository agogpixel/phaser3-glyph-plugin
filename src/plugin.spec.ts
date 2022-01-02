import { Glyphmap } from './gameobjects/glyphmap';
import { GlyphPlugin, GlyphPluginEvent } from './plugin';
import type { GlyphLike } from './shared';
import { Font } from './shared';

describe('GlyphPlugin', () => {
  // Squelch console.log output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  // Running game calls window.focus method.
  jest.spyOn(window, 'focus').mockImplementation(() => undefined);

  describe('standalone', () => {
    let game: Phaser.Game;

    beforeAll(() => {
      game = new Phaser.Game({
        type: Phaser.HEADLESS,
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

    it('instantiates', () => {
      const input = new GlyphPlugin(game.plugins);
      const actual = input instanceof GlyphPlugin;
      const expected = true;

      expect(actual).toEqual(expected);
    });

    it('gets measurementCh', () => {
      const input = new GlyphPlugin(game.plugins);
      const actual = input.measurementCh;
      const expected = 'W';

      expect(actual).toEqual(expected);
    });

    it('sets measurementCh', () => {
      const input = [new GlyphPlugin(game.plugins), 'M'] as const;

      const actual = (() => {
        input[0].measurementCh = input[1];
        return input[0].measurementCh;
      })();

      const expected = input[1];

      expect(actual).toEqual(expected);
    });

    it('gets advancedTextMetrics', () => {
      const input = new GlyphPlugin(game.plugins);
      const actual = input.advancedTextMetrics;
      const expected = false;

      expect(actual).toEqual(expected);
    });

    it('sets advancedTextMetrics', () => {
      const input = [new GlyphPlugin(game.plugins), true] as const;

      const actual = (() => {
        input[0].advancedTextMetrics = input[1];
        return input[0].advancedTextMetrics;
      })();

      const expected = input[1];

      expect(actual).toEqual(expected);
    });

    it('gets frame dimensions for given charlike & font (calls getFrameDimensions [static])', () => {
      const input = ['#', new Font(10, 'monospace')] as const;

      const actual = (() => {
        const spy = jest.spyOn(GlyphPlugin, 'getFrameDimensions');
        new GlyphPlugin(game.plugins).getFrameDimensions(...input);
        return spy;
      })();

      const expected = 1;

      expect(actual).toHaveBeenCalledTimes(expected);
    });

    it('gets texture for given glyphs & font (calls getTexture [static])', () => {
      const input = [[['#', '#FFF']] as GlyphLike[], new Font(10, 'monospace')] as const;

      const actual = (() => {
        const spy = jest.spyOn(GlyphPlugin, 'getTexture');
        new GlyphPlugin(game.plugins).getTexture(...input);
        return spy;
      })();

      const expected = 1;

      expect(actual).toHaveBeenCalledTimes(expected);
    });

    it('gets texture key for given glyphs & font (calls getTextureKey [static])', () => {
      const input = [[['#', '#FFF']] as GlyphLike[], new Font(10, 'monospace')] as const;

      const actual = (() => {
        const spy = jest.spyOn(GlyphPlugin, 'getTextureKey');
        new GlyphPlugin(game.plugins).getTextureKey(...input);
        return spy;
      })();

      const expected = 1;

      expect(actual).toHaveBeenCalledTimes(expected);
    });

    it('gets texture for given glyph buffer (protected, calls getTextureFromBuffer [static])', () => {
      const input = [
        new Uint8Array([0x00, 0x23, 0x0f, 0xff, 0xff, 0xf4, 0x0f, 0x0f, 0x0f, 0x0f]),
        new Font(10, 'monospace')
      ] as const;

      const actual = (() => {
        const spy = jest.spyOn(GlyphPlugin, 'getTextureFromBuffer' as never);
        new GlyphPlugin(game.plugins)['getTextureFromBuffer'](...input);
        return spy;
      })();

      const expected = 1;

      expect(actual).toHaveBeenCalledTimes(expected);
    });

    describe('findPlugin [static]', () => {
      it('is a function', () => {
        const input = GlyphPlugin.findPlugin;
        const actual = typeof input;
        const expected = 'function';

        expect(actual).toEqual(expected);
      });

      it('throws an error when plugin instance unavailable', () => {
        const input = [game.plugins, 'failit'] as const;
        const actual = () => GlyphPlugin.findPlugin(...input);
        const expected = 'GlyphPlugin instance not found in Phaser pluginManager. Have you started the plugin?';

        expect(actual).toThrow(expected);
      });
    });

    describe('getFrameDimensions [static]', () => {
      it('is a function', () => {
        const input = GlyphPlugin.getFrameDimensions;
        const actual = typeof input;
        const expected = 'function';

        expect(actual).toEqual(expected);
      });

      it('calculates frame dimensions for given charlike & font, retrieves results from cache', () => {
        const input = ['#', new Font(10, 'monospace')] as const;
        const actual = GlyphPlugin.getFrameDimensions(...input);
        const expected = [1, 10];

        expect(actual).toEqual(expected);
        expect(GlyphPlugin.getFrameDimensions(...input)).toEqual(expected);
      });

      it('calculates frame dimensions for given charlike & font with force square ratio', () => {
        const input = ['#', new Font(10, 'monospace'), true] as const;
        const actual = GlyphPlugin.getFrameDimensions(...input);
        const expected = [10, 10];

        expect(actual).toEqual(expected);
      });

      it('calculates frame dimensions for given charlike & font with advanced text metrics', () => {
        const input = ['#', new Font(10, 'monospace'), false, true] as const;
        const actual = GlyphPlugin.getFrameDimensions(...input);
        const expected = [0, 0];

        expect(actual).toEqual(expected);
      });
    });

    describe('getTexture [static]', () => {
      it('is a function', () => {
        const input = GlyphPlugin.getTexture;
        const actual = typeof input;
        const expected = 'function';

        expect(actual).toEqual(expected);
      });

      it('generates texture for provided glyph, font, & measurement data or retrieves from Phaser texture cache', () => {
        const input = [
          game.textures,
          [
            ['#', '#0ffffff4', 0x0f0f0f0f],
            ['ϴ', 'rgba(15, 15, 15, 0.25)', '#AbC'],
            [' ', '#FFF']
          ] as GlyphLike[],
          new Font(10, 'monospace'),
          'W'
        ] as const;

        const actual = GlyphPlugin.getTexture(...input) instanceof Phaser.Textures.Texture;

        const expected = true;

        expect(actual).toEqual(expected);
        expect(GlyphPlugin.getTexture(...input) instanceof Phaser.Textures.Texture).toEqual(expected);
      });
    });

    describe('getTextureKey [static]', () => {
      it('is a function', () => {
        const input = GlyphPlugin.getTextureKey;
        const actual = typeof input;
        const expected = 'function';

        expect(actual).toEqual(expected);
      });

      it('returns texture key for provided glyph, font, & measurement data', () => {
        const input = [
          [
            ['#', '#0ffffff4', 0x0f0f0f0f],
            ['ϴ', 'rgba(15, 15, 15, 0.25)', '#AbC'],
            [' ', '#FFF']
          ] as GlyphLike[],
          new Font(10, 'monospace'),
          'W'
        ] as const;

        const actual = GlyphPlugin.getTextureKey(...input);

        const expected =
          '0x00230ffffff40f0f0f0f03f40f0f0f40aabbccff0020ffffffff00000000 0x0057 normal normal normal 10px monospace';

        expect(actual).toEqual(expected);
      });

      it('returns texture key for provided glyph, font, & measurement data using force square ratio', () => {
        const input = [
          [
            ['#', '#0ffffff4', 0x0f0f0f0f],
            ['ϴ', 'rgba(15, 15, 15, 0.25)', '#AbC'],
            [' ', '#FFF']
          ] as GlyphLike[],
          new Font(10, 'monospace'),
          'W',
          true
        ] as const;

        const actual = GlyphPlugin.getTextureKey(...input);

        const expected =
          '0x00230ffffff40f0f0f0f03f40f0f0f40aabbccff0020ffffffff00000000 0x0057 normal normal normal 10px monospace square';

        expect(actual).toEqual(expected);
      });

      it('returns texture key for provided glyph, font, & measurement data using advanced text metrics', () => {
        const input = [
          [
            ['#', '#0ffffff4', 0x0f0f0f0f],
            ['ϴ', 'rgba(15, 15, 15, 0.25)', '#AbC'],
            [' ', '#FFF']
          ] as GlyphLike[],
          new Font(10, 'monospace'),
          'W',
          false,
          true
        ] as const;

        const actual = GlyphPlugin.getTextureKey(...input);

        const expected =
          '0x00230ffffff40f0f0f0f03f40f0f0f40aabbccff0020ffffffff00000000 0x0057 normal normal normal 10px monospace advanced';

        expect(actual).toEqual(expected);
      });
    });

    describe('event emitter', () => {
      it('allows one time update event subscription', () => {
        let count = 0;
        const input = [GlyphPluginEvent.Update, () => ++count] as const;

        const actual = (() => {
          const plugin = new GlyphPlugin(game.plugins);

          plugin
            .once(...input)
            .setAdvancedTextMetrics()
            .setAdvancedTextMetrics(false);

          return count;
        })();

        const expected = 1;

        expect(actual).toEqual(expected);
      });

      it('allows one time destroy event subscription', () => {
        let count = 0;
        const input = [GlyphPluginEvent.Destroy, () => ++count] as const;

        const actual = (() => {
          const plugin = new GlyphPlugin(game.plugins);
          plugin.once(...input).destroy();
          return count;
        })();

        const expected = 1;

        expect(actual).toEqual(expected);
      });

      it('can add & remove update event handler', () => {
        let count = 0;
        const input = [GlyphPluginEvent.Update, () => ++count] as const;

        const actual = (() => {
          const plugin = new GlyphPlugin(game.plugins);

          plugin
            .on(...input)
            .setAdvancedTextMetrics()
            .setAdvancedTextMetrics(false);

          plugin.off(...input).setAdvancedTextMetrics();

          plugin
            .on(...input)
            .setAdvancedTextMetrics()
            .setAdvancedTextMetrics(false);

          return count;
        })();

        const expected = 4;

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('via game config', () => {
    class Scene extends GlyphPlugin.GlyphScene(
      'glyph',
      GlyphPlugin.GlyphScene('glyph2', class extends Phaser.Scene {})
    ) {}

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
          global: [
            { key: 'GlyphPlugin', plugin: GlyphPlugin, mapping: 'glyph', start: true },
            {
              key: 'GlyphPlugin2',
              plugin: GlyphPlugin,
              mapping: 'glyph2',
              start: true,
              data: { advancedTextMetrics: true, measurementCh: 'M' }
            }
          ]
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

    describe('findPlugin [static]', () => {
      it('is a function', () => {
        const input = GlyphPlugin.findPlugin;
        const actual = typeof input;
        const expected = 'function';

        expect(actual).toEqual(expected);
      });

      it('returns plugin instance with specified key', () => {
        const input = [game.plugins, 'GlyphPlugin2'] as const;
        const actual = GlyphPlugin.findPlugin(...input);
        const expected = game.plugins.get('GlyphPlugin2') as GlyphPlugin;

        expect(actual).toEqual(expected);
      });

      it('returns first plugin instance found when no key provided', () => {
        const input = [game.plugins] as const;
        const actual = GlyphPlugin.findPlugin(...input);
        const expected = game.plugins.get('GlyphPlugin') as GlyphPlugin;

        expect(actual).toEqual(expected);
      });
    });

    it('maps to a scene', () => {
      const input = [
        ['glyph', 'W', false],
        ['glyph2', 'M', true]
      ] as const;

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
        const ok = scene.children.exists(glyphmap);
        glyphmap.destroy();
        return ok;
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
        const ok = !scene.children.exists(glyphmap) && glyphmap instanceof Glyphmap;
        glyphmap.destroy();
        return ok;
      })();

      const expected = true;

      expect(actual).toEqual(expected);
    });

    it('adds a glyphmap to a scene via its creator', () => {
      const input = [] as const;

      const actual = (() => {
        const glyphmap = scene.make.glyphmap(...input);
        const ok = scene.children.exists(glyphmap);
        glyphmap.destroy();
        return ok;
      })();

      const expected = true;

      expect(actual).toEqual(expected);
    });
  });
});
