/**
 * Entity type enumeration.
 */
export enum EntityType {
  Player,
  Jabronie,
  Gold
}

/**
 * Entity data model.
 */
export interface Entity {
  id: number;
  type: EntityType;
  position: [number, number];
  data?: Record<string, unknown>;
}

/**
 * Game state data model.
 */
export interface State {
  turnsCompleted: number;
  ids: number[];
  entities: Record<number, Entity>;
}

/**
 * Default game state.
 */
export const defaultState: State = {
  turnsCompleted: 0,
  ids: [0, 1, 2, 3, 4],
  entities: {
    0: {
      id: 0,
      type: EntityType.Player,
      position: [5, 5],
      data: {
        gold: 0
      }
    },
    1: {
      id: 1,
      type: EntityType.Jabronie,
      position: [2, 2]
    },
    2: {
      id: 2,
      type: EntityType.Jabronie,
      position: [8, 8]
    },
    3: {
      id: 3,
      type: EntityType.Gold,
      position: [8, 2]
    },
    4: {
      id: 4,
      type: EntityType.Gold,
      position: [2, 8]
    }
  }
};
