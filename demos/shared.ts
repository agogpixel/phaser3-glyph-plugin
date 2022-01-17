export const renderers = ['auto', 'canvas', 'webgl'] as const;

export type Renderer = typeof renderers[number];

type Demo = (config: Phaser.Types.Core.GameConfig) => void;

export function demoHandlerFactory(demo: Demo) {
  return async function demoHandler(renderer: Renderer, measure: number, advanced: boolean) {
    const { phaserFactory } = await import(/* webpackChunkName: "phaser" */ './phaser');
    await phaserFactory();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GlyphPlugin } = require('../src');

    await demo({
      type: renderer === 'auto' ? Phaser.AUTO : renderer === 'canvas' ? Phaser.CANVAS : Phaser.WEBGL,
      parent: 'body',
      dom: {
        createContainer: false,
        behindCanvas: false,
        pointerEvents: undefined
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
            data: { advancedTextMetrics: advanced, measurementCodePoint: measure }
          }
        ]
      },
      scene: []
    });
  };
}

export function getParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}
