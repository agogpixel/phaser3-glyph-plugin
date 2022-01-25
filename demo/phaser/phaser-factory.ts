import { phaser } from './phaser';

/**
 * Load the Phaser namespace with global scope.
 */
export async function phaserFactory(): Promise<typeof Phaser> {
  return phaser() as unknown as Promise<typeof Phaser>;
}
