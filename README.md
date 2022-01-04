# agogpixel/phaser3-glyph-plugin

Phaser 3 glyph plugin.

## Getting Started

## Usage

## Development

Live development with jest watch mode:

```shell
npm start
```

Live development with demos:

```shell
npm run start:demos
```

Lint files:

```shell
npm run lint      # Report issues.
npm run lint-fix  # Fix issues.
```

Unit test & create coverage report in coverage:

```shell
npm test
```

Build consumable .js, .js.map, & .d.ts files to dist; prepare for further packaging:

```shell
npm run build
```

Smoke test build:

```shell
npm run smoke-test
```

Create package tarball from dist:

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
