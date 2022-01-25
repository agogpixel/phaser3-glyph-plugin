import { GlyphPluginEvent } from './events';
import { GlyphGameObject, GlyphmapGameObject } from './gameobjects';
import type { GlyphLike } from './glyph';
import { defaultAdvancedTextMetrics, defaultMeasurementCodePoint, GlyphPlugin, GlyphPluginState } from './plugins';
import { Font } from './utils';

// Squelch console.log output.
jest.spyOn(console, 'log').mockImplementation(() => undefined);
// Running game calls window.focus method.
jest.spyOn(window, 'focus').mockImplementation(() => undefined);

describe('Plugins Module', () => {
  //////////////////////////////////////////////////////////////////////////////
  // GlyphPlugin
  //////////////////////////////////////////////////////////////////////////////

  describe('GlyphPlugin', () => {
    it('instantiates', () => {
      let game: Phaser.Game;

      const input = new GlyphPlugin(
        new Phaser.Plugins.PluginManager(
          (game = new Phaser.Game({
            type: Phaser.HEADLESS,
            callbacks: {
              postBoot: () => game.loop.stop()
            }
          }))
        )
      );

      const actual = input instanceof GlyphPlugin;
      const expected = true;
      expect(actual).toEqual(expected);

      game.destroy(true);
    });

    it('throws error if init called and plugin is not in an undefined state', () => {
      let game: Phaser.Game;

      const input = {};

      const actual = () => {
        const plugin = new GlyphPlugin(
          new Phaser.Plugins.PluginManager(
            (game = new Phaser.Game({
              type: Phaser.HEADLESS,
              callbacks: {
                postBoot: () => game.loop.stop()
              }
            }))
          )
        );

        plugin['currentState'] = GlyphPluginState.Started;
        plugin.init(input);
      };

      const expected = `Current state invalid: ${GlyphPluginState.Started}; expected undefined`;
      expect(actual).toThrow(expected);

      game.destroy(true);
    });

    it(`throws error if start called and plugin is not in ${GlyphPluginState.Initialized} or ${GlyphPluginState.Stopped} state`, () => {
      let game: Phaser.Game;

      const input = [] as const;

      const actual = () => {
        const plugin = new GlyphPlugin(
          new Phaser.Plugins.PluginManager(
            (game = new Phaser.Game({
              type: Phaser.HEADLESS,
              callbacks: {
                postBoot: () => game.loop.stop()
              }
            }))
          )
        );

        plugin['currentState'] = GlyphPluginState.Started;
        plugin.start(...input);
      };

      const expected = `Current state invalid: ${GlyphPluginState.Started}; expected ${GlyphPluginState.Initialized} or ${GlyphPluginState.Stopped}`;
      expect(actual).toThrow(expected);

      game.destroy(true);
    });

    it(`throws error if stop called and plugin is not in ${GlyphPluginState.Started} state`, () => {
      let game: Phaser.Game;

      const input = [] as const;

      const actual = () => {
        const plugin = new GlyphPlugin(
          new Phaser.Plugins.PluginManager(
            (game = new Phaser.Game({
              type: Phaser.HEADLESS,
              callbacks: {
                postBoot: () => game.loop.stop()
              }
            }))
          )
        );

        plugin['currentState'] = GlyphPluginState.Stopped;
        plugin.stop(...input);
      };

      const expected = `Current state invalid: ${GlyphPluginState.Stopped}; expected ${GlyphPluginState.Started}`;
      expect(actual).toThrow(expected);

      game.destroy(true);
    });

    it(`throws error if stop called and plugin is not in ${GlyphPluginState.Started} state`, () => {
      let game: Phaser.Game;

      const input = [] as const;

      const actual = () => {
        const plugin = new GlyphPlugin(
          new Phaser.Plugins.PluginManager(
            (game = new Phaser.Game({
              type: Phaser.HEADLESS,
              callbacks: {
                postBoot: () => game.loop.stop()
              }
            }))
          )
        );

        plugin['currentState'] = GlyphPluginState.Stopped;
        plugin.stop(...input);
      };

      const expected = `Current state invalid: ${GlyphPluginState.Stopped}; expected ${GlyphPluginState.Started}`;
      expect(actual).toThrow(expected);

      game.destroy(true);
    });

    it('allows one time update event listener', () => {
      let count = 0;
      let game: Phaser.Game;

      const input = [GlyphPluginEvent.Update, () => ++count] as const;

      const actual = (() => {
        const plugin = new GlyphPlugin(
          new Phaser.Plugins.PluginManager(
            (game = new Phaser.Game({
              type: Phaser.HEADLESS,
              callbacks: {
                postBoot: () => game.loop.stop()
              }
            }))
          )
        );

        plugin['currentState'] = GlyphPluginState.Started;
        plugin
          .once(...input)
          .setAdvancedTextMetrics()
          .setAdvancedTextMetrics(false);

        return count;
      })();

      const expected = 1;
      expect(actual).toEqual(expected);

      game.destroy(true);
    });

    it('allows one time destroy event listener', () => {
      let count = 0;
      let game: Phaser.Game;

      const input = [GlyphPluginEvent.Destroy, () => ++count] as const;

      const actual = (() => {
        const plugin = new GlyphPlugin(
          new Phaser.Plugins.PluginManager(
            (game = new Phaser.Game({
              type: Phaser.HEADLESS,
              callbacks: {
                postBoot: () => game.loop.stop()
              }
            }))
          )
        );

        plugin['currentState'] = GlyphPluginState.Started;
        plugin.once(...input).destroy();

        return count;
      })();

      const expected = 1;
      expect(actual).toEqual(expected);

      game.destroy(true);
    });

    it('can add & remove update event listener', () => {
      let count = 0;
      let game: Phaser.Game;

      const input = [GlyphPluginEvent.Update, () => ++count] as const;

      const actual = (() => {
        const plugin = new GlyphPlugin(
          new Phaser.Plugins.PluginManager(
            (game = new Phaser.Game({
              type: Phaser.HEADLESS,
              callbacks: {
                postBoot: () => game.loop.stop()
              }
            }))
          )
        );

        plugin['currentState'] = GlyphPluginState.Started;

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

      const expected = 3;
      expect(actual).toEqual(expected);

      game.destroy(true);
    });

    it('gets measurementCodePoint', () => {
      let game: Phaser.Game;

      const input = new GlyphPlugin(
        new Phaser.Plugins.PluginManager(
          (game = new Phaser.Game({
            type: Phaser.HEADLESS,
            callbacks: {
              postBoot: () => game.loop.stop()
            }
          }))
        )
      );

      const actual = input.measurementCodePoint;
      const expected = defaultMeasurementCodePoint;
      expect(actual).toEqual(expected);

      game.destroy(true);
    });

    it('sets measurementCodePoint', () => {
      let game: Phaser.Game;

      const input = [
        new GlyphPlugin(
          new Phaser.Plugins.PluginManager(
            (game = new Phaser.Game({
              type: Phaser.HEADLESS,
              callbacks: {
                postBoot: () => game.loop.stop()
              }
            }))
          )
        ),
        'M'
      ] as const;

      const actual = (() => {
        input[0].measurementCodePoint = input[1];
        return input[0].measurementCodePoint;
      })();

      const expected = 0x4d;
      expect(actual).toEqual(expected);

      game.destroy(true);
    });

    it('gets advancedTextMetrics', () => {
      let game: Phaser.Game;

      const input = new GlyphPlugin(
        new Phaser.Plugins.PluginManager(
          (game = new Phaser.Game({
            type: Phaser.HEADLESS,
            callbacks: {
              postBoot: () => game.loop.stop()
            }
          }))
        )
      );

      const actual = input.advancedTextMetrics;
      const expected = defaultAdvancedTextMetrics;
      expect(actual).toEqual(expected);

      game.destroy(true);
    });

    it('sets advancedTextMetrics', () => {
      let game: Phaser.Game;

      const input = [
        new GlyphPlugin(
          new Phaser.Plugins.PluginManager(
            (game = new Phaser.Game({
              type: Phaser.HEADLESS,
              callbacks: {
                postBoot: () => game.loop.stop()
              }
            }))
          )
        ),
        true
      ] as const;

      const actual = (() => {
        input[0].advancedTextMetrics = input[1];
        return input[0].advancedTextMetrics;
      })();

      const expected = true;
      expect(actual).toEqual(expected);

      game.destroy(true);
    });

    it('gets frame dimensions for given charlike & font', () => {
      let game: Phaser.Game;

      const input = ['#', new Font(10, 'monospace')] as const;

      const actual = (() => {
        const spy = jest.spyOn(GlyphPlugin, 'getFrameDimensions');
        new GlyphPlugin(
          new Phaser.Plugins.PluginManager(
            (game = new Phaser.Game({
              type: Phaser.HEADLESS,
              callbacks: {
                postBoot: () => game.loop.stop()
              }
            }))
          )
        ).getFrameDimensions(...input);
        return spy;
      })();

      const expected = 1;
      expect(actual).toHaveBeenCalledTimes(expected);

      game.destroy(true);
    });

    it('gets texture for given glyphlike & font', () => {
      let game: Phaser.Game;

      const input = [['#', '#FFF'] as GlyphLike, new Font(10, 'monospace')] as const;

      const actual = (() => {
        const spy = jest.spyOn(GlyphPlugin, 'getTexture');
        new GlyphPlugin(
          new Phaser.Plugins.PluginManager(
            (game = new Phaser.Game({
              type: Phaser.HEADLESS,
              callbacks: {
                postBoot: () => game.loop.stop()
              }
            }))
          )
        ).getTexture(...input);
        return spy;
      })();

      const expected = 1;
      expect(actual).toHaveBeenCalledTimes(expected);

      game.destroy(true);
    });

    it('gets texture key for given glyphs & font', () => {
      let game: Phaser.Game;

      const input = [['#', '#FFF'] as GlyphLike, new Font(10, 'monospace')] as const;

      const actual = (() => {
        const spy = jest.spyOn(GlyphPlugin, 'getTextureKey');
        new GlyphPlugin(
          new Phaser.Plugins.PluginManager(
            (game = new Phaser.Game({
              type: Phaser.HEADLESS,
              callbacks: {
                postBoot: () => game.loop.stop()
              }
            }))
          )
        ).getTextureKey(...input);
        return spy;
      })();

      const expected = 1;
      expect(actual).toHaveBeenCalledTimes(expected);

      game.destroy(true);
    });

    ////////////////////////////////////////////////////////////////////////////
    // GlyphPlugin Static Methods
    ////////////////////////////////////////////////////////////////////////////

    describe('getFrameDimensions', () => {
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

    describe('getTexture', () => {
      it('is a function', () => {
        const input = GlyphPlugin.getTexture;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('generates texture for provided glyph, font, & measurement data or retrieves from Phaser texture cache', () => {
        let game: Phaser.Game;

        const input = [
          new Phaser.Textures.TextureManager(
            (game = new Phaser.Game({
              type: Phaser.HEADLESS,
              callbacks: {
                postBoot: () => game.loop.stop()
              }
            }))
          ),
          ['#', '#0ffffff4', 0x0f0f0f0f] as GlyphLike,
          new Font(10, 'monospace'),
          'W'
        ] as const;

        const actual = GlyphPlugin.getTexture(...input) instanceof Phaser.Textures.Texture;
        const expected = true;

        expect(actual).toEqual(expected);
        expect(GlyphPlugin.getTexture(...input) instanceof Phaser.Textures.Texture).toEqual(expected);

        game.destroy(true);
      });
    });

    describe('getTextureKey', () => {
      it('is a function', () => {
        const input = GlyphPlugin.getTextureKey;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('returns texture key for provided glyph, font, & measurement data', () => {
        const input = [['#', '#0ffffff4', 0x0f0f0f0f] as GlyphLike, new Font(10, 'monospace'), 'W'] as const;
        const actual = GlyphPlugin.getTextureKey(...input);
        const expected = '0ffffff40f0f0f0f0023 0057 normal normal normal 10px monospace';
        expect(actual).toEqual(expected);
      });

      it('returns texture key for provided glyph, font, & measurement data using force square ratio', () => {
        const input = [['#', '#0ffffff4', 0x0f0f0f0f] as GlyphLike, new Font(10, 'monospace'), 'W', true] as const;
        const actual = GlyphPlugin.getTextureKey(...input);
        const expected = '0ffffff40f0f0f0f0023 0057 normal normal normal 10px monospace square';
        expect(actual).toEqual(expected);
      });

      it('returns texture key for provided glyph, font, & measurement data using advanced text metrics', () => {
        const input = [
          ['#', '#0ffffff4', 0x0f0f0f0f] as GlyphLike,
          new Font(10, 'monospace'),
          'W',
          false,
          true
        ] as const;

        const actual = GlyphPlugin.getTextureKey(...input);
        const expected = '0ffffff40f0f0f0f0023 0057 normal normal normal 10px monospace advanced';
        expect(actual).toEqual(expected);
      });
    });

    describe('Scene Injection', () => {
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
                data: { advancedTextMetrics: true, measurementCodePoint: 'M' }
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

      it('maps to a scene', () => {
        const input = [
          ['glyph', defaultMeasurementCodePoint, defaultAdvancedTextMetrics],
          ['glyph2', 0x4d, true]
        ] as const;

        const actual = input.every(
          ([p, c, a]) =>
            scene[p] instanceof GlyphPlugin && scene[p].measurementCodePoint === c && scene[p].advancedTextMetrics === a
        );

        const expected = true;
        expect(actual).toEqual(expected);
      });

      it('maps a glyph game object factory to a scene', () => {
        const input = scene.add.glyph;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('adds a glyph game object to a scene via its factory', () => {
        const input = [] as const;

        const actual = (() => {
          const glyph = scene.add.glyph(...input);
          const result = scene.children.exists(glyph);
          glyph.destroy();
          return result;
        })();

        const expected = true;
        expect(actual).toEqual(expected);
      });

      it('maps a glyph game object creator to a scene', () => {
        const input = scene.make.glyph;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('makes a glyph game object via creator mapped to scene', () => {
        const input = [{}, false] as const;

        const actual = (() => {
          const glyph = scene.make.glyph(...input);
          const result = !scene.children.exists(glyph) && glyph instanceof GlyphGameObject;
          glyph.destroy();
          return result;
        })();

        const expected = true;
        expect(actual).toEqual(expected);
      });

      it('adds a glyph game object to a scene via its creator', () => {
        const input = [] as const;

        const actual = (() => {
          const glyph = scene.make.glyph(...input);
          const result = scene.children.exists(glyph);
          glyph.destroy();
          return result;
        })();

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
          const result = !scene.children.exists(glyphmap) && glyphmap instanceof GlyphmapGameObject;
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
  });
});
