# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2022-01-10

### Added

-   Glyph game object. Essentially an Image Game Object with glyph data setter/getter and on the fly texture updates. Supports creation via Group.
-   Additional Glyph game object demos.

### Changed

-   Refactor to using an internal base glyph plugin game object class. Supports creation via Group.
-   Add missing erase call in Glyphmap draw method (Glyphset count tracking).

## [0.3.0] - 2022-01-09

### Added

-   Font class included in public API.
-   Glyphmap with dynamic font demo.
-   Glyphset internal class for use in managing textures for Glyphmap - improve Glyphmap refresh performance.

### Changed

-   Glyphmap uses Glyphset internally and in renderers.

### Removed

-   Remove extraneous glyph data from glyphmap instance; use texture keys to reconstitute glyph data when refreshing.

## [0.2.0] - 2022-01-08

### Added

-   Glyphmap provides cellToWorld & worldToCell coordinate translation methods.
-   Glyphmap UI demo.
-   Additional typedoc documentation.

### Changed

-   Glyphmap eagerly generates textures & caches for rendering.
-   Glyphmap set & delete methods are now called draw & erase, respectively.

## [0.1.0] - 2022-01-03

### Added

-   Initial release with on the fly glyph texture generation, glyphmap gameobject, regression tests, & a deployed demo.

[unreleased]: https://github.com/agogpixel/phaser3-glyph-plugin/compare/v0.3.0...HEAD
[0.4.0]: https://github.com/agogpixel/phaser3-glyph-plugin/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/agogpixel/phaser3-glyph-plugin/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/agogpixel/phaser3-glyph-plugin/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/agogpixel/phaser3-glyph-plugin/releases/tag/v0.1.0
