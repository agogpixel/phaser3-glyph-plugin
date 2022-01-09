import { ColorLike, convertHexStringToBuffer, GlyphLike } from './shared';
import {
  bytesPerColor,
  bytesPerChar,
  bytesPerGlyph,
  checkAmount,
  checkBufferIndexing,
  convertBufferToHexString,
  convertCharLikeToHexString,
  convertCharLikeToString,
  createGlyphsBuffer,
  Font,
  normalizeBufferEndIndex,
  readStringFromBuffer,
  readColorsFromBuffer,
  readGlyphsFromBuffer,
  writeCharLikeToBuffer,
  writeColorLikeToBuffer,
  writeGlyphsToBuffer
} from './shared';

describe('checkAmount', () => {
  function makeErrorMessage(s: number, e: number, m: number) {
    return `Amount of bytes to be read must be a positive non-zero multiple of ${m}; amount: ${
      e - s
    }, start: ${s}, end: ${e}`;
  }

  it('is a function', () => {
    const input = checkAmount;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('throws an error if amount is zero', () => {
    const input = [2, 2, 3] as const;
    const actual = () => checkAmount(...input);
    const expected = makeErrorMessage(...input);

    expect(actual).toThrow(expected);
  });

  it('throws an error if amount is less than zero', () => {
    const input = [3, 2, 3] as const;
    const actual = () => checkAmount(...input);
    const expected = makeErrorMessage(...input);

    expect(actual).toThrow(expected);
  });

  it('throws an error if amount is not a multiple', () => {
    const input = [0, 2, 3] as const;
    const actual = () => checkAmount(...input);
    const expected = makeErrorMessage(...input);

    expect(actual).toThrow(expected);
  });
});

describe('checkBufferIndexing', () => {
  function makeErrorMessage(l: number, s: number, e: number) {
    return `Provided indexes invalid; buffer length: ${l}, start: ${s}, end: ${e}`;
  }

  it('is a function', () => {
    const input = checkBufferIndexing;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('throws an error when start is less than zero', () => {
    const input = [new Uint8Array(1), -1, 1] as const;
    const actual = () => checkBufferIndexing(...input);
    const expected = makeErrorMessage(input[0].length, input[1], input[2]);

    expect(actual).toThrow(expected);
  });

  it('throws an error when end is zero', () => {
    const input = [new Uint8Array(1), 0, 0] as const;
    const actual = () => checkBufferIndexing(...input);
    const expected = makeErrorMessage(input[0].length, input[1], input[2]);

    expect(actual).toThrow(expected);
  });

  it('throws an error when end is less than zero', () => {
    const input = [new Uint8Array(1), 0, -1] as const;
    const actual = () => checkBufferIndexing(...input);
    const expected = makeErrorMessage(input[0].length, input[1], input[2]);

    expect(actual).toThrow(expected);
  });

  it('throws an error when start & end are equal', () => {
    const input = [new Uint8Array(3), 1, 1] as const;
    const actual = () => checkBufferIndexing(...input);
    const expected = makeErrorMessage(input[0].length, input[1], input[2]);

    expect(actual).toThrow(expected);
  });

  it('throws an error when start is greater than end', () => {
    const input = [new Uint8Array(3), 2, 1] as const;
    const actual = () => checkBufferIndexing(...input);
    const expected = makeErrorMessage(input[0].length, input[1], input[2]);

    expect(actual).toThrow(expected);
  });

  it('throws an error when end is greater than buffer length', () => {
    const input = [new Uint8Array(3), 0, 4] as const;
    const actual = () => checkBufferIndexing(...input);
    const expected = makeErrorMessage(input[0].length, input[1], input[2]);

    expect(actual).toThrow(expected);
  });
});

describe('convertBufferToHexString', () => {
  it('is a function', () => {
    const input = convertBufferToHexString;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('throws an error when buffer length is zero', () => {
    const input = new Uint8Array(0);
    const actual = () => convertBufferToHexString(input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('converts buffer with single byte', () => {
    const input = new Uint8Array([0x23]);
    const actual = convertBufferToHexString(input);
    const expected = '0x23';

    expect(actual).toEqual(expected);
  });

  it('converts buffer with multiple bytes', () => {
    const input = new Uint8Array([0, 0x23, 0, 0xf, 0xa0, 0]);
    const actual = convertBufferToHexString(input);
    const expected = '0x0023000fa000';

    expect(actual).toEqual(expected);
  });
});

describe('convertCharLikeToHexString', () => {
  it('is a function', () => {
    const input = convertCharLikeToHexString;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('throws an error when string length is zero', () => {
    const input = '';
    const actual = () => convertCharLikeToHexString(input);
    const expected = 'Empty string';

    expect(actual).toThrow(expected);
  });

  it('converts a number to its UTF-16 hex string equivalent', () => {
    const input = 4095;
    const actual = convertCharLikeToHexString(input);
    const expected = '0x0fff';

    expect(actual).toEqual(expected);
  });

  it('converts a single character to its UTF-16 hex string equivalent', () => {
    const input = '#';
    const actual = convertCharLikeToHexString(input);
    const expected = '0x0023';

    expect(actual).toEqual(expected);
  });

  it('converts a string to its UTF-16 hex string equivalent', () => {
    const input = '#ϴ ';
    const actual = convertCharLikeToHexString(input);
    const expected = '0x002303f40020';

    expect(actual).toEqual(expected);
  });

  it('converts a null character to its UTF-16 hex string equivalent', () => {
    const input = '\0';
    const actual = convertCharLikeToHexString(input);
    const expected = '0x0000';

    expect(actual).toEqual(expected);
  });
});

describe('convertCharLikeToString', () => {
  it('is a function', () => {
    const input = convertCharLikeToString;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('converts a number to string character', () => {
    const input = 0x23;
    const actual = convertCharLikeToString(input);
    const expected = '#';

    expect(actual).toEqual(expected);
  });

  it('returns the provided string', () => {
    const input = '#';
    const actual = convertCharLikeToString(input);
    const expected = '#';

    expect(actual).toEqual(expected);
  });
});

describe('convertHexStringToBuffer', () => {
  it('is a function', () => {
    const input = convertHexStringToBuffer;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('throws error when give hex string of uneven length', () => {
    const input = '0xaa03f';
    const actual = () => convertHexStringToBuffer(input);
    const expected = `Invalid hex string: ${input}; must be an even number in length`;

    expect(actual).toThrow(expected);
  });

  it('converts a hex string to a buffer', () => {
    const input = '0xaa03fd';
    const actual = convertHexStringToBuffer(input);
    const expected = new Uint8Array([0xaa, 0x03, 0xfd]);

    expect(actual).toEqual(expected);
  });
});

describe('createGlyphsBuffer', () => {
  it('is a function', () => {
    const input = createGlyphsBuffer;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('creates a buffer for glyphs', () => {
    const input = [
      [
        ['#', '#0ffffff4', 0x0f0f0f0f],
        ['ϴ', 'rgba(15, 15, 15, 0.25)', '#AbC'],
        [' ', '#FFF']
      ] as GlyphLike[]
    ] as const;
    const actual = createGlyphsBuffer(...input);
    const expected = new Uint8Array([
      0x00, 0x23, 0x0f, 0xff, 0xff, 0xf4, 0x0f, 0x0f, 0x0f, 0x0f, 0x03, 0xf4, 0x0f, 0x0f, 0x0f, 0x40, 0xaa, 0xbb, 0xcc,
      0xff, 0x00, 0x20, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00
    ]);

    expect(actual).toEqual(expected);
  });
});

describe('normalizeBufferEndIndex', () => {
  it('is a function', () => {
    const input = normalizeBufferEndIndex;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('returns the buffer length when end is not defined', () => {
    const input = [new Uint8Array(1)] as const;
    const actual = normalizeBufferEndIndex(...input);
    const expected = input[0].length;

    expect(actual).toEqual(expected);
  });

  it('returns end when defined', () => {
    const input = [new Uint8Array(1), 3] as const;
    const actual = normalizeBufferEndIndex(...input);
    const expected = input[1];

    expect(actual).toEqual(expected);
  });
});

describe('readColorsFromBuffer', () => {
  it('is a function', () => {
    const input = readColorsFromBuffer;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('throws an error when buffer length is zero', () => {
    const input = new Uint8Array(0);
    const actual = () => readColorsFromBuffer('rgba', input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('throws an error when read length is not a multiple of 4', () => {
    const input = ['rgba', new Uint8Array(8), 0, 6] as const;
    const actual = () => readColorsFromBuffer(...input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('reads single color as number from entire buffer', () => {
    const input = ['number', new Uint8Array([0x00, 0x23, 0x03, 0xf4])] as const;
    const actual = readColorsFromBuffer(...input);
    const expected = [0xf4002303 >> 0];

    expect(actual).toEqual(expected);
  });

  it('reads multiple colors as numbers from entire buffer', () => {
    const input = ['number', new Uint8Array([0x0e, 0x23, 0x03, 0x00, 0x00, 0x01, 0x01, 0x00])] as const;
    const actual = readColorsFromBuffer(...input);
    const expected = [0xe2303 >> 0, 0x101 >> 0];

    expect(actual).toEqual(expected);
  });

  it('reads multiple colors as numbers from section of buffer', () => {
    const input = [
      'number',
      new Uint8Array([0xff, 0x0e, 0x23, 0x03, 0x00, 0x00, 0x01, 0x01, 0x00, 0xff]),
      1,
      9
    ] as const;
    const actual = readColorsFromBuffer(...input);
    const expected = [0xe2303 >> 0, 0x101 >> 0];

    expect(actual).toEqual(expected);
  });

  it('reads single color as #RGBA string from entire buffer', () => {
    const input = ['#RGBA', new Uint8Array([0x00, 0x23, 0x03, 0xf4])] as const;
    const actual = readColorsFromBuffer(...input);
    const expected = ['#002303F4'];

    expect(actual).toEqual(expected);
  });

  it('reads multiple colors as #RGBA strings from entire buffer', () => {
    const input = ['#RGBA', new Uint8Array([0x0e, 0x23, 0x03, 0x00, 0x00, 0x01, 0x01, 0x00])] as const;
    const actual = readColorsFromBuffer(...input);
    const expected = ['#0E230300', '#00010100'];

    expect(actual).toEqual(expected);
  });

  it('reads multiple colors as #RGBA strings from section of buffer', () => {
    const input = [
      '#RGBA',
      new Uint8Array([0xff, 0x0e, 0x23, 0x03, 0x00, 0x00, 0x01, 0x01, 0x00, 0xff]),
      1,
      9
    ] as const;
    const actual = readColorsFromBuffer(...input);
    const expected = ['#0E230300', '#00010100'];

    expect(actual).toEqual(expected);
  });

  it('reads single color as rgba(...) string from entire buffer', () => {
    const input = ['rgba', new Uint8Array([0x00, 0x23, 0x03, 0xf4])] as const;
    const actual = readColorsFromBuffer(...input);
    const expected = ['rgba(0, 35, 3, 0.957)'];

    expect(actual).toEqual(expected);
  });

  it('reads multiple colors as rgba(...) strings from entire buffer', () => {
    const input = ['rgba', new Uint8Array([0x0e, 0x23, 0x03, 0x00, 0x00, 0x01, 0x01, 0x00])] as const;
    const actual = readColorsFromBuffer(...input);
    const expected = ['rgba(14, 35, 3, 0)', 'rgba(0, 1, 1, 0)'];

    expect(actual).toEqual(expected);
  });

  it('reads multiple colors as rgba(...) strings from section of buffer', () => {
    const input = ['rgba', new Uint8Array([0xff, 0x0e, 0x23, 0x03, 0x00, 0x00, 0x01, 0x01, 0x00, 0xff]), 1, 9] as const;
    const actual = readColorsFromBuffer(...input);
    const expected = ['rgba(14, 35, 3, 0)', 'rgba(0, 1, 1, 0)'];

    expect(actual).toEqual(expected);
  });
});

describe('readGlyphsFromBuffer', () => {
  it('is a function', () => {
    const input = readGlyphsFromBuffer;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('throws an error when buffer length is zero', () => {
    const input = new Uint8Array(0);
    const actual = () => readGlyphsFromBuffer('rgba', input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('throws an error when read length is not a multiple of 10', () => {
    const input = ['rgba', new Uint8Array(20), 0, 13] as const;
    const actual = () => readGlyphsFromBuffer(...input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('reads single glyph with colors as numbers from entire buffer', () => {
    const input = ['number', new Uint8Array([0x00, 0x23, 0x03, 0xf4, 0x01, 0xcc, 0xcc, 0x01, 0xf4, 0x03])] as const;
    const actual = readGlyphsFromBuffer(...input);
    const expected = [['#', 0xcc03f401 >> 0, 0x3cc01f4 >> 0]];

    expect(actual).toEqual(expected);
  });

  it('reads multiple glyphs with colors as numbers from entire buffer', () => {
    const input = [
      'number',
      new Uint8Array([
        0x00, 0x23, 0x03, 0xf4, 0x01, 0xcc, 0xcc, 0x01, 0xf4, 0x03, 0x03, 0xf4, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff,
        0xee, 0xdd
      ])
    ] as const;
    const actual = readGlyphsFromBuffer(...input);
    const expected = [
      ['#', 0xcc03f401 >> 0, 0x3cc01f4 >> 0],
      ['ϴ', 0xddaabbcc >> 0, 0xddeeffee >> 0]
    ];

    expect(actual).toEqual(expected);
  });

  it('reads multiple glyphs with colors as numbers from section of buffer', () => {
    const input = [
      'number',
      new Uint8Array([
        0xff, 0x00, 0x23, 0x03, 0xf4, 0x01, 0xcc, 0xcc, 0x01, 0xf4, 0x03, 0x03, 0xf4, 0xaa, 0xbb, 0xcc, 0xdd, 0xee,
        0xff, 0xee, 0xdd, 0xff
      ]),
      1,
      21
    ] as const;
    const actual = readGlyphsFromBuffer(...input);
    const expected = [
      ['#', 0xcc03f401 >> 0, 0x3cc01f4 >> 0],
      ['ϴ', 0xddaabbcc >> 0, 0xddeeffee >> 0]
    ];

    expect(actual).toEqual(expected);
  });

  it('reads single glyph with colors as #RGBA strings from entire buffer', () => {
    const input = ['#RGBA', new Uint8Array([0x00, 0x23, 0x03, 0xf4, 0x01, 0xcc, 0xcc, 0x01, 0xf4, 0x03])] as const;
    const actual = readGlyphsFromBuffer(...input);
    const expected = [['#', '#03F401CC', '#CC01F403']];

    expect(actual).toEqual(expected);
  });

  it('reads multiple glyphs with colors as #RGBA strings from entire buffer', () => {
    const input = [
      '#RGBA',
      new Uint8Array([
        0x00, 0x23, 0x03, 0xf4, 0x01, 0xcc, 0xcc, 0x01, 0xf4, 0x03, 0x03, 0xf4, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff,
        0xee, 0xdd
      ])
    ] as const;
    const actual = readGlyphsFromBuffer(...input);
    const expected = [
      ['#', '#03F401CC', '#CC01F403'],
      ['ϴ', '#AABBCCDD', '#EEFFEEDD']
    ];

    expect(actual).toEqual(expected);
  });

  it('reads multiple glyphs with colors as #RGBA strings from section of buffer', () => {
    const input = [
      '#RGBA',
      new Uint8Array([
        0xff, 0x00, 0x23, 0x03, 0xf4, 0x01, 0xcc, 0xcc, 0x01, 0xf4, 0x03, 0x03, 0xf4, 0xaa, 0xbb, 0xcc, 0xdd, 0xee,
        0xff, 0xee, 0xdd, 0xff
      ]),
      1,
      21
    ] as const;
    const actual = readGlyphsFromBuffer(...input);
    const expected = [
      ['#', '#03F401CC', '#CC01F403'],
      ['ϴ', '#AABBCCDD', '#EEFFEEDD']
    ];

    expect(actual).toEqual(expected);
  });

  it('reads single glyph with colors as rgba(...) strings from entire buffer', () => {
    const input = ['rgba', new Uint8Array([0x00, 0x23, 0x03, 0xf4, 0x01, 0xcc, 0xcc, 0x01, 0xf4, 0x03])] as const;
    const actual = readGlyphsFromBuffer(...input);
    const expected = [['#', 'rgba(3, 244, 1, 0.8)', 'rgba(204, 1, 244, 0.012)']];

    expect(actual).toEqual(expected);
  });

  it('reads multiple glyphs with colors as rgba(...) strings from entire buffer', () => {
    const input = [
      'rgba',
      new Uint8Array([
        0x00, 0x23, 0x03, 0xf4, 0x01, 0xcc, 0xcc, 0x01, 0xf4, 0x03, 0x03, 0xf4, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff,
        0xee, 0xdd
      ])
    ] as const;
    const actual = readGlyphsFromBuffer(...input);
    const expected = [
      ['#', 'rgba(3, 244, 1, 0.8)', 'rgba(204, 1, 244, 0.012)'],
      ['ϴ', 'rgba(170, 187, 204, 0.867)', 'rgba(238, 255, 238, 0.867)']
    ];

    expect(actual).toEqual(expected);
  });

  it('reads multiple glyphs with colors as rgba(...) strings from section of buffer', () => {
    const input = [
      'rgba',
      new Uint8Array([
        0xff, 0x00, 0x23, 0x03, 0xf4, 0x01, 0xcc, 0xcc, 0x01, 0xf4, 0x03, 0x03, 0xf4, 0xaa, 0xbb, 0xcc, 0xdd, 0xee,
        0xff, 0xee, 0xdd, 0xff
      ]),
      1,
      21
    ] as const;
    const actual = readGlyphsFromBuffer(...input);
    const expected = [
      ['#', 'rgba(3, 244, 1, 0.8)', 'rgba(204, 1, 244, 0.012)'],
      ['ϴ', 'rgba(170, 187, 204, 0.867)', 'rgba(238, 255, 238, 0.867)']
    ];

    expect(actual).toEqual(expected);
  });
});

describe('readStringFromBuffer', () => {
  it('is a function', () => {
    const input = readStringFromBuffer;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('throws an error when buffer length is zero', () => {
    const input = new Uint8Array(0);
    const actual = () => readStringFromBuffer(input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('throws an error when read length is not a multiple of 2', () => {
    const input = [new Uint8Array(8), 0, 3] as const;
    const actual = () => readStringFromBuffer(...input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('reads string from entire buffer', () => {
    const input = new Uint8Array([0x00, 0x23, 0x03, 0xf4, 0x00, 0x20, 0x00, 0x00]);
    const actual = readStringFromBuffer(input);
    const expected = '#ϴ \0';

    expect(actual).toEqual(expected);
  });

  it('reads string from section of buffer', () => {
    const input = new Uint8Array([0x00, 0x23, 0x03, 0xf4, 0x00, 0x20, 0x00, 0x00]);
    const actual = readStringFromBuffer(input, 2, 6);
    const expected = 'ϴ ';

    expect(actual).toEqual(expected);
  });
});

describe('writeCharLikeToBuffer', () => {
  it('is a function', () => {
    const input = writeCharLikeToBuffer;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('throws error when buffer length is zero', () => {
    const input = ['#', new Uint8Array(0)] as const;
    const actual = () => writeCharLikeToBuffer(...input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('throws error when string length is greater than buffer capacity', () => {
    const input = ['Hello', new Uint8Array(bytesPerChar)] as const;
    const actual = () => writeCharLikeToBuffer(...input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('throws error when start index will result in write out of bounds', () => {
    const input = ['#', new Uint8Array(bytesPerChar), 1] as const;
    const actual = () => writeCharLikeToBuffer(...input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('writes single number as UTF-16 bytes to buffer', () => {
    const input = [0x23, new Uint8Array(bytesPerChar)] as const;
    const actual = writeCharLikeToBuffer(...input);
    const expected = new Uint8Array([0x00, 0x23]);

    expect(actual).toEqual(expected);
  });

  it('writes single number as UTF-16 bytes to buffer with start offset', () => {
    const input = [0x23, new Uint8Array([0xff, 0xff, 0x00, 0x00]), 2] as const;
    const actual = writeCharLikeToBuffer(...input);
    const expected = new Uint8Array([0xff, 0xff, 0x00, 0x23]);

    expect(actual).toEqual(expected);
  });

  it('writes single string character as UTF-16 bytes to buffer', () => {
    const input = ['#', new Uint8Array(bytesPerChar)] as const;
    const actual = writeCharLikeToBuffer(...input);
    const expected = new Uint8Array([0x00, 0x23]);

    expect(actual).toEqual(expected);
  });

  it('writes multiple string characters as UTF-16 bytes to buffer with start offset', () => {
    const input = ['Hi', new Uint8Array(3 * bytesPerChar), 1] as const;
    const actual = writeCharLikeToBuffer(...input);
    const expected = new Uint8Array([0x00, 0x00, 0x48, 0x00, 0x69, 0x00]);

    expect(actual).toEqual(expected);
  });
});

describe('writeColorLikeToBuffer', () => {
  it('is a function', () => {
    const input = writeColorLikeToBuffer;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('throws error when buffer length is zero', () => {
    const input = ['#AAAA', new Uint8Array(0)] as const;
    const actual = () => writeColorLikeToBuffer(...input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('throws error when color length is greater than buffer capacity', () => {
    const input = ['#AAAA', new Uint8Array(2)] as const;
    const actual = () => writeColorLikeToBuffer(...input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('throws error when start index will result in write out of bounds', () => {
    const input = ['#AAAA', new Uint8Array(bytesPerColor), 1] as const;
    const actual = () => writeColorLikeToBuffer(...input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('throws error when colorlike type is invalid', () => {
    const input = [null, new Uint8Array(bytesPerColor)] as const;
    const actual = () => writeColorLikeToBuffer(...input);
    const expected = 'Invalid colorlike type at index 0';

    expect(actual).toThrow(expected);
  });

  it('throws error when colorlike is invalid color string', () => {
    const input = ['failit', new Uint8Array(bytesPerColor)] as const;
    const actual = () => writeColorLikeToBuffer(...input);
    const expected = `Invalid color string at index 0; color: ${input[0]}`;

    expect(actual).toThrow(expected);
  });

  it('writes single number representation (0xRRGGBB) to buffer', () => {
    const input = [0xfffff, new Uint8Array(bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0x0f, 0xff, 0xff, 0xff]);

    expect(actual).toEqual(expected);
  });

  it('writes single number representation (0xAARRGGBB) to buffer', () => {
    const input = [0xf40fffff, new Uint8Array(bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0x0f, 0xff, 0xff, 0xf4]);

    expect(actual).toEqual(expected);
  });

  it('writes multiple number representations (0xRRGGBB & 0xRRGGBBAA) to buffer', () => {
    const input = [[0xfffff, 0xf40fffff] as ColorLike[], new Uint8Array(2 * bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0x0f, 0xff, 0xff, 0xff, 0x0f, 0xff, 0xff, 0xf4]);

    expect(actual).toEqual(expected);
  });

  it('writes multiple number representations (0xRRGGBB & 0xRRGGBBAA) to buffer with start offset', () => {
    const input = [[0xfffff, 0xf40fffff] as ColorLike[], new Uint8Array(2 * bytesPerColor + 2), 1] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0x00, 0x0f, 0xff, 0xff, 0xff, 0x0f, 0xff, 0xff, 0xf4, 0x00]);

    expect(actual).toEqual(expected);
  });

  it('writes single string representation (#RGB) to buffer', () => {
    const input = ['#abc', new Uint8Array(bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0xaa, 0xbb, 0xcc, 0xff]);

    expect(actual).toEqual(expected);
  });

  it('writes single string representation (#RGBA) to buffer', () => {
    const input = ['#abcd', new Uint8Array(bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]);

    expect(actual).toEqual(expected);
  });

  it('writes single string representation (#RRGGBB) to buffer', () => {
    const input = ['#abcdef', new Uint8Array(bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0xab, 0xcd, 0xef, 0xff]);

    expect(actual).toEqual(expected);
  });

  it('writes single string representation (#RRGGBBAA) to buffer', () => {
    const input = ['#abcdefed', new Uint8Array(bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0xab, 0xcd, 0xef, 0xed]);

    expect(actual).toEqual(expected);
  });

  it('writes single string representation (CSS color name) to buffer', () => {
    const input = ['blue', new Uint8Array(bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0x00, 0x00, 0xff, 0xff]);

    expect(actual).toEqual(expected);
  });

  it('writes single string representation (rgb(...)) to buffer', () => {
    const input = ['rgb(170, 187, 204)', new Uint8Array(bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0xaa, 0xbb, 0xcc, 0xff]);

    expect(actual).toEqual(expected);
  });

  it('writes single string representation (rgba(...)) to buffer', () => {
    const input = ['rgba(170, 187, 204, 0.25)', new Uint8Array(bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0xaa, 0xbb, 0xcc, 0x40]);

    expect(actual).toEqual(expected);
  });

  it('writes multiple string representations (#RGB, #RGBA, #RRGGBB, #RRGGBBAA, CSS color name, rgb(...), & rgba(...)) to buffer', () => {
    const input = [
      [
        '#abc',
        '#abcd',
        '#abcdef',
        '#abcdefed',
        'blue',
        'rgb(170, 187, 204)',
        'rgba(170, 187, 204, 0.25)'
      ] as ColorLike[],
      new Uint8Array(7 * bytesPerColor)
    ] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([
      0xaa, 0xbb, 0xcc, 0xff, 0xaa, 0xbb, 0xcc, 0xdd, 0xab, 0xcd, 0xef, 0xff, 0xab, 0xcd, 0xef, 0xed, 0x00, 0x00, 0xff,
      0xff, 0xaa, 0xbb, 0xcc, 0xff, 0xaa, 0xbb, 0xcc, 0x40
    ]);

    expect(actual).toEqual(expected);
  });

  it('writes multiple string representations (#RGB, #RGBA, #RRGGBB, #RRGGBBAA, CSS color name, rgb(...), & rgba(...)) to buffer with start offset', () => {
    const input = [
      [
        '#abc',
        '#abcd',
        '#abcdef',
        '#abcdefed',
        'blue',
        'rgb(170, 187, 204)',
        'rgba(170, 187, 204, 0.25)'
      ] as ColorLike[],
      new Uint8Array(7 * bytesPerColor + 2),
      1
    ] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([
      0x00, 0xaa, 0xbb, 0xcc, 0xff, 0xaa, 0xbb, 0xcc, 0xdd, 0xab, 0xcd, 0xef, 0xff, 0xab, 0xcd, 0xef, 0xed, 0x00, 0x00,
      0xff, 0xff, 0xaa, 0xbb, 0xcc, 0xff, 0xaa, 0xbb, 0xcc, 0x40, 0x00
    ]);

    expect(actual).toEqual(expected);
  });

  it('writes single Phaser.Display.Color instance to buffer (no explicit alpha)', () => {
    const input = [new Phaser.Display.Color(15, 255, 255), new Uint8Array(bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0x0f, 0xff, 0xff, 0xff]);

    expect(actual).toEqual(expected);
  });

  it('writes single Phaser.Display.Color instance to buffer (explicit alpha)', () => {
    const input = [new Phaser.Display.Color(15, 255, 255, 15), new Uint8Array(bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0x0f, 0xff, 0xff, 0x0f]);

    expect(actual).toEqual(expected);
  });

  it('writes single Phaser.Types.Display.ColorObject | Phaser.Types.Display.InputColorObject to buffer (no explicit values)', () => {
    const input = [{}, new Uint8Array(bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0x00, 0x00, 0x00, 0xff]);

    expect(actual).toEqual(expected);
  });

  it('writes single Phaser.Types.Display.ColorObject | Phaser.Types.Display.InputColorObject to buffer (explicit values)', () => {
    const input = [{ r: 15, g: 255, b: 255, a: 15 }, new Uint8Array(bytesPerColor)] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0x0f, 0xff, 0xff, 0x0f]);

    expect(actual).toEqual(expected);
  });

  it('writes multiple color objects/instances to buffer', () => {
    const input = [
      [new Phaser.Display.Color(15, 255, 255, 15), {}, { r: 15, g: 255, b: 255, a: 15 }] as ColorLike[],
      new Uint8Array(3 * bytesPerColor)
    ] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([0x0f, 0xff, 0xff, 0x0f, 0x00, 0x00, 0x00, 0xff, 0x0f, 0xff, 0xff, 0x0f]);

    expect(actual).toEqual(expected);
  });

  it('writes multiple color objects/instances to buffer with start offset', () => {
    const input = [
      [new Phaser.Display.Color(15, 255, 255, 15), {}, { r: 15, g: 255, b: 255, a: 15 }] as ColorLike[],
      new Uint8Array(3 * bytesPerColor + 2),
      1
    ] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([
      0x00, 0x0f, 0xff, 0xff, 0x0f, 0x00, 0x00, 0x00, 0xff, 0x0f, 0xff, 0xff, 0x0f, 0x00
    ]);

    expect(actual).toEqual(expected);
  });

  it('writes multiple colorlike types to buffer', () => {
    const input = [
      [
        new Phaser.Display.Color(15, 255, 255, 15),
        {},
        { r: 15, g: 255, b: 255, a: 15 },
        '#abc',
        '#abcd',
        '#abcdef',
        '#abcdefed',
        'blue',
        'rgb(170, 187, 204)',
        'rgba(170, 187, 204, 0.25)',
        0xfffff,
        0xf40fffff
      ] as ColorLike[],
      new Uint8Array(12 * bytesPerColor)
    ] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([
      0x0f, 0xff, 0xff, 0x0f, 0x00, 0x00, 0x00, 0xff, 0x0f, 0xff, 0xff, 0x0f, 0xaa, 0xbb, 0xcc, 0xff, 0xaa, 0xbb, 0xcc,
      0xdd, 0xab, 0xcd, 0xef, 0xff, 0xab, 0xcd, 0xef, 0xed, 0x00, 0x00, 0xff, 0xff, 0xaa, 0xbb, 0xcc, 0xff, 0xaa, 0xbb,
      0xcc, 0x40, 0x0f, 0xff, 0xff, 0xff, 0x0f, 0xff, 0xff, 0xf4
    ]);

    expect(actual).toEqual(expected);
  });

  it('writes multiple colorlike types to buffer with start offset', () => {
    const input = [
      [
        new Phaser.Display.Color(15, 255, 255, 15),
        {},
        { r: 15, g: 255, b: 255, a: 15 },
        '#abc',
        '#abcd',
        '#abcdef',
        '#abcdefed',
        'blue',
        'rgb(170, 187, 204)',
        'rgba(170, 187, 204, 0.25)',
        0xfffff,
        0xf40fffff
      ] as ColorLike[],
      new Uint8Array(12 * bytesPerColor + 2),
      1
    ] as const;
    const actual = writeColorLikeToBuffer(...input);
    const expected = new Uint8Array([
      0x00, 0x0f, 0xff, 0xff, 0x0f, 0x00, 0x00, 0x00, 0xff, 0x0f, 0xff, 0xff, 0x0f, 0xaa, 0xbb, 0xcc, 0xff, 0xaa, 0xbb,
      0xcc, 0xdd, 0xab, 0xcd, 0xef, 0xff, 0xab, 0xcd, 0xef, 0xed, 0x00, 0x00, 0xff, 0xff, 0xaa, 0xbb, 0xcc, 0xff, 0xaa,
      0xbb, 0xcc, 0x40, 0x0f, 0xff, 0xff, 0xff, 0x0f, 0xff, 0xff, 0xf4, 0x00
    ]);

    expect(actual).toEqual(expected);
  });
});

describe('writeGlyphsToBuffer', () => {
  it('is a function', () => {
    const input = writeGlyphsToBuffer;
    const actual = typeof input;
    const expected = 'function';

    expect(actual).toEqual(expected);
  });

  it('throws error when buffer length is zero', () => {
    const input = [[['#', '#AAAA', '#AAAA']] as GlyphLike[], new Uint8Array(0)] as const;
    const actual = () => writeGlyphsToBuffer(...input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('throws error when glyph length is greater than buffer capacity', () => {
    const input = [[['#', '#AAAA', '#AAAA']] as GlyphLike[], new Uint8Array(7)] as const;
    const actual = () => writeGlyphsToBuffer(...input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('throws error when start index will result in write out of bounds', () => {
    const input = [[['#', '#AAAA', '#AAAA']] as GlyphLike[], new Uint8Array(bytesPerGlyph), 1] as const;
    const actual = () => writeGlyphsToBuffer(...input);
    const expected = undefined;

    expect(actual).toThrow(expected);
  });

  it('writes glyphs to buffer', () => {
    const input = [
      [
        ['#', '#0ffffff4', 0x0f0f0f0f],
        ['ϴ', 'rgba(15, 15, 15, 0.25)', '#AbC'],
        [' ', '#FFF']
      ] as GlyphLike[],
      new Uint8Array(3 * bytesPerGlyph)
    ] as const;
    const actual = writeGlyphsToBuffer(...input);
    const expected = new Uint8Array([
      0x00, 0x23, 0x0f, 0xff, 0xff, 0xf4, 0x0f, 0x0f, 0x0f, 0x0f, 0x03, 0xf4, 0x0f, 0x0f, 0x0f, 0x40, 0xaa, 0xbb, 0xcc,
      0xff, 0x00, 0x20, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00
    ]);

    expect(actual).toEqual(expected);
  });

  it('writes glyphs to buffer with start offset', () => {
    const input = [
      [
        ['#', '#0ffffff4', 0x0f0f0f0f],
        ['ϴ', 'rgba(15, 15, 15, 0.25)', '#AbC'],
        [' ', '#FFF']
      ] as GlyphLike[],
      new Uint8Array(3 * bytesPerGlyph + 2),
      1
    ] as const;
    const actual = writeGlyphsToBuffer(...input);
    const expected = new Uint8Array([
      0x00, 0x00, 0x23, 0x0f, 0xff, 0xff, 0xf4, 0x0f, 0x0f, 0x0f, 0x0f, 0x03, 0xf4, 0x0f, 0x0f, 0x0f, 0x40, 0xaa, 0xbb,
      0xcc, 0xff, 0x00, 0x20, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    expect(actual).toEqual(expected);
  });
});

describe('Font', () => {
  it('instantiates', () => {
    const input = [10, 'monospace'] as const;
    const actual = new Font(...input) instanceof Font;
    const expected = true;

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
