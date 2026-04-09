import { ValidationError } from "../utils/custom_errors.js";
import { Player } from "./player.js";
import { Turn } from "./turn.js";

export class Game {
  #turnNum;
  #turn;
  #states = ["setup", "running", "finished"];
  #gameState;
  #id;
  #board;
  #pawns;
  #deck;
  #players;
  #turnOrder;
  #activePlayer;

  constructor(id, board, pawns, deck) {
    this.#gameState = this.#states.shift();
    this.#id = id;
    this.#board = board;
    this.#pawns = pawns;
    this.#deck = deck;
    this.#players = {};
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
    this.updateTurn();
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

  #getActivePlayerData() {
    const activePlayer = this.#activePlayer?.getPlayerData();

    return {
      id: activePlayer?.id,
      pawn: activePlayer?.pawn,
      name: activePlayer?.name,
    };
  }

  #getCurrentPlayerData(playerId) {
    const currentPlayer = this.#players[playerId]?.getPlayerData();

    return {
      id: currentPlayer?.id,
      hand: currentPlayer?.hand,
      pawn: currentPlayer?.pawn,
    };
  }

  getState(playerId) {
    if (!this.#findPlayer(playerId)) {
      throw new ValidationError("Invalid player id");
    }

    const shouldShowDicePopup = this.#turn?.getIsDiceRolled() &&
      !this.#turn?.hasPlayerSeenDicePopup(playerId);

    if (shouldShowDicePopup) this.#turn?.markDicePopupShownForPlayer(playerId);

    const data = { ...this.#getDisprovalData() };

    const accusationResult = this.#turn.getAccusationResult();

    const shouldShowAccusationResult = accusationResult !== null &&
      !this.#turn?.hasPlayerSeenAccusationResult(playerId);

    const accusationDetails = shouldShowAccusationResult
      ? this.#handleAccusation(playerId, accusationResult)
      : null;

    const murderCombination = this.#gameState === "finished"
      ? this.#deck.getMurderCombination()
      : null;

    return {
      state: this.#gameState,
      players: this.#getAllPlayers(),
      hand: this.#findPlayer(playerId)?.hand,
      pawns: this.#getAllPawns(),
      activePlayer: this.#getActivePlayerData(),
      currentPlayer: this.#getCurrentPlayerData(playerId),

      diceValues: this.#turn?.getDiceValue(),
      shouldShowDicePopup,
      possiblePaths: this.#turn.getPossiblePaths(),

      canRoll: this.#isRollAllowed(playerId),
      secretPassageId: this.#getSecretPassageId(playerId),
      canSuspect: this.canSuspect(),
      disprovalData: data,

      shouldShowAccusationResult,
      accusationDetails,
      murderCombination,
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

  #findPawn(name) {
    return this.#pawns.find((pawn) => pawn.getPawnData().name === name);
  }

  addPlayer(player, character) {
    if (!(player instanceof Player)) {
      throw new Error("Invalid player");
    }

    const pawn = this.#findPawn(character.name);
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
    return this.#turn.rollDice(randomFn, ceilFn);
  }

  #distributeCards() {
    const players = this.#turnOrder;
    this.#deck.distributeCards(players);
  }

  #isRollAllowed(playerId) {
    return (
      +playerId === this.#activePlayer?.getPlayerData().id &&
      !(
        this.#turn?.getIsDiceRolled() ||
        this.#getHasUsedSecretPassage() ||
        this.hasSuspected()
      )
    );
  }

  getSuspectCombination() {
    return this.#turn.getSuspectCombination();
  }

  canSuspect() {
    return this.#turn?.canSuspect();
  }

  hasSuspected() {
    return this.#turn?.getHasSuspected();
  }

  getDisprovablePlayer() {
    return this.#turn.getDisprovablePlayer();
  }

  #getDisprovalData() {
    return this.hasSuspected()
      ? {
        hasSuspected: true,
        canDisproved: this.#turn.getCanDisproved(),
        hasDisproved: this.#turn.getHasDisproved(),
        suspicionCombo: this.getSuspectCombination(),
        disprovablePlayer: this.#turn.getDisprovablePlayer(),
      }
      : {};
  }

  addSuspicion(suspectCombination) {
    const pawn = this.getPawnInstance(suspectCombination.suspectId);
    const pos = pawn.getPawnData().position;

    if ("room" in pos && !pos.room) {
      throw new ValidationError(
        "Player Should be inside a room to make suspicion",
      );
    }

    if (this.#turn.getHasSuspected()) {
      throw new ValidationError("Already Suspected");
    }

    pawn.updatePosition({ x: null, y: null, room: suspectCombination.room });
    this.#turn.addSuspectCombination(suspectCombination, this.#turnOrder);
  }

  addDisprovedCard(card) {
    this.#turn.updateDisprovedCard(card);
  }

  getDisprovedCard() {
    return this.#turn.getDisprovedCard();
  }

  #toggleIsOccupied(nodeId) {
    const node = this.#board.getGraph()[nodeId];
    if (!node) return;
    const hasTile = node.type === "tile";

    if (hasTile) {
      this.#board.toggleIsOccupied(nodeId);
    }
  }

  getReachableNodes(position, steps) {
    const isDiceRolled = this.#turn.getIsDiceRolled();

    if (!isDiceRolled) {
      throw new Error("Can not get reachable nodes without rolling dice");
    }

    const reachableNodes = this.#board.getReachableNodes(position, steps);
    this.#turn.setPossiblePaths(reachableNodes);
    return reachableNodes;
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

  #advanceTurnAfterAccusation(accusationResult) {
    if (accusationResult.isCorrect) return;

    if (this.#getActivePlayers().length <= 1) {
      this.#finishGame();
      return;
    }

    this.updateTurn();
  }

  #handleAccusation(playerId, accusationResult) {
    this.#turn.markAccusationResultSeen(playerId);

    const isAccuser = accusationResult.accusedBy.id === playerId;

    const accusationDetails = {
      isCorrect: accusationResult.isCorrect,
      accusedBy: accusationResult.accusedBy,
      accusationCombo: accusationResult.accusationCombo,
    };

    const totalPlayers = Object.keys(this.#players).length;

    if (this.#turn.haveAllPlayersSeen(totalPlayers)) {
      this.#advanceTurnAfterAccusation(accusationResult);
    }

    if (isAccuser) {
      return {
        ...accusationDetails,
        murderCombination: accusationResult.murderCombination,
      };
    }

    return accusationDetails;
  }

  accuse(playerCombination) {
    const murderCombination = this.#deck.getMurderCombination();
    const isMatchingCombination = this.#isMatchingCombination(
      murderCombination,
      playerCombination,
    );

    const { id, name } = this.#activePlayer.getPlayerData();
    this.#turn.setAccusationResult({
      isCorrect: isMatchingCombination,
      murderCombination,
      accusationCombo: playerCombination,
      accusedBy: { id, name },
    });

    if (isMatchingCombination) {
      this.#finishGame();
    } else {
      this.#activePlayer?.eliminate();
    }

    return { isCorrect: isMatchingCombination };
  }

  #getHasUsedSecretPassage() {
    return this.#turn?.getUsedSecretPassage();
  }

  setUsedSecretPassage() {
    this.#turn?.setUsedSecretPassage();
  }

  #getSecretPassageId(playerId, shouldValidate = false) {
    const room = this.#activePlayer?.getPlayerData().pawn.position.room;
    const secretPassages = this.#board.getSecretPassages();
    const isSecretPassage = room in secretPassages;
    const playerCanRollDice = this.#isRollAllowed(playerId);
    const playerCanSuspect = this.#turn?.canSuspect();
    const playerHasNotUsedSecretPassage = !this.#turn?.getUsedSecretPassage();

    if (shouldValidate) {
      this.validateScretPassage(
        isSecretPassage,
        playerCanRollDice,
        playerCanSuspect,
        playerHasNotUsedSecretPassage,
      );
    }

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

  #validateMove(tileId, possibleTiles) {
    if (!this.#turn.getIsDiceRolled()) {
      throw new ValidationError("Roll dice first");
    }

    if (this.#getHasUsedSecretPassage()) {
      throw new ValidationError("After using secret passage can't move");
    }

    if (!this.#hasPossibleMove(possibleTiles, tileId)) {
      throw new ValidationError("Provide Valid Path to move");
    }

    return true;
  }

  parsePawnPosition({ position }) {
    const { x, y, room } = position;
    return room ? room : `tile-${x}-${y}`;
  }

  movePawn(playerId, newNodeId, pos) {
    const pawnId = this.#getCurrentPlayerData(playerId).pawn.id;
    const pawn = this.getPawnInstance(pawnId);
    const pawnPrevPosition = this.parsePawnPosition(pawn.getPawnData());
    const possibleMoves = this.#turn.getPossiblePaths();
    this.#validateMove(newNodeId, possibleMoves);

    pawn.updatePosition(pos);
    this.#toggleIsOccupied(pawnPrevPosition);
    this.#toggleIsOccupied(newNodeId);
    this.#turn.setPossiblePaths([]);
  }

  validateScretPassage(
    isSecretPassage,
    playerCanRollDice,
    playerCanSuspect,
    playerHasNotUsedSecretPassage,
  ) {
    if (!isSecretPassage) {
      throw new Error("Room Has No Secret Passage");
    }

    if (!playerCanRollDice) {
      throw new Error("Can not use secret passage after rolling the dice");
    }

    if (!playerCanSuspect) {
      throw new Error("Can not use secret passage after suspicion");
    }

    if (!playerHasNotUsedSecretPassage) {
      throw new Error("Player Has Already Used Secret Passage");
    }
  }

  useSecretPassage(playerId) {
    const player = this.#getCurrentPlayerData(playerId);
    const pawnId = player.pawn.id;
    const pawn = this.getPawnInstance(pawnId);
    const secretPassageId = this.#getSecretPassageId(playerId, true);

    pawn.updatePosition({ x: null, y: null, room: secretPassageId });
    this.setUsedSecretPassage();
  }
}
