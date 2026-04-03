import { isInRange, isInsideBoundary } from "../utils/board_utils.js";

export class Board {
  #config;
  #graph;
  #secretPassages;
  #startingPositionsIds;

  constructor(boardConfig) {
    this.#config = boardConfig;
    this.#secretPassages = boardConfig.secretPassages;
    this.#graph = {};
    this.#startingPositionsIds = [];
  }

  #getTileId(x, y) {
    return `tile-${x}-${y}`;
  }

  #getRoomRanges() {
    return Object.values(this.#config.rooms).flatMap((room) => room.areas);
  }

  #getBoundaryRanges() {
    return this.#config.walls;
  }

  #getAdjacent({ x, y }) {
    const adj = [];

    const left = { x: x - 1, y };
    const right = { x: x + 1, y };
    const top = { x, y: y - 1 };
    const bottom = { x, y: y + 1 };

    const invalidRanges = this.#getInvalidRanges();

    for (const position of [left, right, top, bottom]) {
      const isTile = this.#isTileArea(position, invalidRanges);

      if (isTile && isInsideBoundary(position, this.#config.size)) {
        const id = this.#getTileId(position.x, position.y);
        adj.push(id);
      }
    }

    return adj;
  }

  #createTile(x, y) {
    const startingPositions = this.#startingPositionsIds;
    const id = this.#getTileId(x, y);

    this.#graph[id] = {
      type: "tile",
      isOccupied: startingPositions.includes(id),
      adj: this.#getAdjacent({ x, y }),
    };
  }

  #isTileArea(position, ranges) {
    return !ranges.some(({ start, end }) => isInRange(position, start, end));
  }

  #getInvalidRanges() {
    const roomRanges = this.#getRoomRanges();
    const boundaryRanges = this.#getBoundaryRanges();

    return [...roomRanges, ...boundaryRanges].flat(Infinity);
  }

  #addAdjacents() {
    for (const room of Object.values(this.#config.rooms)) {
      room.doors.forEach(({ x, y }) => {
        const tile = this.#getTileId(x, y);

        if (this.#graph[tile]) {
          this.#graph[tile].adj.push(room.id);
        }
      });
    }
  }

  #buildTiles(height, width) {
    const invalidRanges = this.#getInvalidRanges();
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const isTile = this.#isTileArea({ x: col, y: row }, invalidRanges);

        if (isTile) {
          this.#createTile(col, row);
        }
      }
    }
  }

  #buildRooms(rooms) {
    for (const room of rooms) {
      this.#graph[room.id] = {
        type: "room",
        secretPassage: this.#config.secretPassages[room.id],
        adj: room.doors.map(({ x, y }) => this.#getTileId(x, y)),
      };
    }
  }

  #build() {
    this.#startingPositionsIds = Object.values(
      this.#config.startingPositions,
    ).map(({ x, y }) => this.#getTileId(x, y));

    this.#buildRooms(Object.values(this.#config.rooms));
    this.#buildTiles(this.#config.size.height, this.#config.size.width);
    this.#addAdjacents();
  }

  static create(boardConfig) {
    const board = new Board(boardConfig);
    board.#build();
    return board;
  }

  getGraph() {
    return this.#graph;
  }

  getReachableNodes(from, steps, start = from, visited = [], res = new Set()) {
    const graph = this.getGraph();

    if (graph[from]?.isOccupied && start !== from) return [];

    if ((start !== from && graph[from]?.type === "room") || steps === 0) {
      res.add(from);
      return Array.from(res);
    }

    const unVisitedTiles = graph[from].adj
      .filter((tile) => !visited.includes(tile))
      .filter((tile) => !graph[tile]?.isOccupied);

    for (const tile of unVisitedTiles) {
      this.getReachableNodes(tile, steps - 1, start, [...visited, from], res);
    }

    return Array.from(res);
  }

  toggleIsOccupied(nodeId) {
    this.#graph[nodeId].isOccupied = !this.#graph[nodeId].isOccupied;
  }

  getSecretPassages() {
    return this.#secretPassages;
  }
}
