import { GlyphPlugin } from './glyph-plugin';

describe('GlyphPlugin', () => {
  let game: Phaser.Game;
  let plugin: GlyphPlugin;

  // Squelch console.log output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  // Running game calls window.focus method.
  jest.spyOn(window, 'focus').mockImplementation(() => undefined);

  afterAll(() => {
    game.destroy(true, true);
    game['runDestroy']();
    delete global.Phaser;
  });

  describe('standalone', () => {
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

    it('instantiates', () => {
      plugin = new GlyphPlugin(game.plugins);
      expect(plugin).toBeTruthy();
      expect(plugin instanceof GlyphPlugin).toEqual(true);
    });
  });

  describe('via game config', () => {
    class Scene extends GlyphPlugin.GlyphScene('glyph', class extends Phaser.Scene {}) {}

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

    it('maps to a scene', () => {
      expect(scene.glyph).toBeTruthy();
      expect(scene.glyph instanceof GlyphPlugin).toEqual(true);
    });

    /*it("maps a game object to a scene's game object factory", () => {
      expect(scene.add.example).toBeTruthy();
      expect(typeof scene.add.example).toEqual('function');
    });

    it("adds a mapped game object via the scene's game object factory", () => {
      const gameObject = scene.add.example(123, 234, {});

      expect(gameObject).toBeTruthy();
      expect(gameObject instanceof ExampleGameObject).toEqual(true);
    });

    it("maps a game object to a scene's game object creator", () => {
      expect(scene.make.example).toBeTruthy();
      expect(typeof scene.make.example).toEqual('function');
    });

    it("makes a mapped game object via the scene's game object creator", () => {
      let gameObject: ExampleGameObject;

      [undefined, {}, { padding: {} }].forEach((config) => {
        gameObject = scene.make.example(config);

        expect(gameObject).toBeTruthy();
        expect(gameObject instanceof ExampleGameObject).toEqual(true);
      });

      gameObject = scene.make.example({}, true);

      expect(gameObject).toBeTruthy();
      expect(gameObject instanceof ExampleGameObject).toEqual(true);
    });

    it('calculates the GCD of two integers via scene mapping', () => {
      const a = 1071;
      const b = 462;
      const expected = 21;

      expect(scene.example.gcd(a, b)).toEqual(expected);
      expect(scene.example.gcd(b, a)).toEqual(expected);
    });*/
  });
});
