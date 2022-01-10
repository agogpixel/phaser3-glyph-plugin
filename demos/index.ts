import './styles/styles.scss';

import type { Renderer } from './shared';
import { getParams, renderers } from './shared';

type DemoArgs = [Renderer, string, boolean];

const demos = [
  [
    'glyphmap-1',
    "Display a square 'room' with Glyphmap",
    async (...args: DemoArgs) =>
      (await import(/* webpackChunkName: "demo-glyphmap-1" */ './glyphmap-1')).default(...args)
  ],
  [
    'glyphmap-2',
    'Input handling with Glyphmap',
    async (...args: DemoArgs) =>
      (await import(/* webpackChunkName: "demo-glyphmap-2" */ './glyphmap-2')).default(...args)
  ],
  [
    'glyphmap-3',
    'Dynamic font with Glyphmap',
    async (...args: DemoArgs) =>
      (await import(/* webpackChunkName: "demo-glyphmap-3" */ './glyphmap-3')).default(...args)
  ],
  [
    'glyph-1',
    'Display a Glyph',
    async (...args: DemoArgs) => (await import(/* webpackChunkName: "demo-glyph-1" */ './glyph-1')).default(...args)
  ]
] as const;

function getDemo(name: string) {
  return demos.find(([n]) => n === name);
}

async function run() {
  const params = getParams();

  const demo = getDemo(params.demo);

  if (!demo) {
    indexHandler(params.demo);
    return;
  }

  const renderer = (renderers.includes(params.renderer as Renderer) ? params.renderer : 'auto') as Renderer;
  const measure = typeof params.measure === 'string' && params.measure.length ? params.measure.charAt(0) : 'W';
  const advanced = params.advanced === 'true' ? true : false;

  await demo[2](renderer, measure, advanced);
}

function indexHandler(notFound?: string) {
  const filteredRenderers = renderers.filter((r) => r !== 'auto');

  let html = (notFound ? `<small>Not Found: ${notFound}</small>` : '') + '<h1>Demos</h1><ul>';

  for (const demo of demos) {
    html += '<li><bold>' + demo[1] + '</bold><ul>';

    for (const renderer of filteredRenderers) {
      html +=
        '<li><a href="?demo=' +
        demo[0] +
        '&renderer=' +
        renderer +
        '&measure=W&advanced=false&square=false" target="_blank">' +
        renderer +
        '</a></li>';
    }

    html += '</ul></li>';
  }

  html += '</ul>';

  const div = document.createElement('DIV');

  div.innerHTML = html;

  document.body.appendChild(div);
}

run();
