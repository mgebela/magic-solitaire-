import { Assets, Container, Sprite } from 'pixi.js';
import { BOARD_HEIGHT, BOARD_WIDTH } from './layout-positions';

/**
 * Photographic jungle table — moss field and weathered limestone slab.
 */
export async function drawMagicTableBackground(): Promise<Container> {
  const texture = await Assets.load('/textures/space-towers-table.png');
  const root = new Container();
  const table = new Sprite(texture);
  table.width = BOARD_WIDTH;
  table.height = BOARD_HEIGHT;
  root.addChild(table);
  return root;
}
