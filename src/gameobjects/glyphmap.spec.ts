import { phaserWebGLRendererMockAdapter } from '../../test/mocks/phaser-webgl-renderer-mock-adapter';

import { GlyphLike } from '../glyph';
import { GlyphPlugin } from '../plugins';
import { Font } from '../utils';

import { defaultFont } from './base';
import { GlyphmapGameObject, Glyphset } from './glyphmap';

// Squelch console.log output.
jest.spyOn(console, 'log').mockImplementation(() => undefined);
// Running game calls window.focus method.
jest.spyOn(window, 'focus').mockImplementation(() => undefined);

describe('Glyphmap GameObject Module', () => {
  let game: Phaser.Game;
  let scene: Phaser.Scene;

  afterAll(() => {
    game.destroy(true, true);
    game['runDestroy']();
  });

  beforeAll((done) => {
    game = new Phaser.Game({
      type: Phaser.HEADLESS,
      scene: {
        init: function () {
          scene = this as Phaser.Scene;
          done();
        }
      },
      plugins: {
        global: [{ key: 'GlyphPlugin', plugin: GlyphPlugin, mapping: 'glyph', start: true }]
      },
      callbacks: {
        postBoot: () => game.loop.stop()
      }
    });

    // TODO: Test env issue: Pretend that built-in textures were loaded...
    game.textures.emit(Phaser.Textures.Events.READY);
  });

  it('instantiates (defaults)', () => {
    const input = new GlyphmapGameObject(scene);
    const actual = input instanceof GlyphmapGameObject;
    const expected = true;
    expect(actual).toEqual(expected);

    input.destroy();
  });

  it('instantiates with null font)', () => {
    const input = new GlyphmapGameObject(scene, 0, 0, 80, 25, null);
    const actual = input.font;
    const expected = defaultFont;
    expect(actual).toEqual(expected);

    input.destroy();
  });

  it('has current cell width accessor (readonly)', () => {
    const input = new GlyphmapGameObject(scene);
    const actual = input.cellWidth;
    const expected = 1;

    expect(actual).toEqual(expected);
    expect(() => ((input.cellWidth as unknown) = 5)).toThrow();

    input.destroy();
  });

  it('has current cell height accessor (readonly)', () => {
    const input = new GlyphmapGameObject(scene);
    const actual = input.cellHeight;
    const expected = 24;

    expect(actual).toEqual(expected);
    expect(() => ((input.cellHeight as unknown) = 2)).toThrow();

    input.destroy();
  });

  it('updates dimensions when font set', () => {
    const input = new Font(10, 'Arial, sans-serif');

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      const spy = jest.spyOn(glyphmap, 'updateDimensions' as never);
      glyphmap.font = input;
      glyphmap.destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('updates textures when font set', () => {
    const input = new Font(10, 'Arial, sans-serif');

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      glyphmap.draw(0, 0, [['Q', '#aaa']]).draw(1, 1, [
        ['R', '#aaa'],
        ['T', '#aaa']
      ]);
      const spy = jest.spyOn(glyphmap['glyphset'], 'update');
      glyphmap.font = input;
      glyphmap.destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('updates dimensions when force square ratio set', () => {
    const input = true;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      const spy = jest.spyOn(glyphmap, 'updateDimensions' as never);
      glyphmap.forceSquareRatio = input;
      glyphmap.destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('updates textures when force square ratio set', () => {
    const input = true;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      glyphmap.draw(0, 0, [['Q', '#aaa']]).draw(1, 1, [
        ['R', '#aaa'],
        ['T', '#aaa']
      ]);
      const spy = jest.spyOn(glyphmap['glyphset'], 'update');
      glyphmap.forceSquareRatio = input;
      glyphmap.destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('updates dimensions when glyph plugin set', () => {
    const input = new GlyphPlugin(game.plugins);

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      const spy = jest.spyOn(glyphmap, 'updateDimensions' as never);
      glyphmap.glyphPlugin = input;
      glyphmap.destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);

    input.destroy();
  });

  it('updates textures when glyph plugin set', () => {
    const input = new GlyphPlugin(game.plugins);

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      glyphmap.draw(0, 0, [['Q', '#aaa']]).draw(1, 1, [
        ['R', '#aaa'],
        ['T', '#aaa']
      ]);
      const spy = jest.spyOn(glyphmap['glyphset'], 'update');
      glyphmap.glyphPlugin = input;
      glyphmap.destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);

    input.destroy();
  });

  it('checks map bounds', () => {
    const input = [
      [-1, 0],
      [80, 0],
      [0, -1],
      [0, 25]
    ] as const;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      const result = input.every(([x, y]) => !glyphmap.checkBounds(x, y));
      glyphmap.destroy();
      return result;
    })();

    const expected = true;
    expect(actual).toEqual(expected);
  });

  it('clears map content', () => {
    const input = new GlyphmapGameObject(scene);

    const actual = (() => {
      const spy = jest.spyOn(input['mapData'], 'clear');
      input.clear().destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('erases map cell', () => {
    const input = [0, 0] as const;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      glyphmap.draw(0, 0, [['#', '#483']]);
      const spy = jest.spyOn(glyphmap['mapData'], 'delete');
      glyphmap.erase(...input).destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('checks bounds when setting map cell', () => {
    const input = [-1, 0, [] as GlyphLike[]] as const;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      const spy = jest.spyOn(glyphmap['mapData'], 'set');
      glyphmap.draw(...input).destroy();
      return spy;
    })();

    const expected = 0;
    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('erases content when setting map cell with empty array of glyphs', () => {
    const input = [0, 0, [] as GlyphLike[]] as const;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      const spy = jest.spyOn(glyphmap, 'erase');
      glyphmap.draw(...input).destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('draws map cell', () => {
    const input = [
      0,
      0,
      [
        ['A', '#fff'],
        ['#', '#efaa', '#0395']
      ] as GlyphLike[]
    ] as const;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      const spy = jest.spyOn(glyphmap['mapData'], 'set');
      glyphmap.draw(...input).destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('sets cull padding', () => {
    const input = [10, 7] as const;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      glyphmap.setCullPadding(...input);
      const result = [glyphmap.cullPaddingX, glyphmap.cullPaddingY];
      glyphmap.destroy();
      return result;
    })();

    const expected = input;
    expect(actual).toEqual(expected);
  });

  it('sets skip cull', () => {
    const input = [true] as const;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      glyphmap.setSkipCull(...input);
      const result = glyphmap.skipCull;
      glyphmap.destroy();
      return result;
    })();

    const expected = true;
    expect(actual).toEqual(expected);
  });

  it('falls back to first glyph plugin found when current glyph plugin is destroyed', () => {
    const input = new GlyphPlugin(game.plugins);

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      const spy = jest.spyOn(glyphmap, '_glyphPluginDestroyEventListener');
      glyphmap.glyphPlugin = input;
      input.destroy();
      glyphmap.destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('refreshes when current glyph plugin emits an update event', () => {
    const input = { measurementCodePoint: 'M', advancedTextMetrics: true };

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene);
      const spy = jest.spyOn(glyphmap, 'refresh');
      glyphmap.glyphPlugin.setProperties(input);
      glyphmap.destroy();
      return spy;
    })();

    const expected = 1;
    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('translates cell X coordinate to world X coordinate', () => {
    const input = [10, 0] as const;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene, 10, 10);
      const result = glyphmap.cellToWorldX(...input);
      glyphmap.destroy();
      return result;
    })();

    // Assumes cell width is 1px in headless.
    const expected = 20;
    expect(actual).toEqual(expected);
  });

  it('translates cell Y coordinate to world Y coordinate', () => {
    const input = [10, 0] as const;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene, 10, 7);
      const result = glyphmap.cellToWorldY(...input);
      glyphmap.destroy();
      return result;
    })();

    // Assumes cell height is 1px in headless.
    const expected = 17;
    expect(actual).toEqual(expected);
  });

  it('translates cell X,Y coordinate to world X,Y coordinate', () => {
    const input = [4, 7, 0, 0] as const;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene, 8, 7);
      const result = glyphmap.cellToWorldXY(...input);
      glyphmap.destroy();
      return result;
    })();

    // Assumes cell width & height is 1px in headless.
    const expected = [12, 14];
    expect(actual).toEqual(expected);
  });

  it('translates world X coordinate to cell X coordinate', () => {
    const input = 12;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene, 10, 10);
      const result = glyphmap.worldToCellX(input);
      glyphmap.destroy();
      return result;
    })();

    // Assumes cell width is 1px in headless.
    const expected = 2;
    expect(actual).toEqual(expected);
  });

  it('translates world X coordinate to cell X coordinate (no snap)', () => {
    const input = [12, false] as const;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene, 10, 10);
      const result = glyphmap.worldToCellX(...input);
      glyphmap.destroy();
      return result;
    })();

    // Assumes cell width is 1px in headless.
    const expected = 2;
    expect(actual).toEqual(expected);
  });

  it('translates world Y coordinate to cell Y coordinate', () => {
    const input = 12;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene, 10, 10);
      const result = glyphmap.worldToCellY(input);
      glyphmap.destroy();
      return result;
    })();

    // Assumes cell height is 1px in headless.
    const expected = 2;
    expect(actual).toEqual(expected);
  });

  it('translates world Y coordinate to cell Y coordinate (no snap)', () => {
    const input = [12, false] as const;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene, 10, 10);
      const result = glyphmap.worldToCellY(...input);
      glyphmap.destroy();
      return result;
    })();

    // Assumes cell height is 1px in headless.
    const expected = 2;
    expect(actual).toEqual(expected);
  });

  it('translates world X,Y coordinate to cell X,Y coordinate', () => {
    const input = [12, 12] as const;

    const actual = (() => {
      const glyphmap = new GlyphmapGameObject(scene, 8, 7);
      const result = glyphmap.worldToCellXY(...input);
      glyphmap.destroy();
      return result;
    })();

    // Assumes cell width & height is 1px in headless.
    const expected = [4, 5];
    expect(actual).toEqual(expected);
  });

  describe('CANVAS_RENDERER', () => {
    it('renders an empty glyphmap', () => {
      const input = [
        new Phaser.Renderer.Canvas.CanvasRenderer(game),
        new GlyphmapGameObject(scene),
        scene.cameras.main,
        undefined
      ] as const;

      const actual = (() => {
        const spy = jest.spyOn(input[0].currentContext, 'drawImage');
        input[1]['renderCanvas'](...input);
        input[1].destroy();
        input[0].destroy();
        return spy;
      })();

      const expected = 0;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });

    it('renders a non-empty glyphmap', () => {
      const input = [
        new Phaser.Renderer.Canvas.CanvasRenderer(game),
        new GlyphmapGameObject(scene),
        scene.cameras.main,
        undefined
      ] as const;

      const actual = (() => {
        const spy = jest.spyOn(input[0].currentContext, 'drawImage');
        input[1].draw(0, 0, [
          ['A', '#fff'],
          ['#', '#efaa', '#0395']
        ]);
        input[1]['renderCanvas'](...input);
        input[1].destroy();
        input[0].destroy();
        return spy;
      })();

      const expected = 2;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });

    it('renders a non-empty glyphmap & skips cull', () => {
      const input = [
        new Phaser.Renderer.Canvas.CanvasRenderer(game),
        new GlyphmapGameObject(scene),
        scene.cameras.main,
        undefined
      ] as const;

      const actual = (() => {
        const spy = jest.spyOn(input[0].currentContext, 'drawImage');
        input[1].skipCull = true;
        input[1].draw(0, 0, [
          ['A', '#fff'],
          ['#', '#efaa', '#0395']
        ]);
        input[1]['renderCanvas'](...input);
        input[1].destroy();
        input[0].destroy();
        return spy;
      })();

      const expected = 2;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });

    it('skips rendering a transparent non-empty glyphmap', () => {
      const input = [
        new Phaser.Renderer.Canvas.CanvasRenderer(game),
        new GlyphmapGameObject(scene),
        scene.cameras.main,
        undefined
      ] as const;

      const actual = (() => {
        const spy = jest.spyOn(input[0].currentContext, 'drawImage');
        input[1].alpha = 0;
        input[1].draw(0, 0, [
          ['A', '#fff'],
          ['#', '#efaa', '#0395']
        ]);
        input[1]['renderCanvas'](...input);
        input[1].destroy();
        input[0].destroy();
        return spy;
      })();

      const expected = 0;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });

    it('skips rendering a non-empty glyphmap out of camera bounds', () => {
      const input = [
        new Phaser.Renderer.Canvas.CanvasRenderer(game),
        new GlyphmapGameObject(scene),
        scene.cameras.main.setPosition(10000, 10000),
        undefined
      ] as const;

      const actual = (() => {
        const spy = jest.spyOn(input[0].currentContext, 'drawImage');
        input[1].alpha = 0;
        input[1].draw(0, 0, [
          ['A', '#fff'],
          ['#', '#efaa', '#0395']
        ]);
        input[1]['renderCanvas'](...input);
        input[1].destroy();
        input[0].destroy();
        return spy;
      })();

      const expected = 0;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });

    it('renders a non-empty glyphmap with parent matrix', () => {
      const input = [
        new Phaser.Renderer.Canvas.CanvasRenderer(game),
        new GlyphmapGameObject(scene),
        scene.cameras.main,
        new Phaser.GameObjects.Components.TransformMatrix()
      ] as const;

      const actual = (() => {
        const spy = jest.spyOn(input[0].currentContext, 'drawImage');
        input[0].antialias = false;
        input[1].draw(0, 0, [
          ['A', '#fff'],
          ['#', '#efaa', '#0395']
        ]);
        input[1]['renderCanvas'](...input);
        input[1].destroy();
        input[0].destroy();
        return spy;
      })();

      const expected = 2;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });
  });

  describe('WEBGL_RENDERER', () => {
    beforeAll(() => phaserWebGLRendererMockAdapter(game));

    it('renders an empty glyphmap', () => {
      const input = [
        new Phaser.Renderer.WebGL.WebGLRenderer(game),
        new GlyphmapGameObject(scene),
        scene.cameras.main
      ] as const;

      const actual = (() => {
        game.renderer = input[0];
        input[0]['boot']();
        input[1].pipeline = input[0].pipelines.get('MultiPipeline');
        const spy = jest.spyOn(input[1].pipeline, 'batchTexture' as never);
        input[1]['renderWebGL'](...input);
        input[1].destroy();
        return spy;
      })();

      const expected = 0;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });

    it('renders a non-empty glyphmap', () => {
      const input = [
        new Phaser.Renderer.WebGL.WebGLRenderer(game),
        new GlyphmapGameObject(scene),
        scene.cameras.main
      ] as const;

      const actual = (() => {
        game.renderer = input[0];
        input[0]['boot']();
        input[1].pipeline = input[0].pipelines.get('MultiPipeline');
        const spy = jest.spyOn(input[1].pipeline, 'batchTexture' as never);
        input[1].draw(0, 0, [
          ['B', '#fff'],
          ['C', '#efaa', '#0395']
        ]);
        input[1]['renderWebGL'](...input);
        input[1].destroy();
        return spy;
      })();

      const expected = 2;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });

    it('renders a non-empty glyphmap & skips cull', () => {
      const input = [
        new Phaser.Renderer.WebGL.WebGLRenderer(game),
        new GlyphmapGameObject(scene),
        scene.cameras.main
      ] as const;

      const actual = (() => {
        game.renderer = input[0];
        input[0]['boot']();
        input[1].skipCull = true;
        input[1].pipeline = input[0].pipelines.get('MultiPipeline');
        const spy = jest.spyOn(input[1].pipeline, 'batchTexture' as never);
        input[1].draw(0, 0, [
          ['B', '#fff'],
          ['C', '#efaa', '#0395']
        ]);
        input[1]['renderWebGL'](...input);
        input[1].destroy();
        return spy;
      })();

      const expected = 2;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });

    it('skips rendering a transparent non-empty glyphmap', () => {
      const input = [
        new Phaser.Renderer.WebGL.WebGLRenderer(game),
        new GlyphmapGameObject(scene),
        scene.cameras.main
      ] as const;

      const actual = (() => {
        game.renderer = input[0];
        input[0]['boot']();
        input[1].alpha = 0;
        input[1].pipeline = input[0].pipelines.get('MultiPipeline');
        const spy = jest.spyOn(input[1].pipeline, 'batchTexture' as never);
        input[1].draw(0, 0, [
          ['B', '#fff'],
          ['C', '#efaa', '#0395']
        ]);
        input[1]['renderWebGL'](...input);
        input[1].destroy();
        return spy;
      })();

      const expected = 0;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });

    it('skips rendering a non-empty glyphmap out of camera bounds', () => {
      const input = [
        new Phaser.Renderer.WebGL.WebGLRenderer(game),
        new GlyphmapGameObject(scene),
        scene.cameras.main.setPosition(10000, 10000)
      ] as const;

      const actual = (() => {
        game.renderer = input[0];
        input[0]['boot']();
        input[1].alpha = 0;
        input[1].pipeline = input[0].pipelines.get('MultiPipeline');
        const spy = jest.spyOn(input[1].pipeline, 'batchTexture' as never);
        input[1].draw(0, 0, [
          ['B', '#fff'],
          ['C', '#efaa', '#0395']
        ]);
        input[1]['renderWebGL'](...input);
        input[1].destroy();
        return spy;
      })();

      const expected = 0;
      expect(actual).toHaveBeenCalledTimes(expected);

      actual.mockReset();
    });
  });

  describe('Glyphset', () => {
    it('instantiates', () => {
      const input = new Glyphset();
      const actual = input instanceof Glyphset;
      const expected = true;

      expect(actual).toEqual(expected);
    });

    it('adds a texture', () => {
      const input = game.textures.createCanvas('0x00000000000000000000');

      const actual = (() => {
        const glyphset = new Glyphset();
        const id = glyphset.add(input);
        input.destroy();
        return id;
      })();

      const expected = 1;

      expect(actual).toEqual(expected);
    });

    it('adds the same texture multiple times, uses same id & tracks count', () => {
      const input = game.textures.createCanvas('0x00000000000000000000');

      const actual = (() => {
        const glyphset = new Glyphset();
        const spy = jest.spyOn(glyphset['idCounts'], 'set');
        glyphset.add(input);
        const id = glyphset.add(input);
        input.destroy();
        return [id, spy];
      })();

      const expected = [1, 3];

      expect(actual[0]).toEqual(expected[0]);
      expect(actual[1]).toHaveBeenCalledTimes(expected[1]);
    });

    it('clears textures', () => {
      const input = game.textures.createCanvas('0x00000000000000000000');

      const actual = (() => {
        const glyphset = new Glyphset();
        const spy = jest.spyOn(glyphset['textures'], 'clear');
        glyphset.add(input);
        glyphset.clear();
        input.destroy();
        return spy;
      })();

      const expected = 1;

      expect(actual).toHaveBeenCalledTimes(expected);
    });

    it('gets texture', () => {
      const input = game.textures.createCanvas('0x00000000000000000000');

      const actual = (() => {
        const glyphset = new Glyphset();
        const id = glyphset.add(input);
        return glyphset.get(id);
      })();

      const expected = input;

      expect(actual).toEqual(expected);
      input.destroy();
    });

    it('checks for texture', () => {
      const input = game.textures.createCanvas('0x00000000000000000000');

      const actual = (() => {
        const glyphset = new Glyphset();
        const results: boolean[] = [];
        results.push(glyphset.has(1));
        glyphset.add(input);
        results.push(glyphset.has(1));
        input.destroy();
        return results;
      })();

      const expected = [false, true];

      expect(actual).toEqual(expected);
    });

    it('does nothing when removing with an unknown id', () => {
      const input = 17;

      const actual = (() => {
        const glyphset = new Glyphset();
        const spy = jest.spyOn(glyphset['idCounts'], 'get');
        glyphset.remove(input);
        return spy;
      })();

      const expected = 0;

      expect(actual).toHaveBeenCalledTimes(expected);
    });

    it('removes the same texture multiple times & tracks count', () => {
      const input = game.textures.createCanvas('0x00000000000000000000');

      const actual = (() => {
        const glyphset = new Glyphset();
        glyphset.add(input);
        const id = glyphset.add(input);
        const deleteSpy = jest.spyOn(glyphset['textures'], 'delete');
        const setSpy = jest.spyOn(glyphset['idCounts'], 'set');
        glyphset.remove(id).remove(id);
        input.destroy();
        return [deleteSpy, setSpy];
      })();

      const expected = [1, 1];

      expect(actual[0]).toHaveBeenCalledTimes(expected[0]);
      expect(actual[1]).toHaveBeenCalledTimes(expected[1]);
    });

    it('updates textures', () => {
      const input = [
        game.textures.createCanvas('00000000000000000000'),
        game.textures.createCanvas('00000000000000000001')
      ] as const;

      const actual = (() => {
        const glyphset = new Glyphset();
        glyphset.add(input[0]);
        glyphset.add(input[1]);
        const spy = jest.spyOn(glyphset['textures'], 'set');
        glyphset.update(game.plugins.get('GlyphPlugin') as GlyphPlugin, new Font(24, 'monospace'), false);
        input[0].destroy();
        input[1].destroy();
        return spy;
      })();

      const expected = 2;

      expect(actual).toHaveBeenCalledTimes(expected);
    });
  });
});
