/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import 'phaser/src/polyfills';

import * as CONST from 'phaser/src/const';
import * as Extend from 'phaser/src/utils/object/Extend';

/**
 * Load the Phaser namespace with global scope.
 */
export async function phaser() {
  let Phaser = {
    Actions: require('phaser/src/actions'),
    Animations: require('phaser/src/animations'),
    BlendModes: require('phaser/src/renderer/BlendModes'),
    Cache: require('phaser/src/cache'),
    Cameras: require('phaser/src/cameras'),
    Core: require('phaser/src/core'),
    Class: require('phaser/src/utils/Class'),
    Create: require('phaser/src/create'),
    Curves: require('phaser/src/curves'),
    Data: require('phaser/src/data'),
    Display: require('phaser/src/display'),
    DOM: require('phaser/src/dom'),
    Events: require('phaser/src/events'),
    FacebookInstantGamesPlugin: typeof PLUGIN_FBINSTANT
      ? (
          await import(
            /* webpackChunkName: "phaser~fbinstant" */ 'phaser/plugins/fbinstant/src/FacebookInstantGamesPlugin'
          )
        ).default
      : undefined,
    Game: require('phaser/src/core/Game'),
    GameObjects: (await import(/* webpackChunkName: "phaser~gameobjects" */ 'phaser/src/gameobjects')).default,
    Geom: require('phaser/src/geom'),
    Input: (await import(/* webpackChunkName: "phaser~input" */ 'phaser/src/input')).default,
    Loader: (await import(/* webpackChunkName: "phaser~loader" */ 'phaser/src/loader')).default,
    Math: require('phaser/src/math'),
    Physics: (await import(/* webpackChunkName: "phaser~physics" */ 'phaser/src/physics')).default,
    Plugins: require('phaser/src/plugins'),
    Renderer: require('phaser/src/renderer'),
    Scale: require('phaser/src/scale'),
    ScaleModes: require('phaser/src/renderer/ScaleModes'),
    Scene: require('phaser/src/scene/Scene'),
    Scenes: require('phaser/src/scene'),
    Sound: typeof FEATURE_SOUND
      ? (await import(/* webpackChunkName: "vendors~phaser~sound" */ 'phaser/src/sound')).default
      : undefined,
    Structs: require('phaser/src/structs'),
    Textures: require('phaser/src/textures'),
    Tilemaps: (await import(/* webpackChunkName: "phaser~tilemaps" */ 'phaser/src/tilemaps')).default,
    Time: require('phaser/src/time'),
    Tweens: require('phaser/src/tweens'),
    Utils: require('phaser/src/utils')
  };

  if (typeof PLUGIN_CAMERA3D) {
    Phaser.Cameras.Sprite3D = (
      await import(/* webpackChunkName: "phaser~cameras~sprite3d" */ 'phaser/plugins/camera3d/src')
    ).default;
    Phaser.GameObjects.Sprite3D = (
      await import(
        /* webpackChunkName: "phaser~gameobjects~sprite3d" */ 'phaser/plugins/camera3d/src/sprite3d/Sprite3D'
      )
    ).default;
    Phaser.GameObjects.Factories.Sprite3D = (
      await import(
        /* webpackChunkName: "phaser~gameobjects~factories~sprite3d" */ 'phaser/plugins/camera3d/src/sprite3d/Sprite3DFactory'
      )
    ).default;
    Phaser.GameObjects.Creators.Sprite3D = (
      await import(
        /* webpackChunkName: "phaser~gameobjects~creators~sprite3d" */ 'phaser/plugins/camera3d/src/sprite3d/Sprite3DCreator'
      )
    ).default;
  }

  Phaser = Extend.default(false, Phaser, CONST);

  global.Phaser = Phaser;

  return Phaser;
}
