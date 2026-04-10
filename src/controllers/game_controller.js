import { Player } from "../models/player.js";
import { ValidationError } from "../utils/custom_errors.js";

export class GameController {
  #games;
  #createGame;

  constructor(createGame) {
    this.#createGame = createGame;
    this.#games = {};
  }

  static create(createGame) {
    if (typeof createGame !== "function") {
      throw new Error("Create Game Shold be valid function");
    }

    return new GameController(createGame);
  }

  startGame(gameId, allPlayers) {
    const game = this.#createGame(gameId);
    this.#games[gameId] = game;

    for (const { id, isHost, name, character } of allPlayers) {
      const playerInstance = new Player(id, name, isHost);
      game.addPlayer(playerInstance, character);
    }

    game.start();
  }

  getGameState(gameId, playerId) {
    const game = this.#games[gameId];
    if (!game) throw new ValidationError("Invalid game id");
    return game.getState(playerId);
  }

  getDisprovablePlayer(gameId) {
    return this.#games[gameId].getDisprovablePlayer();
  }

  getSuspicionCombination(gameId) {
    return this.#games[gameId].getSuspectCombination();
  }

  rollDice(gameId, randomFn, ceilFn) {
    const game = this.#games[gameId];
    return game.rollDice(randomFn, ceilFn);
  }

  getReachableNodes(gameId, position, steps) {
    const game = this.#games[gameId];
    return game.getReachableNodes(position, steps);
  }

  getDiceValue(gameId) {
    const game = this.#games[gameId];
    return game.getDiceValue();
  }

  movePawn(gameId, playerId, newNodeId, pos) {
    const game = this.#games[gameId];
    return game.movePawn(playerId, newNodeId, pos);
  }

  useSecretPassage(gameId, playerId) {
    const game = this.#games[gameId];
    return game.useSecretPassage(playerId);
  }

  accuse(gameId, { suspect, weapon, room }) {
    const game = this.#games[gameId];
    return game.accuse({ suspect, weapon, room });
  }

  updateTurn(gameId) {
    return this.#games[gameId].updateTurn();
  }

  addSuspicion(gameId, playerId, suspicion) {
    const game = this.#games[gameId];
    game.addSuspicion(playerId, suspicion);
  }

  hasSuspected(gameId) {
    return this.#games[gameId].hasSuspected();
  }

  isValidDisproval({ currentPlayer, suspicionCombo }, disprove) {
    return (
      Object.values(suspicionCombo)?.includes(disprove) &&
      currentPlayer?.hand.includes(disprove)
    );
  }

  confirmDisproval(gameId, playerId, disprove) {
    const game = this.#games[gameId];
    if (!this.isValidDisproval(game.getState(playerId), disprove)) {
      throw new ValidationError(`${disprove}: not valid card`);
    }
    game.addDisprovedCard(disprove);
    return { status: true };
  }

  isRollAllowed(gameId, playerId) {
    const gameState = this.#games[gameId].getState(playerId);
    return gameState.canRoll;
  }

  isValidLobby(gameId) {
    return gameId in this.#games;
  }

  getDisprovedCard(gameId) {
    const game = this.#games[gameId];
    const card = game.getDisprovedCard();
    return { card };
  }

  getActivePlayer(gameId) {
    const game = this.#games[gameId];
    return game.getActivePlayer();
  }
}
