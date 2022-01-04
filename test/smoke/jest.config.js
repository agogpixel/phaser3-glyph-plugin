module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  setupFiles: ['jest-webgl-canvas-mock'],
  verbose: true
};
