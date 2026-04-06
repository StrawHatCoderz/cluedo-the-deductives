export class Turn {
  #player;
  #isDiceRolled;
  #diceValue;
  #hasSuspected;
  #suspectCombination;
  #usedSecretPsg;
  #disprovablePlayer;
  #canDisproved;
  #hasDisproved;
  #disprovedCard;

  constructor(player) {
    this.#player = player;
    this.#isDiceRolled = false;
    this.#diceValue = [];
    this.#hasSuspected = false;
    this.#usedSecretPsg = false;
    this.#disprovablePlayer = null;
    this.#canDisproved = false;
    this.#hasDisproved = false;
    this.#disprovedCard;
  }

  setUsedSecretPassage() {
    this.#usedSecretPsg = true;
  }

  getDisprovedCard() {
    return this.#disprovedCard;
  }

  getUsedSecretPassage() {
    return this.#usedSecretPsg;
  }

  getIsDiceRolled() {
    return this.#isDiceRolled;
  }

  getDiceValue() {
    return this.#diceValue.reduce((sum, value) => sum + value);
  }

  updateDisprovedCard(card) {
    this.#disprovedCard = card;
    this.#hasDisproved = true;
    return this.#disprovedCard;
  }

  rollDice(randomGenerator, ceilFn) {
    if (this.#isDiceRolled) throw new Error("Player already rolled the dice");
    this.#isDiceRolled = true;
    this.#diceValue.push(ceilFn(randomGenerator() * 6));
    this.#diceValue.push(ceilFn(randomGenerator() * 6));
    return this.#diceValue;
  }

  canSuspect() {
    const pawnLocation = this.#player.getPlayerData().pawn.position;
    return !!pawnLocation.room && !this.#hasSuspected;
  }

  addSuspectCombination(suspectCombination) {
    this.#suspectCombination = suspectCombination;
    this.#hasSuspected = true;
    this.#isDiceRolled = true;
  }

  getSuspectCombination() {
    return this.#suspectCombination;
  }

  #findDisprovablePlayer(order) {
    return order.find((player) =>
      Object.values(this.#suspectCombination).some((clue) =>
        player.getPlayerData().hand.includes(clue)
      )
    );
  }

  #getDisprovalOrder(order, activePlayer) {
    const activePlayerIndex = order.findIndex((plr) => activePlayer === plr);
    return [
      ...order.slice(activePlayerIndex + 1),
      ...order.slice(0, activePlayerIndex),
    ];
  }

  getCanDisproved() {
    return this.#canDisproved;
  }

  getHasDisproved() {
    return this.#hasDisproved;
  }

  getHasSuspected() {
    return this.#hasSuspected;
  }

  getDisprovablePlayer() {
    return this.#disprovablePlayer;
  }

  disproveASuspicion(playersOrder, activePlayer) {
    const disprovalOrder = this.#getDisprovalOrder(playersOrder, activePlayer);
    this.#disprovablePlayer = this.#findDisprovablePlayer(disprovalOrder)
      ?.getPlayerData()?.id;
    if (this.#disprovablePlayer) {
      this.#canDisproved = true;
    }
  }
}
