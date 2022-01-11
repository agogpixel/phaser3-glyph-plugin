import type { Glyph } from '../../src';

import { demoHandlerFactory, getParams } from '../shared';

export default demoHandlerFactory(async (config) => {
  const api = await import(/* webpackChunkName: "phaser-glyph-plugin" */ '../../src');

  const params = getParams();

  const forceSquareRatio = params.square === 'true' ? true : false;

  class Scene extends api.GlyphPlugin.GlyphScene('glyph', class extends Phaser.Scene {}) {
    create() {
      const font = new api.Font(36, 'DejaVu Sans Mono, monospace', 'bolder');

      const group = this.add.group({
        classType: api.Glyph,
        maxSize: 16,
        createCallback: (g: Glyph) => {
          g.setForceSquareRatio(forceSquareRatio).setFont(font).glyph = [
            Phaser.Math.RND.integerInRange(32, 126),
            Phaser.Display.Color.RandomRGB(),
            Phaser.Display.Color.RandomRGB()
          ];
        }
      });

      for (let i = 0; i < 16; ++i) {
        group
          .get(Phaser.Math.RND.integerInRange(20, 650), Phaser.Math.RND.integerInRange(20, 650))
          .setActive(true)
          .setVisible(true);
      }
    }
  }

  (config.scene as typeof Scene[]).push(Scene);

  new Phaser.Game(config);
});
