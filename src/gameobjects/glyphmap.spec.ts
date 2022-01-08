import { GlyphPlugin } from '../plugin';
import { Font, GlyphLike } from '../shared';

import { Glyphmap } from './glyphmap';

describe('Glyphmap', () => {
  let game: Phaser.Game;
  let scene: Phaser.Scene;

  // Squelch console.log output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  // Running game calls window.focus method.
  jest.spyOn(window, 'focus').mockImplementation(() => undefined);

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

  it('instantiates', () => {
    const input = new Glyphmap(scene);

    const actual = (() => {
      const ok = input instanceof Glyphmap;
      input.destroy();
      return ok;
    })();

    const expected = true;

    expect(actual).toEqual(expected);
  });

  it('has current cell width accessor (readonly)', () => {
    const input = new Glyphmap(scene);
    const actual = input.cellWidth;
    const expected = 1;

    expect(actual).toEqual(expected);
    expect(() => ((input.cellWidth as unknown) = 2)).toThrow();
    input.destroy();
  });

  it('has current cell height accessor (readonly)', () => {
    const input = new Glyphmap(scene);
    const actual = input.cellHeight;
    const expected = 24;

    expect(actual).toEqual(expected);
    expect(() => ((input.cellHeight as unknown) = 2)).toThrow();
    input.destroy();
  });

  it('gets current font', () => {
    const input = new Glyphmap(scene);
    const actual = input.font;
    const expected = new Font(24, 'monospace');

    expect(actual).toEqual(expected);
    input.destroy();
  });

  it('sets current font', () => {
    const input = new Font(10, 'Arial, sans-serif');

    const actual = (() => {
      const glyphmap = new Glyphmap(scene);
      glyphmap.font = input;
      const result = glyphmap.font;
      glyphmap.destroy();
      return result;
    })();

    const expected = input;

    expect(actual).toEqual(expected);
  });

  it('updates dimensions when font set', () => {
    const input = new Font(10, 'Arial, sans-serif');

    const actual = (() => {
      const glyphmap = new Glyphmap(scene);
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
      const glyphmap = new Glyphmap(scene);
      glyphmap.draw(0, 0, [['Q', '#aaa']]).draw(1, 1, [
        ['R', '#aaa'],
        ['T', '#aaa']
      ]);
      const spy = jest.spyOn(glyphmap['textures'], 'set');
      glyphmap.font = input;
      glyphmap.destroy();
      return spy;
    })();

    const expected = 2;

    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('gets force square ratio', () => {
    const input = new Glyphmap(scene);
    const actual = input.forceSquareRatio;
    const expected = false;

    expect(actual).toEqual(expected);
    input.destroy();
  });

  it('sets force square ratio', () => {
    const input = true;

    const actual = (() => {
      const glyphmap = new Glyphmap(scene);
      glyphmap.forceSquareRatio = input;
      const result = glyphmap.forceSquareRatio;
      glyphmap.destroy();
      return result;
    })();

    const expected = input;

    expect(actual).toEqual(expected);
  });

  it('updates dimensions when force square ratio set', () => {
    const input = true;

    const actual = (() => {
      const glyphmap = new Glyphmap(scene);
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
      const glyphmap = new Glyphmap(scene);
      glyphmap.draw(0, 0, [['Q', '#aaa']]).draw(1, 1, [
        ['R', '#aaa'],
        ['T', '#aaa']
      ]);
      const spy = jest.spyOn(glyphmap['textures'], 'set');
      glyphmap.forceSquareRatio = input;
      glyphmap.destroy();
      return spy;
    })();

    const expected = 2;

    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('gets glyph plugin', () => {
    const input = new Glyphmap(scene);
    const actual = input.glyphPlugin;
    const expected = game.plugins.get('GlyphPlugin');

    expect(actual).toEqual(expected);
    input.destroy();
  });

  it('sets glyph plugin', () => {
    const input = new GlyphPlugin(game.plugins);

    const actual = (() => {
      const glyphmap = new Glyphmap(scene);
      glyphmap.glyphPlugin = input;
      const result = glyphmap.glyphPlugin;
      glyphmap.destroy();
      return result;
    })();

    const expected = input;

    expect(actual).toEqual(expected);
    input.destroy();
  });

  it('updates dimensions when glyph plugin set', () => {
    const input = new GlyphPlugin(game.plugins);

    const actual = (() => {
      const glyphmap = new Glyphmap(scene);
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
      const glyphmap = new Glyphmap(scene);
      glyphmap.draw(0, 0, [['Q', '#aaa']]).draw(1, 1, [
        ['R', '#aaa'],
        ['T', '#aaa']
      ]);
      const spy = jest.spyOn(glyphmap['textures'], 'set');
      glyphmap.glyphPlugin = input;
      glyphmap.destroy();
      return spy;
    })();

    const expected = 2;

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
      const glyphmap = new Glyphmap(scene);
      const result = input.every(([x, y]) => !glyphmap.checkBounds(x, y));
      glyphmap.destroy();
      return result;
    })();

    const expected = true;

    expect(actual).toEqual(expected);
  });

  it('clears map content', () => {
    const input = new Glyphmap(scene);

    const actual = (() => {
      const spy = jest.spyOn(input['glyphs'], 'clear');
      input.clear().destroy();
      return spy;
    })();

    const expected = 1;

    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('erases map cell', () => {
    const input = [0, 0] as const;

    const actual = (() => {
      const glyphmap = new Glyphmap(scene);
      const spy = jest.spyOn(glyphmap['glyphs'], 'delete');
      glyphmap.erase(...input).destroy();
      return spy;
    })();

    const expected = 1;

    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('checks bounds when setting map cell', () => {
    const input = [-1, 0, [] as GlyphLike[]] as const;

    const actual = (() => {
      const glyphmap = new Glyphmap(scene);
      const spy = jest.spyOn(glyphmap['glyphs'], 'set');
      glyphmap.draw(...input).destroy();
      return spy;
    })();

    const expected = 0;

    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('erases content when setting map cell with empty array of glyphs', () => {
    const input = [0, 0, [] as GlyphLike[]] as const;

    const actual = (() => {
      const glyphmap = new Glyphmap(scene);
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
      const glyphmap = new Glyphmap(scene);
      const spy = jest.spyOn(glyphmap['glyphs'], 'set');
      glyphmap.draw(...input).destroy();
      return spy;
    })();

    const expected = 1;

    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('sets cull padding', () => {
    const input = [10, 7] as const;

    const actual = (() => {
      const glyphmap = new Glyphmap(scene);
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
      const glyphmap = new Glyphmap(scene);
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
      const glyphmap = new Glyphmap(scene);
      const spy = jest.spyOn(glyphmap, 'glyphPluginDestroyEventListener' as never);
      glyphmap.glyphPlugin = input;
      input.destroy();
      glyphmap.destroy();
      return spy;
    })();

    const expected = 1;

    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('refreshes when current glyph plugin emits an update event', () => {
    const input = ['M', true, new GlyphPlugin(scene.plugins)] as const;

    const actual = (() => {
      const glyphmap = new Glyphmap(scene);
      const spy = jest.spyOn(glyphmap, 'refresh' as never);
      glyphmap.glyphPlugin.measurementCh = input[0];
      glyphmap.glyphPlugin.advancedTextMetrics = input[1];
      glyphmap.glyphPlugin = input[2];
      glyphmap.destroy();
      return spy;
    })();

    const expected = 3;

    expect(actual).toHaveBeenCalledTimes(expected);
  });

  it('translates cell X coordinate to world X coordinate', () => {
    const input = [10, 0] as const;

    const actual = (() => {
      const glyphmap = new Glyphmap(scene, 10, 10);
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
      const glyphmap = new Glyphmap(scene, 10, 7);
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
      const glyphmap = new Glyphmap(scene, 8, 7);
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
      const glyphmap = new Glyphmap(scene, 10, 10);
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
      const glyphmap = new Glyphmap(scene, 10, 10);
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
      const glyphmap = new Glyphmap(scene, 10, 10);
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
      const glyphmap = new Glyphmap(scene, 10, 10);
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
      const glyphmap = new Glyphmap(scene, 8, 7);
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
        new Glyphmap(scene),
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
        new Glyphmap(scene),
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
        new Glyphmap(scene),
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
        new Glyphmap(scene),
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
        new Glyphmap(scene),
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
        new Glyphmap(scene),
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
    beforeAll(() => {
      const ctx = game.canvas.getContext('webgl');
      const proto = window.WebGLRenderingContext.prototype;

      ctx.isContextLost = () => false;
      ctx.getSupportedExtensions = proto.getSupportedExtensions.bind(ctx);
      ctx.getParameter = () => 16;
      ctx.getExtension = proto.getExtension.bind(ctx);
      ctx.disable = proto.disable.bind(ctx);
      ctx.enable = proto.enable.bind(ctx);
      ctx.clearColor = proto.clearColor.bind(ctx);
      ctx.activeTexture = proto.activeTexture.bind(ctx);
      ctx.blendEquation = proto.blendEquation.bind(ctx);
      ctx.blendFunc = proto.blendFunc.bind(ctx);
      ctx.createTexture = proto.createTexture.bind(ctx);
      ctx.deleteTexture = proto.deleteTexture.bind(ctx);
      ctx.bindTexture = proto.bindTexture.bind(ctx);
      ctx.texImage2D = proto.texImage2D.bind(ctx);
      ctx.bindBuffer = proto.bindBuffer.bind(ctx);
      ctx.createProgram = proto.createProgram.bind(ctx);
      ctx.createShader = proto.createShader.bind(ctx);
      ctx.shaderSource = proto.shaderSource.bind(ctx);
      ctx.compileShader = proto.compileShader.bind(ctx);
      ctx.getShaderParameter = proto.getShaderParameter.bind(ctx);
      ctx.attachShader = proto.attachShader.bind(ctx);
      ctx.linkProgram = proto.linkProgram.bind(ctx);
      ctx.getProgramParameter = proto.getProgramParameter.bind(ctx);
      ctx.useProgram = proto.useProgram.bind(ctx);
      ctx.createBuffer = proto.createBuffer.bind(ctx);
      ctx.bufferData = proto.bufferData.bind(ctx);
      ctx.getAttribLocation = proto.getAttribLocation.bind(ctx);
      ctx.disableVertexAttribArray = proto.disableVertexAttribArray.bind(ctx);
      ctx.deleteBuffer = proto.deleteBuffer.bind(ctx);
      ctx.texParameteri = proto.texParameteri.bind(ctx);
      ctx.pixelStorei = proto.pixelStorei.bind(ctx);
      ctx.createFramebuffer = proto.createFramebuffer.bind(ctx);
      ctx.bindFramebuffer = proto.bindFramebuffer.bind(ctx);
      ctx.viewport = proto.viewport.bind(ctx);
      ctx.framebufferTexture2D = proto.framebufferTexture2D.bind(ctx);
      ctx.checkFramebufferStatus = () => undefined;
      ctx.generateMipmap = proto.generateMipmap.bind(ctx);
      ctx.scissor = proto.scissor.bind(ctx);
      ctx.bufferSubData = proto.bufferSubData.bind(ctx);
      ctx.drawArrays = proto.drawArrays.bind(ctx);
    });

    it('renders an empty glyphmap', () => {
      const input = [new Phaser.Renderer.WebGL.WebGLRenderer(game), new Glyphmap(scene), scene.cameras.main] as const;

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
      const input = [new Phaser.Renderer.WebGL.WebGLRenderer(game), new Glyphmap(scene), scene.cameras.main] as const;

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
      const input = [new Phaser.Renderer.WebGL.WebGLRenderer(game), new Glyphmap(scene), scene.cameras.main] as const;

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
      const input = [new Phaser.Renderer.WebGL.WebGLRenderer(game), new Glyphmap(scene), scene.cameras.main] as const;

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
        new Glyphmap(scene),
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
});
