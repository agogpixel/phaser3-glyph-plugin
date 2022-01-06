# agogpixel/phaser3-glyph-plugin

[![Build & Test](https://github.com/agogpixel/phaser3-glyph-plugin/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/agogpixel/phaser3-glyph-plugin/actions/workflows/build-and-test.yml)
[![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/kidthales/8783260504aa23bb1c4dd36f0ba3be01/raw/phaser3-glyph-plugin__heads_main.json)](https://agogpixel.github.io/phaser3-glyph-plugin/coverage)
[![Version](https://img.shields.io/npm/v/@agogpixel/phaser3-glyph-plugin.svg)](https://npmjs.org/package/@agogpixel/phaser3-glyph-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/@agogpixel/phaser3-glyph-plugin.svg)](https://npmjs.org/package/@agogpixel/phaser3-glyph-plugin)
[![License](https://img.shields.io/npm/l/@agogpixel/phaser3-glyph-plugin.svg)](https://github.com/agogpixel/phaser3-glyph-plugin/blob/main/LICENSE)

> ⚠️ **INITIAL DEVELOPMENT** ⚠️

<hr>

Phaser 3 glyph plugin. Inspired by [rot.js](https://ondras.github.io/rot.js/hp/) canvas-based ASCII display.

> 💥 **<a href="https://agogpixel.github.io/phaser3-glyph-plugin/demos/" target="_blank">DEMOS</a>**

## Getting Started

1.  Install the package:

    ```shell
    npm install --save @agogpixel/phaser3-glyph-plugin
    ```

2.  Extend a scene (TypeScript only) with the plugin mapped to the `glyph` property:

    ```typescript
    import { GlyphPlugin } from '@agogpixel/phaser3-glyph-plugin';

    class MyScene extends GlyphPlugin.GlyphScene('glyph', class extends Phaser.Scene {}) {
        create() {
            const glyphmap = this.add.glyphmap(0, 0, 10, 10);

            for (let y = 0; y < glyphmap.heightInCells; ++y) {
                for (let x = 0; x < glyphmap.widthInCells; ++x) {
                    if (!y || !x || y === glyphmap.heightInCells - 1 || x === glyphmap.widthInCells - 1) {
                        glyphmap.set(x, y, [['#', '#EEEEEEFE', '#4444']]);
                    } else {
                        glyphmap.set(x, y, [['.', '#FFF']]);
                    }
                }
            }

            const center = glyphmap.getCenter();
            this.cameras.main.centerOn(center.x, center.y);
        }
    }
    ```

3.  Add the plugin & extended scene to the game config:

    ```typescript
    new Phaser.Game({
        // ...
        plugins: {
            global: [
                {
                    key: 'GlyphPlugin',
                    plugin: GlyphPlugin,
                    mapping: 'glyph',
                    start: true
                }
            ]
        },
        scene: [MyScene]
        // ...
    });
    ```

## Usage

Under initial development. Please refer to the [API docs](https://agogpixel.github.io/phaser3-glyph-plugin/modules/index.html) & [demos](https://agogpixel.github.io/phaser3-glyph-plugin/demos/) for usage examples.

## Development

Live development with `jest` watch mode:

```shell
npm start
```

Live development with demos:

```shell
npm run start-demos
```

Lint files:

```shell
npm run lint      # Report issues.
npm run lint-fix  # Fix issues.
```

Unit test & create coverage report in `coverage/`:

```shell
npm test
```

Build consumable `.js`, `.js.map`, & `.d.ts` files to `dist/`; prepare for further packaging:

```shell
npm run build
```

Smoke test build:

```shell
npm run smoke-test
```

Create package tarball from `dist/`:

```shell
npm run create-tarball               # Development stream.
npm run create-tarball -- --release  # Release stream.
```

Publish package tarball to registry (some assembly required):

```shell
npm run publish-tarball -- NPM
npm run publish-tarball -- GitHub
```

## Package Distribution

Tag for stable release with highest version: `latest`

Development release tag (tracks `main` branch): `next`

Additional distribution tags include:

|                                       Distribution                                       |       Release       |  Pre-Release  |
| :--------------------------------------------------------------------------------------: | :-----------------: | :-----------: |
|       Major versions with highest minor, patch (and possibly pre-release) version.       |     `vX~latest`     |   `vX~next`   |
|       Major, minor versions with highest patch (and possibly pre-release) version.       |    `vX.Y~latest`    |  `vX.Y~next`  |
| Major, minor, patch versions - catch all for releases that don't match any of the above. | ~~`vX.Y.Z~latest`~~ | `vX.Y.Z~next` |

## License

Licensed under the [MIT License](./LICENSE).
