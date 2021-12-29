import { getColorBytes, getCssRGBA } from './color';

describe('Color', () => {
  describe('getColorBytes', () => {
    it('is a function', () => expect(typeof getColorBytes).toEqual('function'));
  });

  describe('getCssRGBA', () => {
    it('is a function', () => expect(typeof getCssRGBA).toEqual('function'));
  });
});
