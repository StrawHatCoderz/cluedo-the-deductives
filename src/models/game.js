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

  constructor(id, board, pawns, deck, shuffledPawns) {
    this.#gameState = this.#states.shift();
    this.#id = id;
    this.#board = board;
    this.#pawns = pawns;
    this.#deck = deck;
    this.#players = {};
    this.#pawnsToAssign = shuffledPawns;
    this.#turnNum = 0;
  }

  changeCurrentState() {
    this.#gameState = this.#states.shift() || "finished";
  }

  start() {
    const totalPlayers = Object.keys(this.#players).length;

    if (totalPlayers < 3 || totalPlayers > 6) {
      throw new Error("Invalid player count");
    }

    this.#setTurnOrder();
    this.#distributeCards();
    this.#updateActivePlayer(0);
    this.changeCurrentState();
  }

  #getActivePlayers() {
    return this.#getAllPlayers().filter((player) => !player.isEliminated);
  }

  updateTurn() {
    if (this.#gameState !== "running") {
      throw new Error("Game is not running");
    }

    this.#updateActivePlayer(this.#turnNum++ % this.#turnOrder.length);

    if (this.#activePlayer.getPlayerData().isEliminated) {
      this.updateTurn();
    }

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
      ...this.#getDisprovalData(),
    };
  }

  #updateActivePlayer(turnNumber) {
    this.#activePlayer = this.#turnOrder[turnNumber];
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

  addPlayer(player) {
    if (!(player instanceof Player)) {
      throw new Error("Invalid player");
    }

    const pawn = this.#pawnsToAssign.pop();
    player.assignPawn(pawn);
    this.#players[player.getPlayerData().id] = player;
  }

  #getAllPlayers() {
    return this.#turnOrder?.map((player) => {
      const { _hand, ...publicData } = player.getPlayerData();
      return publicData;
    });
  }

  #getAllPawns() {
    return this.#pawns.map((pawn) => pawn?.getPawnData());
  }

  getPawnInstance(id) {
    return this.#pawns.find((pawn) => pawn?.getPawnData().id === id);
  }

  getDiceValue() {
    return this.#turn?.getDiceValue();
  }

  rollDice(randomFn = Math.random, ceilFn = Math.ceil) {
    if (!this.#turn) throw new Error("Invalid player turn");
    this.setUsedSecretPassage();
    return this.#turn.rollDice(randomFn, ceilFn);
  }

  #distributeCards() {
    const players = this.#turnOrder;
    this.#deck.distributeCards(players);
  }

  #isRollAllowed(playerId) {
    return (
      playerId === this.#activePlayer?.getPlayerData().id &&
      !(this.#turn?.getIsDiceRolled() || this.#getHasUsedSecretPassage())
    );
  }

  getSuspectCombination() {
    return this.#turn.getSuspectCombination();
  }

  canSuspect() {
    return this.#turn?.canSuspect();
  }

  #getDisprovalData() {
    return this.#turn?.getHasSuspected()
      ? {
        canDisproved: this.#turn.getCanDisproved(),
        hasDisproved: this.#turn.getHasDisproved(),
        suspicionCombo: this.getSuspectCombination(),
        disprovablePlayer: this.#turn.getDisprovablePlayer(),
      }
      : {};
  }

  addSuspicion(suspectCombination) {
    this.#turn.addSuspectCombination(suspectCombination);
    this.#turn.disproveASuspicion(this.#turnOrder, this.#activePlayer);
  }

  addDisprovedCard(card) {
    this.#turn.updateDisprovedCard(card);
  }

  getDisprovedCard() {
    return this.#turn.getDisprovedCard();
  }

  #toggleIsOccupied(nodeId) {
    const hasTile = this.#board.getGraph()[nodeId].type === "tile";
    if (hasTile) {
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
    this.#activePlayer?.setWon();
  }

  #eliminatePlayer() {
    this.#activePlayer?.eliminate();
    this.updateTurn();

    if (this.#getActivePlayers().length <= 1) {
      this.#finishGame();
    }
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

    if (isCorrect) {
      this.#finishGame();
    } else {
      this.#eliminatePlayer();
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

    const isSecretPassage = room in secretPassages;
    const playerCanRollDice = this.#isRollAllowed(playerId);
    const playerCanSuspect = this.#turn?.canSuspect();
    const playerHasNotUsedSecretPassage = !this.#turn?.getUsedSecretPassage();

    if (
      isSecretPassage &&
      playerHasNotUsedSecretPassage &&
      playerCanRollDice &&
      playerCanSuspect
    ) {
      return secretPassages[room];
    }
  }

  #hasPossibleMove(possibleTiles, tileId) {
    return possibleTiles.some((tiles) => tileId === tiles);
  }

  #isValidMove(tileId, possibleTiles) {
    const currentPlayer = this.getCurrentPlayer()?.getPlayerData();
    return (
      this.#hasPossibleMove(possibleTiles, tileId) &&
      (this.#getHasUsedSecretPassage() ||
        !this.#isRollAllowed(currentPlayer.id))
    );
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
