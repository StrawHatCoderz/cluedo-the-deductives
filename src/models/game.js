import { shuffle } from "@std/random";
import { Player } from "./player.js";
import { Turn } from "./turn.js";

export class Game {
  #turnNum;
  #turn;
  #states = ["waiting", "setup", "running", "finished"];
  #gameState;
  #id;
  #board;
  #pawns;
  #pawnsToAssign;
  #deck;
  #players;
  #turnOrder;
  #activePlayer;
  #shuffle;
  constructor(id, board, pawns, deck, shuffleFn = shuffle) {
    this.#gameState = this.#states.shift();
    this.#id = id;
    this.#board = board;
    this.#pawns = pawns;
    this.#deck = deck;
    this.#players = {};
    this.#shuffle = shuffleFn;
    this.#pawnsToAssign = shuffleFn(pawns);
    this.#turnNum = 0;
  }

  start() {
    const totalPlayers = Object.keys(this.#players).length;

    if (totalPlayers < 3 || totalPlayers > 6) {
      throw new Error("Invalid player count");
    }

    this.#distributeCards();
    this.#setTurnOrder();
    this.#setCurrentPlayer();
    this.changeCurrentState();
  }

  updateTurn() {
    if (this.#gameState !== "running") {
      throw new Error("Game hasn't started yet");
    }

    this.#activePlayer =
      this.#turnOrder[this.#turnNum++ % this.#turnOrder.length];

    if (this.#activePlayer.getPlayerData().isEliminated) {
      this.updateTurn();
    }

    this.#turn = new Turn(this.#activePlayer);

    return this.#activePlayer.getPlayerData();
  }

  #findPlayer(playerId) {
    return this.#players[playerId]?.getPlayerData();
  }

  getState() {
    const playerId = this.#activePlayer?.getPlayerData().id;

    return {
      state: this.#gameState,
      players: this.#getAllPlayers(),
      hand: this.#findPlayer(playerId)?.hand,
      pawns: this.#getAllPawns(),
      activePlayer: this.#activePlayer?.getPlayerData(),
      canRoll: this.#isRollAllowed(playerId),
      secretPassageId: this.#getSecretPassageId(playerId),
      canSuspect: this.canSuspect(),
    };
  }

  changeCurrentState() {
    this.#gameState = this.#states.shift();
  }

  #setCurrentPlayer() {
    this.#activePlayer = this.#turnOrder[0];
    this.#turn = new Turn(this.#activePlayer);
  }

  getCurrentPlayer() {
    return this.#activePlayer;
  }

  #setTurnOrder() {
    this.#turnOrder = Object.values(this.#players).sort(
      (p1, p2) => p1.getPlayerData().pawn.id - p2.getPlayerData().pawn.id,
    );
  }

  #getTurnOrder() {
    return this.#turnOrder;
  }

  addPlayer(player) {
    if (!(player instanceof Player)) {
      throw new Error("Invalid player");
    }

    const pawn = this.#pawnsToAssign.pop();
    player.assignPawn(pawn);
    this.#players[player.getPlayerData().id] = player;
  }

  #getAllPlayers() {
    return Object.values(this.#players).map((player) => {
      const { _hand, ...publicData } = player.getPlayerData();
      return publicData;
    });
  }

  #getAllPawns() {
    return this.#pawns.map((pawn) => pawn?.getPawnData());
  }

  getBoard() {
    return this.#board;
  }

  getPawnInstance(id) {
    return this.#pawns.find((pawn) => pawn?.getPawnData().id === id);
  }

  getRolledNumber(randomFn = Math.random, ceilFn = Math.ceil) {
    if (!this.#turn) throw new Error("Invalid player turn");
    this.setUsedSecretPassage();
    return this.#turn.rollDice(randomFn, ceilFn);
  }

  #distributeCards() {
    const players = Object.values(this.#players);
    this.#deck.distributeCards(players);
  }

  #isRollAllowed(playerId) {
    return playerId === this.#activePlayer?.getPlayerData().id &&
      !(this.#turn?.getIsDiceRolled() || this.#getHasUsedSecretPassage());
  }

  getSuspectCombination() {
    return this.#turn.getSuspectCombination();
  }

  canSuspect() {
    return this.#turn?.canSuspect();
  }

  addSuspicion(suspectCombination) {
    this.#turn.addSuspectCombination(suspectCombination);
  }

  getDiceValue() {
    return this.#turn?.getDiceValue();
  }

  #toggleIsOccupied(nodeId) {
    if (nodeId.includes("-")) {
      this.#board.toggleIsOccupied(nodeId);
    }
  }

  getReachableNodes(position, steps) {
    return this.#board.getReachableNodes(position, steps);
  }

  #isMatchingCombination(murderCombination, playerCombination) {
    return Object.keys(murderCombination).every(
      (key) => murderCombination[key] === playerCombination[key],
    );
  }

  #finishGame() {
    this.changeCurrentState();
    this.#activePlayer.setWon();
  }

  accuse({ suspect, weapon, room }) {
    if (!(suspect && weapon && room)) {
      throw new Error("Invalid Accusation Combination");
    }
    const murderCombination = this.#deck.getMurderCombination();
    const playerCombination = { suspect, weapon, room };

    const isCorrect = this.#isMatchingCombination(
      murderCombination,
      playerCombination,
    );

    this.updateTurn();

    if (isCorrect) {
      this.#finishGame();
    }

    return { isCorrect, murderCombination };
  }

  #getHasUsedSecretPassage() {
    return this.#turn?.getUsedSecretPassage();
  }

  setUsedSecretPassage() {
    this.#turn?.setUsedSecretPassage();
  }

  #getSecretPassageId(playerId) {
    const room = this.#activePlayer?.getPlayerData().pawn.position.room;
    const secretPassages = this.#board.getSecretPassages();

    if (
      room in secretPassages &&
      this.#isRollAllowed(playerId) &&
      this.#turn?.canSuspect() &&
      !this.#turn?.getUsedSecretPassage()
    ) {
      return secretPassages[room];
    }
  }

  #hasPossibleMove(possibleTiles, tileId) {
    return possibleTiles.some((tiles) => tileId === tiles);
  }

  #isValidMove(tileId, possibleTiles) {
    const currentPlayer = this.getCurrentPlayer()?.getPlayerData();

    return this.#hasPossibleMove(possibleTiles, tileId) &&
      (this.#getHasUsedSecretPassage() ||
        !this.#isRollAllowed(currentPlayer.id));
  }

  movePawn(
    currentPawn,
    { newNodeId, isUsingSecretPassage, tiles },
    oldPosition,
    tileId,
    pos,
  ) {
    const pawn = this.getPawnInstance(+currentPawn);

    if (isUsingSecretPassage) this.setUsedSecretPassage();
    if (this.#isValidMove(tileId, tiles)) {
      pawn.updatePosition(pos);
      this.#toggleIsOccupied(oldPosition);
      this.#toggleIsOccupied(newNodeId);
      return { status: true };
    }

    return { status: false };
  }
}
