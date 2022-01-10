import { demoHandlerFactory, getParams } from '../shared';

export default demoHandlerFactory(async (config) => {
  const api = await import(/* webpackChunkName: "phaser-glyph-plugin" */ '../../src');

  const params = getParams();

  const forceSquareRatio = params.square === 'true' ? true : false;

  class Scene extends api.GlyphPlugin.GlyphScene('glyph', class extends Phaser.Scene {}) {
    create() {
      const glyph = this.add.glyph(0, 0, ['#', '#EEEEEEFE', '#4444'], undefined, forceSquareRatio);

      this.cameras.main.centerOn(glyph.getCenter().x, glyph.getCenter().y);
    }
  }

  (config.scene as typeof Scene[]).push(Scene);

  new Phaser.Game(config);
});
