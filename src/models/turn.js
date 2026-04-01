export class Turn {
  #player;
  #isDiceRolled;
  #diceValue;

  constructor(player) {
    this.#player = player;
    this.#isDiceRolled = false;
    this.#diceValue = [];
  }

  rollDice(randomGenerator, ceilFn) {
    if (this.#isDiceRolled) throw new Error("Player already rolled the dice");

    this.#isDiceRolled = true;
    this.#diceValue.push(ceilFn(randomGenerator() * 6));
    this.#diceValue.push(ceilFn(randomGenerator() * 6));
    return this.#diceValue.reduce((sum, value) => sum + value);
  }
}
