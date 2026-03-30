export class Pawn {
  #id;
  #name;
  #position;
  #color;
  #playerId;
  constructor(name, position, color, playerId) {
    this.#name = name;
    this.#position = position;
    this.#color = color;
    this.#playerId = playerId;
  }

  getPosition() {
    return this.#position;
  }
}

const rollDice = (randomGenerator) => Math.ceil(randomGenerator() * 6);

export const getRolledNumber = (randomGenerator = Math.random) =>
  rollDice(randomGenerator) + rollDice(randomGenerator);
