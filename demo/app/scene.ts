import type { GlyphLike, GlyphmapGameObject } from '../../src';
import { Font, GlyphGameObject, GlyphPlugin } from '../../src';

import { Entity, EntityType } from './state';
import { getAppStartParams } from './utils';

const renderableData = {
  player: ['@', '#FFF'] as GlyphLike,
  wall: ['#', '#EEE', '#5555'] as GlyphLike,
  floor: ['·', '#EEE'] as GlyphLike,
  money: ['$', '#D4AF37'] as GlyphLike,
  jabronie: ['J', '#F0F'] as GlyphLike
} as const;

// 11 x 11
const terrainMap = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
] as const;

const appStartParams = getAppStartParams();

export class Scene extends GlyphPlugin.GlyphScene('glyph', class extends Phaser.Scene {}) {
  font = new Font(
    appStartParams.fontSize,
    appStartParams.fontFamily,
    appStartParams.fontWeight,
    appStartParams.fontStyle,
    appStartParams.fontVariant
  );

  forceSquareRatio = appStartParams.forceSquareRatio;

  glyphmap: GlyphmapGameObject;

  player: GlyphGameObject;

  jabronies: Phaser.GameObjects.Group;

  screenZone: Phaser.GameObjects.Zone;

  playZone: Phaser.GameObjects.Zone;

  domZone: Phaser.GameObjects.Zone;

  demoToolsDom: Phaser.GameObjects.DOMElement;

  pointerCellMarker: Phaser.GameObjects.Graphics;

  init() {
    this.screenZone = this.add.zone(0, 0, this.game.canvas.width, this.game.canvas.height).setOrigin(0);
    this.playZone = this.add.zone(0, 0, this.screenZone.width - 300, this.screenZone.height).setOrigin(0);
    this.domZone = this.add.zone(0, 0, this.screenZone.width - 500, this.screenZone.height).setOrigin(0);

    Phaser.Display.Align.In.LeftCenter(this.playZone, this.screenZone);
    Phaser.Display.Align.In.RightCenter(this.domZone, this.screenZone);
  }

  create() {
    this.createMap().createPointerCellMarker().createPlayer().createJabronies().createDemoTools();
  }

  update() {
    this.updatePointerCellMarkerPosition();
  }

  private createDemoTools() {
    const div = document.createElement('div');
    div.id = 'demoTools';

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    div.innerHTML = require('../assets/demo-tools.html').default;

    this.demoToolsDom = this.add.dom(
      0,
      0,
      div,
      `
        width: ${this.domZone.width}px;
        height: ${this.domZone.height}px;
        text-align: center;
        background-color: #333
      `
    );

    Phaser.Display.Align.In.Center(this.demoToolsDom, this.domZone);

    document.getElementById('fontSizeInput').setAttribute('value', this.font.size.toString());
    document.getElementById('fontFamilyInput').innerText = this.font.family; // .setAttribute('value', this.font.family);

    for (const option of document.getElementById('fontWeightSelect').getElementsByTagName('option')) {
      if (option.value === this.font.weight) {
        option.setAttribute('selected', 'selected');
        break;
      }
    }

    for (const option of document.getElementById('fontStyleSelect').getElementsByTagName('option')) {
      if (option.value === this.font.style) {
        option.setAttribute('selected', 'selected');
        break;
      }
    }

    for (const option of document.getElementById('fontVariantSelect').getElementsByTagName('option')) {
      if (option.value === this.font.variant) {
        option.setAttribute('selected', 'selected');
        break;
      }
    }

    (document.getElementById('forceSquareRatioCheckBox') as HTMLInputElement).checked = this.forceSquareRatio;

    document
      .getElementById('measurementChInput')
      .setAttribute('value', String.fromCodePoint(this.glyph.measurementCodePoint));

    (document.getElementById('advancedTextMetricsCheckBox') as HTMLInputElement).checked =
      this.glyph.advancedTextMetrics;

    for (const option of document.getElementById('rendererSelect').getElementsByTagName('option')) {
      if (
        (option.value === 'auto' && this.game.config.renderType === Phaser.AUTO) ||
        (option.value === 'canvas' && this.game.config.renderType === Phaser.CANVAS) ||
        (option.value === 'webgl' && this.game.config.renderType === Phaser.WEBGL)
      ) {
        option.setAttribute('selected', 'selected');
        break;
      }
    }

    return this;
  }

  private createJabronies() {
    this.jabronies = this.add.group({
      classType: GlyphGameObject,
      maxSize: 2,
      createCallback: (g: GlyphGameObject) => g.setForceSquareRatio(this.forceSquareRatio).setFont(this.font)
    });

    const data: Entity[] = [];

    for (const id of appStartParams.state.ids) {
      if (appStartParams.state.entities[id].type === EntityType.Jabronie) {
        data.push(appStartParams.state.entities[id]);
      }
    }

    if (!data.length) {
      throw new Error('No jabronie data found');
    }

    data.forEach((d) => {
      const [cellX, cellY] = d.position;
      const [x, y] = this.glyphmap.cellToWorldXY(cellX, cellY, 0.5);

      (this.jabronies.get() as GlyphGameObject).setGlyph(renderableData.jabronie).setPosition(x, y).setName(`${d.id}`);

      this.glyphmap.erase(cellX, cellY);
    });

    return this;
  }

  private createMap() {
    this.glyphmap = this.add.glyphmap(0, 0, terrainMap[0].length, terrainMap.length, this.font, this.forceSquareRatio);

    let y = 0;

    for (const row of terrainMap) {
      let x = 0;

      for (const terrainId of row) {
        this.glyphmap.draw(x, y, [terrainId === 1 ? renderableData.wall : renderableData.floor]);
        ++x;
      }

      ++y;
    }

    Phaser.Display.Align.In.Center(this.glyphmap, this.playZone);

    const data: Entity[] = [];

    for (const id of appStartParams.state.ids) {
      if (appStartParams.state.entities[id].type === EntityType.Gold) {
        data.push(appStartParams.state.entities[id]);
      }
    }

    data.forEach((d) => {
      const [cellX, cellY] = d.position;
      this.glyphmap.draw(cellX, cellY, [renderableData.money]);
    });

    return this;
  }

  private createPlayer() {
    let data: Entity;

    for (const id of appStartParams.state.ids) {
      if (appStartParams.state.entities[id].type === EntityType.Player) {
        data = appStartParams.state.entities[id];
        break;
      }
    }

    if (!data) {
      throw new Error('No player data found');
    }

    const [cellX, cellY] = data.position;
    const [x, y] = this.glyphmap.cellToWorldXY(cellX, cellY, 0.5);

    this.player = this.add.glyph(x, y, renderableData.player, this.font, this.forceSquareRatio);
    this.glyphmap.erase(cellX, cellY);

    this.tweens.add({
      targets: this.player,
      scaleX: { value: 1.2, duration: 1250, ease: 'Linear', yoyo: true, repeat: -1 },
      scaleY: { value: 1.1, duration: 1250, ease: 'Linear', yoyo: true, repeat: -1 }
    });

    return this;
  }

  private createPointerCellMarker() {
    this.pointerCellMarker = this.add.graphics();
    return this.updatePointerCellMarkerStroke();
  }

  private updatePointerCellMarkerPosition() {
    const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

    if (!this.glyphmap.getBounds().contains(worldPoint.x, worldPoint.y)) {
      return;
    }

    // Rounds down to nearest cell.
    const pointerCellX = this.glyphmap.worldToCellX(worldPoint.x);
    const pointerCellY = this.glyphmap.worldToCellY(worldPoint.y);

    // Snap to cell coordinates, but in world space.
    this.pointerCellMarker.x = this.glyphmap.cellToWorldX(pointerCellX);
    this.pointerCellMarker.y = this.glyphmap.cellToWorldY(pointerCellY);

    return this;
  }

  private updatePointerCellMarkerStroke() {
    this.pointerCellMarker
      .clear()
      .lineStyle(2, 0xffff00, 1)
      .strokeRect(
        0,
        0,
        this.glyphmap.cellWidth * this.glyphmap.scaleX,
        this.glyphmap.cellHeight * this.glyphmap.scaleY
      );

    return this;
  }
}
