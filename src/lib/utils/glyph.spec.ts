import { getGlyphBytes, getGlyphCanvasData } from './glyph';

describe('Glyph', () => {
  describe('getGlyphBytes', () => {
    it('is a function', () => expect(typeof getGlyphBytes).toEqual('function'));
  });

  describe('getGlyphCanvasData', () => {
    it('is a function', () => expect(typeof getGlyphCanvasData).toEqual('function'));
  });
});
