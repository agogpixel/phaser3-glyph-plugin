import './styles/styles.scss';

// Bootstrap the application.
(async function bootstrap() {
  // Dynamically build Phaser from current npm package.
  const { phaserFactory } = await import(/* webpackChunkName: "phaser" */ './phaser');
  await phaserFactory();

  // Run the application.
  const { app } = await import(/* webpackChunkName: "app" */ './app');
  await app();
})();
