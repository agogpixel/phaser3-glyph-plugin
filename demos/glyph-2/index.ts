import { demoHandlerFactory, getParams } from '../shared';

export default demoHandlerFactory(async (config) => {
  const api = await import(/* webpackChunkName: "phaser-glyph-plugin" */ '../../src');

  const params = getParams();

  const forceSquareRatio = params.square === 'true' ? true : false;

  class Scene extends api.GlyphPlugin.GlyphScene('glyph', class extends Phaser.Scene {}) {
    create() {
      const font = new api.Font(36, 'DejaVu Sans Mono, monospace', 'bolder');

      const glyphmap = this.add.glyphmap(0, 0, 10, 10, font, forceSquareRatio);

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

      const npc = this.add
        .glyph(0, 0, ['@', '#fff', '#0007'], font, forceSquareRatio)
        .setPosition(...glyphmap.cellToWorldXY(4, 4, 0.5, 0.5));

      const npcIdle = this.tweens.add({
        targets: npc,
        scaleX: { value: 1.2, duration: 1000, ease: 'Linear', yoyo: true, repeat: -1 },
        scaleY: { value: 1.1, duration: 1000, ease: 'Linear', yoyo: true, repeat: -1 }
      });

      const p = [4, 4] as [number, number];

      this.time.addEvent({
        loop: true,
        delay: 3000,
        callback: () => {
          npcIdle.pause();

          let moveOk = false;

          do {
            const dx = Phaser.Math.RND.integerInRange(-1, 1);
            const dy = Phaser.Math.RND.integerInRange(-1, 1);

            if (dx === 0 && dy === 0) {
              continue;
            }

            const x = p[0] + dx;

            if (x === 0 || x === glyphmap.widthInCells - 1) {
              continue;
            }

            const y = p[1] + dy;

            if (y === 0 || y === glyphmap.heightInCells - 1) {
              continue;
            }

            moveOk = true;
            p[0] = x;
            p[1] = y;

            const tween = this.tweens.add({
              targets: npc,
              x: {
                value: glyphmap.cellToWorldX(x, 0.5),
                duration: 1000,
                ease: 'Linear'
              },
              y: {
                value: glyphmap.cellToWorldY(y, 0.5),
                duration: 1000,
                ease: 'Linear'
              },
              angle: {
                value: dx * 8,
                duration: 500,
                ease: 'Power1',
                yoyo: true
              },
              onComplete: () => {
                npcIdle.resume();
                tween.remove();
              }
            });
          } while (!moveOk);
        },
        callbackScope: this
      });
    }
  }

  (config.scene as typeof Scene[]).push(Scene);

  new Phaser.Game(config);
});
