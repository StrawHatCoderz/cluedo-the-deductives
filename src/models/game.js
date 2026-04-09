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
    this.#turn.addSuspectCombination(suspectCombination, this.#turnOrder);
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

  parsePawnPosition(pawn) {
    const { x, y, room } = pawn.position;
    return room ? room : `tile-${x}-${y}`;
  }

  movePawn(pawnId, { newNodeId, isUsingSecretPassage, tiles }, tileId, pos) {
    const pawn = this.getPawnInstance(pawnId);
    const pawnPrevPosition = this.parsePawnPosition(pawn.getPawnData());

    if (isUsingSecretPassage) this.setUsedSecretPassage();
    if (this.#isValidMove(tileId, tiles)) {
      pawn.updatePosition(pos);
      this.#toggleIsOccupied(pawnPrevPosition);
      this.#toggleIsOccupied(newNodeId);
      return { status: true };
    }

    return { status: false };
  }

  useSecretPassage(playerId) {
    const player = this.#getCurrentPlayerData(playerId);
    const pawnId = player.pawn.id;
    const pawn = this.getPawnInstance(pawnId);
    const room = pawn?.getPawnData().position.room;
    const secretPassages = this.#board.getSecretPassages();

    const isSecretPassage = room in secretPassages;
    if (!isSecretPassage) {
      throw new Error("Room Has No Secret Passage");
    }

    const playerCanRollDice = this.#isRollAllowed(playerId);
    if (!playerCanRollDice) {
      throw new Error("Can not use secret passage after rolling the dice");
    }

    const playerCanSuspect = this.#turn?.canSuspect();
    if (!playerCanSuspect) {
      throw new Error("Can not use secret passage after suspicion");
    }

    const playerHasNotUsedSecretPassage = !this.#turn?.getUsedSecretPassage();
    if (!playerHasNotUsedSecretPassage) {
      throw new Error("Player Has Already Used Secret Passage");
    }

    pawn.updatePosition({ x: null, y: null, room: secretPassages[room] });
    this.setUsedSecretPassage();
  }
}
