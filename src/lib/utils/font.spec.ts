import { Font } from './font';

describe('Font', () => {
  let font: Font;

  it('instantiates', () => {
    font = new Font(10, 'monospace');
    expect(font).toBeTruthy();
    expect(font instanceof Font).toEqual(true);
  });
});
