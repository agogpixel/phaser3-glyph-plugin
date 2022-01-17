import { demoHandlerFactory, getParams } from '../shared';
import type { GlyphmapGameObject } from '../../src';

export default demoHandlerFactory(async (config) => {
  const api = await import(/* webpackChunkName: "phaser-glyph-plugin" */ '../../src');

  const params = getParams();

  const forceSquareRatio = params.square === 'true' ? true : false;

  class Scene extends api.GlyphPlugin.GlyphScene('glyph', class extends Phaser.Scene {}) {
    map: GlyphmapGameObject;

    marker: Phaser.GameObjects.Graphics;

    create() {
      this.map = this.add.glyphmap(333, 47.2, 25, 15, undefined, forceSquareRatio);

      this.marker = this.add.graphics();
      this.marker.lineStyle(2, 0xffff00, 1);
      this.marker.strokeRect(0, 0, this.map.cellWidth * this.map.scaleX, this.map.cellHeight * this.map.scaleY);

      for (let y = 0; y < this.map.heightInCells; ++y) {
        for (let x = 0; x < this.map.widthInCells; ++x) {
          if (!y || !x || y === this.map.heightInCells - 1 || x === this.map.widthInCells - 1) {
            this.map.draw(x, y, [['#', '#EEEEEEFE', '#4444']]);
          } else {
            this.map.draw(x, y, [['.', '#FFF']]);
          }
        }
      }

      this.cameras.main.centerOn(this.map.getCenter().x, this.map.getCenter().y);
    }

    update() {
      const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

      // Rounds down to nearest cell.
      const pointerCellX = this.map.worldToCellX(worldPoint.x);
      const pointerCellY = this.map.worldToCellY(worldPoint.y);

      // Snap to cell coordinates, but in world space.
      this.marker.x = this.map.cellToWorldX(pointerCellX);
      this.marker.y = this.map.cellToWorldY(pointerCellY);

      if (this.input.manager.activePointer.isDown) {
        this.map.draw(pointerCellX, pointerCellY, [
          [Phaser.Math.RND.integerInRange(32, 126), Phaser.Display.Color.RandomRGB(), Phaser.Display.Color.RandomRGB()]
        ]);
      }
    }
  }

  (config.scene as typeof Scene[]).push(Scene);

  new Phaser.Game(config);
});
