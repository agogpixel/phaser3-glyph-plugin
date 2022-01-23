import { GlyphPlugin } from '../../src';

import { Scene } from './scene';
import { getAppStartParams } from './utils';

const appStartParams = getAppStartParams();

export async function app() {
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
