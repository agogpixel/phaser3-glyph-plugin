import './styles/styles.scss';

(async function bootstrap() {
  const { phaserFactory } = await import(/* webpackChunkName: "phaser" */ './phaser');
  await phaserFactory();

  const { app } = await import(/* webpackChunkName: "app" */ './app');
  await app();
})();
