import { Player } from "../models/player.js";

export class GameController {
  #games;
  #createGame;
  #pawns;
  constructor(createGame, pawns) {
    this.#createGame = createGame;
    this.#pawns = pawns;
    this.#games = {};
  }

  static create(createGame, createPawns) {
    if (typeof createGame !== "function") {
      throw new Error("Create Game Shold be valid function");
    }

    const pawns = createPawns();
    return new GameController(createGame, pawns);
  }

  #findPawn(name) {
    return this.#pawns.find((pawn) => pawn.getPawnData().name === name);
  }

  startGame(gameId, allPlayers) {
    const game = this.#createGame(gameId, this.#pawns);
    this.#games[gameId] = game;

    for (const { id, isHost, name, character } of allPlayers) {
      const playerInstance = new Player(id, name, isHost);
      const pawn = this.#findPawn(character.name);
      game.addPlayer(playerInstance, pawn);
    }

    game.start();
  }

  getGameState(gameId) {
    return this.#games[gameId].getState();
  }
}
