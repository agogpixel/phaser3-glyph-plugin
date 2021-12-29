import { getChar, getCharBytes } from './char';

describe('Char', () => {
  describe('getCharBytes', () => {
    it('is a function', () => expect(typeof getCharBytes).toEqual('function'));
  });

  describe('getChar', () => {
    it('is a function', () => expect(typeof getChar).toEqual('function'));
  });
});
