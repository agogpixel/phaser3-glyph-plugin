import { phaserFactory } from './phaser-factory';

describe('Phaser Factory', () => {
  afterAll(() => delete global.Phaser);

  it('is a function', () => expect(typeof phaserFactory).toBe('function'));

  it('creates Phaser namespace object with global scope', () =>
    phaserFactory().then((p) => {
      expect(p).toBeTruthy();
      expect(typeof p).toBe('object');
      expect(global.Phaser).toBeTruthy();
      expect(typeof global.Phaser).toBe('object');
    }));
});
