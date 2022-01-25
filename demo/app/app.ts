import { GlyphPlugin } from '../../src';

import { Scene } from './scene';
import { getAppStartParams } from './utils';

// Application start parameters are built from the query string and fallback to
// defaults as appropriate.
const appStartParams = getAppStartParams();

/**
 * Encapsulates game initialization and start.
 * @returns A [Phaser.Game](https://photonstorm.github.io/phaser3-docs/Phaser.Game.html) reference.
 */
export async function app() {
  // Initialize game with app start parameters.
  return new Phaser.Game({
    type: appStartParams.type,
    parent: 'body',
    dom: {
      createContainer: true
    },
    scale: {
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600
    },
    plugins: {
      global: [
        {
          key: 'GlyphPlugin',
          plugin: GlyphPlugin,
          mapping: 'glyph',
          start: true,
          data: {
            advancedTextMetrics: appStartParams.advancedTextMetrics,
            measurementCodePoint: appStartParams.measurementCh
          }
        }
      ]
    },
    scene: Scene
  });
}
