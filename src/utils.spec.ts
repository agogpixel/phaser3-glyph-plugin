import {
  Font,
  getBytesFromCodePoint,
  getBytesFromColor,
  getBytesFromHexString,
  getCodePointFromBytes,
  getCodePointFromHexString,
  getColorFromBytes,
  getColorFromHexString,
  getCssColorStringFromColor,
  getHexStringFromBytes,
  getHexStringFromCodePoint,
  getHexStringFromColor,
  roundToDecimal
} from './utils';

describe('Utilities Module', () => {
  //////////////////////////////////////////////////////////////////////////////
  // Bytes
  //////////////////////////////////////////////////////////////////////////////

  describe('Bytes', () => {
    describe('getBytesFromHexString', () => {
      it('is a function', () => {
        const input = getBytesFromHexString;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('throws error when invalid character included', () => {
        const input = 'failit';
        const actual = () => getBytesFromHexString(input);
        const expected = `Invalid hex string: ${input}`;
        expect(actual).toThrow(expected);
      });

      it('throws error when string length is odd', () => {
        const input = 'aaa';
        const actual = () => getBytesFromHexString(input);
        const expected = `Invalid hex string length (odd): ${input.length}`;
        expect(actual).toThrow(expected);
      });

      it('gets bytes from hex string', () => {
        const input = '0f3b76';
        const actual = getBytesFromHexString(input);
        const expected = new Uint8Array([0x0f, 0x3b, 0x76]);
        expect(actual).toEqual(expected);
      });
    });

    describe('getHexStringFromBytes', () => {
      it('is a function', () => {
        const input = getHexStringFromBytes;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('gets hex string from bytes', () => {
        const input = new Uint8Array([0x0f, 0x3b, 0x76]);
        const actual = getHexStringFromBytes(input);
        const expected = '0f3b76';
        expect(actual).toEqual(expected);
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // CodePoint
  //////////////////////////////////////////////////////////////////////////////

  describe('CodePoint', () => {
    describe('getBytesFromCodePoint', () => {
      it('is a function', () => {
        const input = getBytesFromCodePoint;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      describe('Basic Multilingual Plane', () => {
        describe('LATIN SMALL LETTER E', () => {
          it('gets bytes (2) from code point 0x65', () => {
            const input = 0x65;
            const actual = getBytesFromCodePoint(input);
            const expected = new Uint8Array([0x00, 0x65]);
            expect(actual).toEqual(expected);
          });
        });

        describe('VERTICAL BAR', () => {
          it('gets bytes (2) from code point 0x7c', () => {
            const input = 0x7c;
            const actual = getBytesFromCodePoint(input);
            const expected = new Uint8Array([0x00, 0x7c]);
            expect(actual).toEqual(expected);
          });
        });

        describe('BLACK SQUARE', () => {
          it('gets bytes (2) from code point 0x25a0', () => {
            const input = 0x25a0;
            const actual = getBytesFromCodePoint(input);
            const expected = new Uint8Array([0x25, 0xa0]);
            expect(actual).toEqual(expected);
          });
        });

        describe('UMBRELLA', () => {
          it('gets bytes (2) from code point 0x2602', () => {
            const input = 0x2602;
            const actual = getBytesFromCodePoint(input);
            const expected = new Uint8Array([0x26, 0x02]);
            expect(actual).toEqual(expected);
          });
        });
      });

      describe('Astral Planes', () => {
        describe('MUSICAL SYMBOL G CLEF', () => {
          it('gets bytes (4) from code point 0x1d11e', () => {
            const input = 0x1d11e;
            const actual = getBytesFromCodePoint(input);
            const expected = new Uint8Array([0x00, 0x01, 0xd1, 0x1e]);
            expect(actual).toEqual(expected);
          });
        });

        describe('MATHEMATICAL BOLD CAPITAL B', () => {
          it('gets bytes (4) from code point 0x1d401', () => {
            const input = 0x1d401;
            const actual = getBytesFromCodePoint(input);
            const expected = new Uint8Array([0x00, 0x01, 0xd4, 0x01]);
            expect(actual).toEqual(expected);
          });
        });

        describe('DOMINO TILE HORIZONTAL-00-04', () => {
          it('gets bytes (4) from code point 0x1f035', () => {
            const input = 0x1f035;
            const actual = getBytesFromCodePoint(input);
            const expected = new Uint8Array([0x00, 0x01, 0xf0, 0x35]);
            expect(actual).toEqual(expected);
          });
        });

        describe('GRINNING FACE', () => {
          it('gets bytes (4) from code point 0x1f600', () => {
            const input = 0x1f600;
            const actual = getBytesFromCodePoint(input);
            const expected = new Uint8Array([0x00, 0x01, 0xf6, 0x00]);
            expect(actual).toEqual(expected);
          });
        });
      });
    });

    describe('getCodePointFromBytes', () => {
      it('is a function', () => {
        const input = getCodePointFromBytes;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('throws error if bytes length is not 2 or 4', () => {
        const input = new Uint8Array([0xff, 0xff, 0xff]);
        const actual = () => getCodePointFromBytes(input);
        const expected = `Invalid bytes length: ${input.length}; code point bytes must be 2 or 4 in length`;
        expect(actual).toThrow(expected);
      });

      describe('Basic Multilingual Plane', () => {
        describe('LATIN SMALL LETTER E', () => {
          it('gets code point from bytes [0x00, 0x65]', () => {
            const input = new Uint8Array([0x00, 0x65]);
            const actual = getCodePointFromBytes(input);
            const expected = 0x65;
            expect(actual).toEqual(expected);
          });
        });

        describe('VERTICAL BAR', () => {
          it('gets code point from bytes [0x00, 0x7c]', () => {
            const input = new Uint8Array([0x00, 0x7c]);
            const actual = getCodePointFromBytes(input);
            const expected = 0x7c;
            expect(actual).toEqual(expected);
          });
        });

        describe('BLACK SQUARE', () => {
          it('gets code point from bytes [0x25, 0xa0]', () => {
            const input = new Uint8Array([0x25, 0xa0]);
            const actual = getCodePointFromBytes(input);
            const expected = 0x25a0;
            expect(actual).toEqual(expected);
          });
        });

        describe('UMBRELLA', () => {
          it('gets code point from bytes [0x26, 0x02]', () => {
            const input = new Uint8Array([0x26, 0x02]);
            const actual = getCodePointFromBytes(input);
            const expected = 0x2602;
            expect(actual).toEqual(expected);
          });
        });
      });

      describe('Astral Planes', () => {
        describe('MUSICAL SYMBOL G CLEF', () => {
          it('gets code point from bytes [0x00, 0x01, 0xd1, 0x1e]', () => {
            const input = new Uint8Array([0x00, 0x01, 0xd1, 0x1e]);
            const actual = getCodePointFromBytes(input);
            const expected = 0x1d11e;
            expect(actual).toEqual(expected);
          });
        });

        describe('MATHEMATICAL BOLD CAPITAL B', () => {
          it('gets code point from bytes [0x00, 0x01, 0xd4, 0x01]', () => {
            const input = new Uint8Array([0x00, 0x01, 0xd4, 0x01]);
            const actual = getCodePointFromBytes(input);
            const expected = 0x1d401;
            expect(actual).toEqual(expected);
          });
        });

        describe('DOMINO TILE HORIZONTAL-00-04', () => {
          it('gets code point from bytes [0x00, 0x01, 0xf0, 0x35]', () => {
            const input = new Uint8Array([0x00, 0x01, 0xf0, 0x35]);
            const actual = getCodePointFromBytes(input);
            const expected = 0x1f035;
            expect(actual).toEqual(expected);
          });
        });

        describe('GRINNING FACE', () => {
          it('gets code point from bytes [0x00, 0x01, 0xf6, 0x00]', () => {
            const input = new Uint8Array([0x00, 0x01, 0xf6, 0x00]);
            const actual = getCodePointFromBytes(input);
            const expected = 0x1f600;
            expect(actual).toEqual(expected);
          });
        });
      });
    });

    describe('getCodePointFromHexString', () => {
      it('is a function', () => {
        const input = getCodePointFromHexString;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      describe('Basic Multilingual Plane', () => {
        describe('LATIN SMALL LETTER E', () => {
          it("gets code point from hex string '0065'", () => {
            const input = '0065';
            const actual = getCodePointFromHexString(input);
            const expected = 0x65;
            expect(actual).toEqual(expected);
          });
        });

        describe('VERTICAL BAR', () => {
          it("gets code point from hex string '007c'", () => {
            const input = '007c';
            const actual = getCodePointFromHexString(input);
            const expected = 0x7c;
            expect(actual).toEqual(expected);
          });
        });

        describe('BLACK SQUARE', () => {
          it("gets code point from hex string '25a0'", () => {
            const input = '25a0';
            const actual = getCodePointFromHexString(input);
            const expected = 0x25a0;
            expect(actual).toEqual(expected);
          });
        });

        describe('UMBRELLA', () => {
          it("gets code point from hex string '2602'", () => {
            const input = '2602';
            const actual = getCodePointFromHexString(input);
            const expected = 0x2602;
            expect(actual).toEqual(expected);
          });
        });
      });

      describe('Astral Planes', () => {
        describe('MUSICAL SYMBOL G CLEF', () => {
          it("gets code point from hex string '0001d11e'", () => {
            const input = '0001d11e';
            const actual = getCodePointFromHexString(input);
            const expected = 0x1d11e;
            expect(actual).toEqual(expected);
          });
        });

        describe('MATHEMATICAL BOLD CAPITAL B', () => {
          it("gets code point from hex string '0001d401'", () => {
            const input = '0001d401';
            const actual = getCodePointFromHexString(input);
            const expected = 0x1d401;
            expect(actual).toEqual(expected);
          });
        });

        describe('DOMINO TILE HORIZONTAL-00-04', () => {
          it("gets code point from hex string '0001f035'", () => {
            const input = '0001f035';
            const actual = getCodePointFromHexString(input);
            const expected = 0x1f035;
            expect(actual).toEqual(expected);
          });
        });

        describe('GRINNING FACE', () => {
          it("gets code point from hex string '0001f600'", () => {
            const input = '0001f600';
            const actual = getCodePointFromHexString(input);
            const expected = 0x1f600;
            expect(actual).toEqual(expected);
          });
        });
      });
    });

    describe('getHexStringFromCodePoint', () => {
      it('is a function', () => {
        const input = getHexStringFromCodePoint;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      describe('Basic Multilingual Plane', () => {
        describe('LATIN SMALL LETTER E', () => {
          it('gets hex string from code point 0x65', () => {
            const input = 0x65;
            const actual = getHexStringFromCodePoint(input);
            const expected = '0065';
            expect(actual).toEqual(expected);
          });
        });

        describe('VERTICAL BAR', () => {
          it('gets hex string from code point 0x7c', () => {
            const input = 0x7c;
            const actual = getHexStringFromCodePoint(input);
            const expected = '007c';
            expect(actual).toEqual(expected);
          });
        });

        describe('BLACK SQUARE', () => {
          it('gets hex string from code point 0x25a0', () => {
            const input = 0x25a0;
            const actual = getHexStringFromCodePoint(input);
            const expected = '25a0';
            expect(actual).toEqual(expected);
          });
        });

        describe('UMBRELLA', () => {
          it('gets hex string from code point 0x2602', () => {
            const input = 0x2602;
            const actual = getHexStringFromCodePoint(input);
            const expected = '2602';
            expect(actual).toEqual(expected);
          });
        });
      });

      describe('Astral Planes', () => {
        describe('MUSICAL SYMBOL G CLEF', () => {
          it('gets hex string from code point 0x1d11e', () => {
            const input = 0x1d11e;
            const actual = getHexStringFromCodePoint(input);
            const expected = '0001d11e';
            expect(actual).toEqual(expected);
          });
        });

        describe('MATHEMATICAL BOLD CAPITAL B', () => {
          it('gets hex string from code point 0x1d401', () => {
            const input = 0x1d401;
            const actual = getHexStringFromCodePoint(input);
            const expected = '0001d401';
            expect(actual).toEqual(expected);
          });
        });

        describe('DOMINO TILE HORIZONTAL-00-04', () => {
          it('gets hex string from code point 0x1f035', () => {
            const input = 0x1f035;
            const actual = getHexStringFromCodePoint(input);
            const expected = '0001f035';
            expect(actual).toEqual(expected);
          });
        });

        describe('GRINNING FACE', () => {
          it('gets hex string from code point 0x1f600', () => {
            const input = 0x1f600;
            const actual = getHexStringFromCodePoint(input);
            const expected = '0001f600';
            expect(actual).toEqual(expected);
          });
        });
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Color
  //////////////////////////////////////////////////////////////////////////////

  describe('Color', () => {
    describe('getBytesFromColor', () => {
      it('is a function', () => {
        const input = getBytesFromColor;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('gets bytes from Phaser.Display.Color instance', () => {
        const input = new Phaser.Display.Color(0x34, 0x72, 0x0e, 0xac);
        const actual = getBytesFromColor(input);
        const expected = new Uint8Array([0x34, 0x72, 0x0e, 0xac]);
        expect(actual).toEqual(expected);
      });
    });

    describe('getColorFromBytes', () => {
      it('is a function', () => {
        const input = getColorFromBytes;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('throws error if bytes length is not 3 or 4', () => {
        const input = new Uint8Array([0xff, 0xff]);
        const actual = () => getColorFromBytes(input);
        const expected = `Invalid bytes length: ${input.length}; color bytes must be 3 or 4 in length`;
        expect(actual).toThrow(expected);
      });

      it('gets Phaser.Display.Color instance from bytes (3)', () => {
        const input = new Uint8Array([0x34, 0x72, 0x0e]);
        const actual = getColorFromBytes(input);
        const expected = new Phaser.Display.Color(0x34, 0x72, 0x0e);
        expect(actual).toEqual(expected);
      });

      it('gets Phaser.Display.Color instance from bytes (4)', () => {
        const input = new Uint8Array([0x34, 0x72, 0x0e, 0xac]);
        const actual = getColorFromBytes(input);
        const expected = new Phaser.Display.Color(0x34, 0x72, 0x0e, 0xac);
        expect(actual).toEqual(expected);
      });
    });

    describe('getColorFromHexString', () => {
      it('is a function', () => {
        const input = getColorFromHexString;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('gets Phaser.Display.Color instance from hex string (length 6)', () => {
        const input = '34720e';
        const actual = getColorFromHexString(input);
        const expected = new Phaser.Display.Color(0x34, 0x72, 0x0e);
        expect(actual).toEqual(expected);
      });

      it('gets Phaser.Display.Color instance from hex string (length 8)', () => {
        const input = '34720eac';
        const actual = getColorFromHexString(input);
        const expected = new Phaser.Display.Color(0x34, 0x72, 0x0e, 0xac);
        expect(actual).toEqual(expected);
      });
    });

    describe('getCssColorStringFromColor', () => {
      it('is a function', () => {
        const input = getCssColorStringFromColor;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('gets a CSS color string in functional notation from Phaser.Display.Color(0x00, 0x23, 0x03, 0xf4)', () => {
        const input = ['functional', new Phaser.Display.Color(0x00, 0x23, 0x03, 0xf4)] as const;
        const actual = getCssColorStringFromColor(...input);
        const expected = 'rgba(0, 35, 3, 0.957)';
        expect(actual).toEqual(expected);
      });

      it('gets a CSS color string in functional notation from Phaser.Display.Color(0x00, 0x23, 0x03)', () => {
        const input = ['functional', new Phaser.Display.Color(0x00, 0x23, 0x03)] as const;
        const actual = getCssColorStringFromColor(...input);
        const expected = 'rgb(0, 35, 3)';
        expect(actual).toEqual(expected);
      });

      it('gets a CSS color string in hexadecimal notation from Phaser.Display.Color(0x00, 0x23, 0x03, 0xf4)', () => {
        const input = ['hexadecimal', new Phaser.Display.Color(0x00, 0x23, 0x03, 0xf4)] as const;
        const actual = getCssColorStringFromColor(...input);
        const expected = '#002303F4';
        expect(actual).toEqual(expected);
      });

      it('gets a CSS color string in hexadecimal notation from Phaser.Display.Color(0x00, 0x23, 0x03)', () => {
        const input = ['hexadecimal', new Phaser.Display.Color(0x00, 0x23, 0x03)] as const;
        const actual = getCssColorStringFromColor(...input);
        const expected = '#002303';
        expect(actual).toEqual(expected);
      });
    });

    describe('getHexStringFromColor', () => {
      it('is a function', () => {
        const input = getHexStringFromColor;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('gets hex string from Phaser.Display.Color instance', () => {
        const input = new Phaser.Display.Color(0x34, 0x72, 0x0e);
        const actual = getHexStringFromColor(input);
        const expected = '34720eff';
        expect(actual).toEqual(expected);
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Font
  //////////////////////////////////////////////////////////////////////////////

  describe('Font', () => {
    describe('Font', () => {
      it('instantiates', () => {
        const input = [10, 'monospace'] as const;
        const actual = new Font(...input) instanceof Font;
        const expected = true;
        expect(actual).toEqual(expected);
      });

      it('instantiates with null values', () => {
        const input = [10, 'monospace', null, null, null] as const;
        const actual = new Font(...input);
        const expected = new Font(10, 'monospace');
        expect(actual).toEqual(expected);
      });

      it('has default values', () => {
        const input = new Font(10, 'monospace');
        const actual = [input.size, input.family, input.weight, input.style, input.variant];
        const expected = [10, 'monospace', 'normal', 'normal', 'normal'];
        expect(actual).toEqual(expected);
      });

      it('can be cloned', () => {
        const input = new Font(10, 'monospace');
        const actual = Font.clone(input);
        const expected = input;
        for (const p of ['size', 'family', 'weight', 'style', 'variant']) {
          expect(actual[p]).toEqual(expected[p]);
        }
      });

      it('can provide a CSS font string', () => {
        const input = new Font(10, 'monospace');
        const actual = input.css;
        const expected = 'normal normal normal 10px monospace';
        expect(actual).toEqual(expected);
      });

      it('has a string representation', () => {
        const input = new Font(10, 'monospace');
        const actual = `${input}`;
        const expected = 'Font: normal normal normal 10px monospace';
        expect(actual).toEqual(expected);
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Math
  //////////////////////////////////////////////////////////////////////////////

  describe('Math', () => {
    describe('roundToDecimal', () => {
      it('is a function', () => {
        const input = roundToDecimal;
        const actual = typeof input;
        const expected = 'function';
        expect(actual).toEqual(expected);
      });

      it('does nothing if integer', () => {
        const input = [2.0, 3] as const;
        const actual = roundToDecimal(...input);
        const expected = 2;
        expect(actual).toEqual(expected);
      });

      it('rounds down to some decimal place', () => {
        const input = [2.38447, 3] as const;
        const actual = roundToDecimal(...input);
        const expected = 2.384;
        expect(actual).toEqual(expected);
      });

      it('rounds up to some decimal place', () => {
        const input = [2.38474, 3] as const;
        const actual = roundToDecimal(...input);
        const expected = 2.385;
        expect(actual).toEqual(expected);
      });
    });
  });
});
