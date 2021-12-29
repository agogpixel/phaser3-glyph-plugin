import { GlyphPlugin } from '../plugins/glyph-plugin';
import { Glyphmap } from './glyphmap';

describe('Glyphmap', () => {
  let game: Phaser.Game;
  let scene: Phaser.Scene;
  let map: Glyphmap;

  // Squelch console.log output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  // Running game calls window.focus method.
  jest.spyOn(window, 'focus').mockImplementation(() => undefined);

  afterAll(() => {
    game.destroy(true, true);
    game['runDestroy']();
    delete global.Phaser;
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

  afterEach(() => map && map.destroy());

  it('instantiates', () => {
    map = new Glyphmap(scene);
    expect(map).toBeTruthy();
    expect(map instanceof Glyphmap).toEqual(true);
  });
});
