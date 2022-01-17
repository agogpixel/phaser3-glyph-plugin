import {
  Glyph,
  GlyphLikeObject,
  GlyphLikeTuple,
  normalizeCharLike,
  normalizeColorLike,
  normalizeGlyphLike
} from './glyph';

describe('Glyph Module', () => {
  //////////////////////////////////////////////////////////////////////////////
  // CharLike
  //////////////////////////////////////////////////////////////////////////////

  describe('CharLike', () => {
    describe('normalizeCharLike', () => {
      it('is a function', () => {
        const input = normalizeCharLike;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      describe('Basic Multilingual Plane', () => {
        describe('LATIN SMALL LETTER E', () => {
          const expected = 0x65;

          it(`normalizes 0x65`, () => {
            const input = expected;
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes 'e'", () => {
            const input = 'e';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\u0065'", () => {
            const input = '\u0065';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\x65'", () => {
            const input = '\x65';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\u{0065}'", () => {
            const input = '\u{0065}';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });
        });

        describe('VERTICAL BAR', () => {
          const expected = 0x7c;

          it(`normalizes 0x7c`, () => {
            const input = expected;
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '|'", () => {
            const input = '|';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\u007c'", () => {
            const input = '\u007c';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\x7c'", () => {
            const input = '\x7c';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\u{007c}'", () => {
            const input = '\u{007c}';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });
        });

        describe('BLACK SQUARE', () => {
          const expected = 0x25a0;

          it(`normalizes 0x25a0`, () => {
            const input = expected;
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '■'", () => {
            const input = '■';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\u25a0'", () => {
            const input = '\u25a0';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\u{25a0}'", () => {
            const input = '\u{25a0}';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });
        });

        describe('UMBRELLA', () => {
          const expected = 0x2602;

          it(`normalizes 0x2602`, () => {
            const input = expected;
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '☂'", () => {
            const input = '☂';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\u2602'", () => {
            const input = '\u2602';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\u{2602}'", () => {
            const input = '\u{2602}';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });
        });
      });

      describe('Astral Planes', () => {
        describe('MUSICAL SYMBOL G CLEF', () => {
          const expected = 0x1d11e;

          it(`normalizes 0x1d11e`, () => {
            const input = expected;
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '𝄞'", () => {
            const input = '𝄞';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\uD834\\uDD1E'", () => {
            const input = '\uD834\uDD1E';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\u{1d11e}'", () => {
            const input = '\u{1d11e}';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });
        });

        describe('MATHEMATICAL BOLD CAPITAL B', () => {
          const expected = 0x1d401;

          it(`normalizes 0x1d401`, () => {
            const input = expected;
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '𝐁'", () => {
            const input = '𝐁';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\uD835\\uDC01'", () => {
            const input = '\uD835\uDC01';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\u{1d401}'", () => {
            const input = '\u{1d401}';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });
        });

        describe('DOMINO TILE HORIZONTAL-00-04', () => {
          const expected = 0x1f035;

          it(`normalizes 0x1f035`, () => {
            const input = expected;
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '🀵'", () => {
            const input = '🀵';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\uD83C\\uDC35'", () => {
            const input = '\uD83C\uDC35';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\u{1f035}'", () => {
            const input = '\u{1f035}';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });
        });

        describe('GRINNING FACE', () => {
          const expected = 0x1f600;

          it(`normalizes 0x1f600`, () => {
            const input = expected;
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '😀'", () => {
            const input = '😀';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\uD83D\\uDE00'", () => {
            const input = '\uD83D\uDE00';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });

          it("normalizes '\\u{1f600}'", () => {
            const input = '\u{1f600}';
            const actual = normalizeCharLike(input);
            expect(actual).toEqual(expected);
          });
        });
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // ColorLike
  //////////////////////////////////////////////////////////////////////////////

  describe('ColorLike', () => {
    describe('normalizeColorLike', () => {
      it('is a function', () => {
        const input = normalizeColorLike;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('throws error when invalid type provided', () => {
        const input = null;
        const actual = () => normalizeColorLike(input);
        const expected = 'Invalid color type provided';
        expect(actual).toThrow(expected);
      });

      it('throws error when invalid color string provided', () => {
        const input = 'failit';
        const actual = () => normalizeColorLike(input);
        const expected = `Invalid color string: ${input}`;
        expect(actual).toThrow(expected);
      });

      it('returns a provided Phaser.Display.Color instance', () => {
        const input = new Phaser.Display.Color();
        const actual = normalizeColorLike(input);
        const expected = input;
        expect(actual).toEqual(expected);
      });

      it('normalizes a color object without values', () => {
        const input = {};
        const actual = normalizeColorLike(input);
        const expected = new Phaser.Display.Color(0, 0, 0, 255);
        expect(actual).toEqual(expected);
      });

      it('normalizes a color object with values', () => {
        const input = { r: 127, g: 127, b: 127, a: 127 };
        const actual = normalizeColorLike(input);
        const expected = new Phaser.Display.Color(127, 127, 127, 127);
        expect(actual).toEqual(expected);
      });

      it('normalizes number representation (0xRRGGBB)', () => {
        const input = 0xfffff;
        const actual = normalizeColorLike(input);
        const expected = new Phaser.Display.Color(0x0f, 0xff, 0xff, 0xff);
        expect(actual).toEqual(expected);
      });

      it('normalizes number representation (0xAARRGGBB)', () => {
        const input = 0xf40fffff;
        const actual = normalizeColorLike(input);
        const expected = new Phaser.Display.Color(0x0f, 0xff, 0xff, 0xf4);
        expect(actual).toEqual(expected);
      });

      it('normalizes string representation (#RGB)', () => {
        const input = '#abc';
        const actual = normalizeColorLike(input);
        const expected = new Phaser.Display.Color(0xaa, 0xbb, 0xcc, 0xff);
        expect(actual).toEqual(expected);
      });

      it('normalizes string representation (#RGBA)', () => {
        const input = '#abcd';
        const actual = normalizeColorLike(input);
        const expected = new Phaser.Display.Color(0xaa, 0xbb, 0xcc, 0xdd);
        expect(actual).toEqual(expected);
      });

      it('normalizes string representation (#RRGGBB)', () => {
        const input = '#abcdef';
        const actual = normalizeColorLike(input);
        const expected = new Phaser.Display.Color(0xab, 0xcd, 0xef, 0xff);
        expect(actual).toEqual(expected);
      });

      it('normalizes string representation (#RRGGBBAA)', () => {
        const input = '#abcdefed';
        const actual = normalizeColorLike(input);
        const expected = new Phaser.Display.Color(0xab, 0xcd, 0xef, 0xed);
        expect(actual).toEqual(expected);
      });

      it('normalizes string representation (CSS color name)', () => {
        const input = 'blue';
        const actual = normalizeColorLike(input);
        const expected = new Phaser.Display.Color(0x00, 0x00, 0xff, 0xff);
        expect(actual).toEqual(expected);
      });

      it('normalizes string representation (rgb(...))', () => {
        const input = 'rgb(170, 187, 204)';
        const actual = normalizeColorLike(input);
        const expected = new Phaser.Display.Color(0xaa, 0xbb, 0xcc, 0xff);
        expect(actual).toEqual(expected);
      });

      it('normalizes string representation (rgba(...))', () => {
        const input = 'rgba(170, 187, 204, 0.25)';
        const actual = normalizeColorLike(input);
        const expected = new Phaser.Display.Color(0xaa, 0xbb, 0xcc, 0x40);
        expect(actual).toEqual(expected);
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Glyph
  //////////////////////////////////////////////////////////////////////////////

  describe('Glyph', () => {
    describe('Glyph', () => {
      it('instantiates', () => {
        const input = [0x32, new Phaser.Display.Color(), new Phaser.Display.Color()] as const;
        const actual = new Glyph(...input) instanceof Glyph;
        const expected = true;
        expect(actual).toEqual(expected);
      });

      it('gets string representation of current code point (GRINNING FACE)', () => {
        const input = [] as const;
        const actual = new Glyph(0x1f600, new Phaser.Display.Color(), new Phaser.Display.Color()).getCh(...input);
        const expected = '😀';
        expect(actual).toEqual(expected);
      });

      it('gets CSS color string representations of current foreground & background color (hexadecimal notation)', () => {
        const input = 'hexadecimal';
        const actual = new Glyph(0x1f600, new Phaser.Display.Color(), new Phaser.Display.Color()).getCssColors(input);
        const expected = ['#000000', '#000000'];
        expect(actual).toEqual(expected);
      });

      it('gets CSS color string representations of current foreground & background color (functional notation)', () => {
        const input = 'functional';
        const actual = new Glyph(0x1f600, new Phaser.Display.Color(), new Phaser.Display.Color()).getCssColors(input);
        const expected = ['rgb(0, 0, 0)', 'rgb(0, 0, 0)'];
        expect(actual).toEqual(expected);
      });

      it('gets hex string representation', () => {
        const input = [] as const;
        const actual = new Glyph(0x1f600, new Phaser.Display.Color(), new Phaser.Display.Color()).toHexString(...input);
        const expected = '000000ff000000ff0001f600';
        expect(actual).toEqual(expected);
      });

      it('gets JSON string representation with defaults', () => {
        const input = [] as const;
        const actual = new Glyph(0x1f600, new Phaser.Display.Color(), new Phaser.Display.Color()).toJsonString(
          ...input
        );
        const expected = '[128512,[0,0,0],[0,0,0]]';
        expect(actual).toEqual(expected);
      });

      it('gets JSON string representation', () => {
        const input = [] as const;
        const actual = new Glyph(
          0x1f600,
          new Phaser.Display.Color(0, 0, 0, 0),
          new Phaser.Display.Color(0, 0, 0, 0)
        ).toJsonString(...input);
        const expected = '[128512,[0,0,0,0],[0,0,0,0]]';
        expect(actual).toEqual(expected);
      });

      it('gets string representation', () => {
        const input = [] as const;
        const actual = new Glyph(0x1f600, new Phaser.Display.Color(), new Phaser.Display.Color()).toString(...input);
        const expected = '[128512,[0,0,0],[0,0,0]]';
        expect(actual).toEqual(expected);
      });

      describe('fromHexString', () => {
        it('throws error if hex string is not length 20 or 24', () => {
          const input = 'aa';
          const actual = () => Glyph.fromHexString(input);
          const expected = `Invalid glyph hex string length: ${input.length}; must be 20 or 24`;
          expect(actual).toThrow(expected);
        });

        it('rehydrates glyph instance from hex string representation', () => {
          const input = '000000ff000000ff0001f600';
          const actual = Glyph.fromHexString(input);
          const expected = new Glyph(0x1f600, new Phaser.Display.Color(), new Phaser.Display.Color());
          expect(actual).toEqual(expected);
        });
      });

      describe('fromJsonString', () => {
        it('throws error if JSON string is not valid', () => {
          const input = 'null';
          const actual = () => Glyph.fromHexString(input);
          const expected = undefined;
          expect(actual).toThrow(expected);
        });

        it('rehydrates glyph instance from JSON string representation', () => {
          const input = '[128512,[0,0,0],[0,0,0]]';
          const actual = Glyph.fromJsonString(input);
          const expected = new Glyph(0x1f600, new Phaser.Display.Color(), new Phaser.Display.Color());
          expect(actual).toEqual(expected);
        });
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // GlyphLike
  //////////////////////////////////////////////////////////////////////////////

  describe('GlyphLike', () => {
    describe('normalizeGlyphLike', () => {
      it('is a function', () => {
        const input = normalizeGlyphLike;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('normalizes GlyphLikeTuple', () => {
        const input = [0x65, new Phaser.Display.Color(), new Phaser.Display.Color()] as GlyphLikeTuple;
        const actual = normalizeGlyphLike(input);
        const expected = new Glyph(0x65, new Phaser.Display.Color(), new Phaser.Display.Color());
        expect(actual).toEqual(expected);
      });

      it('normalizes GlyphLikeTuple with default background color', () => {
        const input = [0x65, new Phaser.Display.Color()] as GlyphLikeTuple;
        const actual = normalizeGlyphLike(input);
        const expected = new Glyph(0x65, new Phaser.Display.Color(), new Phaser.Display.Color(0, 0, 0, 0));
        expect(actual).toEqual(expected);
      });

      it('normalizes GlyphLikeObject', () => {
        const input = { ch: 0x65, fg: new Phaser.Display.Color(), bg: new Phaser.Display.Color() } as GlyphLikeObject;
        const actual = normalizeGlyphLike(input);
        const expected = new Glyph(0x65, new Phaser.Display.Color(), new Phaser.Display.Color());
        expect(actual).toEqual(expected);
      });

      it('normalizes GlyphLikeObject with default background color', () => {
        const input = { ch: 0x65, fg: new Phaser.Display.Color() } as GlyphLikeObject;
        const actual = normalizeGlyphLike(input);
        const expected = new Glyph(0x65, new Phaser.Display.Color(), new Phaser.Display.Color(0, 0, 0, 0));
        expect(actual).toEqual(expected);
      });

      it('normalizes GlyphLike with empty string for CharLike component', () => {
        const input = { ch: '', fg: new Phaser.Display.Color(), bg: new Phaser.Display.Color() } as GlyphLikeObject;
        const actual = normalizeGlyphLike(input);
        const expected = new Glyph(0x0, new Phaser.Display.Color(), new Phaser.Display.Color());
        expect(actual).toEqual(expected);
      });
    });
  });
});
