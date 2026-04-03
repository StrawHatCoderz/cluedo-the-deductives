export class Turn {
  #player;
  #isDiceRolled;
  #diceValue;
  #hasSuspected;
  #suspectCombination;
  #usedSecretPsg;

  constructor(player) {
    this.#player = player;
    this.#isDiceRolled = false;
    this.#diceValue = [];
    this.#hasSuspected = false;
    this.#usedSecretPsg = false;
  }

  setUsedSecretPassage() {
    this.#usedSecretPsg = true;
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

  rollDice(randomGenerator, ceilFn) {
    if (this.#isDiceRolled) throw new Error("Player already rolled the dice");
    this.#isDiceRolled = true;
    this.#diceValue.push(ceilFn(randomGenerator() * 6));
    this.#diceValue.push(ceilFn(randomGenerator() * 6));
    return this.getDiceValue();
  }

  canSuspect() {
    const pawnLocation = this.#player.getPlayerData().pawn.position;
    return !!pawnLocation.room && !this.#hasSuspected;
  }

  addSuspectCombination(suspectCombination) {
    this.#suspectCombination = suspectCombination;
    this.#hasSuspected = true;
  }

  getSuspectCombination() {
    return this.#suspectCombination;
  }
}
