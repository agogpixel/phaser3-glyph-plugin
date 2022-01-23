import type { FontStyle, FontVariant, FontWeight } from '../../src/utils';

import { defaultState, State } from './state';

const renderers = ['auto', 'canvas', 'webgl'] as const;
type Renderer = typeof renderers[number];

let appStartParams: Readonly<{
  type: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  fontVariant: FontVariant;
  forceSquareRatio: boolean;
  measurementCh: string;
  advancedTextMetrics: boolean;
  state: State;
}>;

export function getAppStartParams() {
  if (appStartParams) {
    return appStartParams;
  }

  const rawParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());

  const renderer = (renderers.includes(rawParams.renderer as Renderer) ? rawParams.renderer : 'auto') as Renderer;

  const fontSize =
    typeof rawParams.fontSize !== 'string' || !rawParams.fontSize.match(/[1-9][0-9]*/)
      ? 24
      : Phaser.Math.Clamp(parseInt(rawParams.fontSize), 1, 48);

  const fontFamily =
    typeof rawParams.fontFamily !== 'string' ? '"Lucida Console", Courier, monospace' : rawParams.fontFamily;

  const fontWeight = typeof rawParams.fontWeight !== 'string' ? 'normal' : (rawParams.fontWeight as FontWeight);

  const fontStyle = typeof rawParams.fontStyle !== 'string' ? 'normal' : (rawParams.fontStyle as FontStyle);

  const fontVariant = typeof rawParams.fontVariant !== 'string' ? 'normal' : (rawParams.fontVariant as FontVariant);

  const forceSquareRatio =
    typeof rawParams.forceSquareRatio !== 'string' || rawParams.forceSquareRatio !== 'on' ? false : true;

  const measurementCh =
    typeof rawParams.measurementCh !== 'string' || !rawParams.measurementCh.length
      ? 'W'
      : String.fromCodePoint(rawParams.measurementCh.normalize().codePointAt(0));

  const advancedTextMetrics =
    typeof rawParams.advancedTextMetrics !== 'string' || rawParams.advancedTextMetrics !== 'on' ? false : true;

  let state: State = JSON.parse(JSON.stringify(defaultState));

  if (typeof rawParams.state === 'string') {
    try {
      state = decodeState(rawParams.state);
    } catch (e) {
      console.error(e);
      console.warn('Falling back to default state');
    }
  }

  appStartParams = {
    type: renderer === 'auto' ? Phaser.AUTO : renderer === 'canvas' ? Phaser.CANVAS : Phaser.WEBGL,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    fontVariant,
    forceSquareRatio,
    measurementCh,
    advancedTextMetrics,
    state
  } as const;

  return appStartParams;
}

export function encodeState(state: State) {
  return btoa(JSON.stringify(state));
}

export function decodeState(base64: string) {
  const state = JSON.parse(atob(base64)) as State;

  // Sanitation.
  if (
    !state ||
    typeof state !== 'object' ||
    typeof state.turnsCompleted !== 'number' ||
    !Array.isArray(state.ids) ||
    !state.entities ||
    typeof state.entities !== 'object'
  ) {
    throw new Error('Decoded state invalid');
  }

  return state;
}
