import { demoHandlerFactory, getParams } from '../shared';

export default demoHandlerFactory(async (config) => {
  const api = await import(/* webpackChunkName: "phaser-glyph-plugin" */ '../../src');

  const params = getParams();

  const forceSquareRatio = params.square === 'true' ? true : false;

  class Scene extends api.GlyphPlugin.GlyphScene('glyph', class extends Phaser.Scene {}) {
    create() {
      const glyphmap = this.add.glyphmap(0, 0, 10, 10, undefined, forceSquareRatio);

      for (let y = 0; y < glyphmap.heightInCells; ++y) {
        for (let x = 0; x < glyphmap.widthInCells; ++x) {
          if (!y || !x || y === glyphmap.heightInCells - 1 || x === glyphmap.widthInCells - 1) {
            glyphmap.draw(x, y, [['#', '#EEEEEEFE', '#4444']]);
          } else {
            glyphmap.draw(x, y, [['.', '#FFF']]);
          }
        }
      }

      this.cameras.main.centerOn(glyphmap.getCenter().x, glyphmap.getCenter().y);
    }
  }

  (config.scene as typeof Scene[]).push(Scene);

  new Phaser.Game(config);
});
