export class Pawn {
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

  get() {
    return {
      name: this.#name,
      position: this.#position,
      color: this.#color,
      playerId: this.#playerId,
    };
  }

  getPosition() {
    return this.#position;
  }

  updatePosition(currentPosition) {
    this.#position = currentPosition;
  }
}

const rollDice = (randomGenerator) => Math.ceil(randomGenerator() * 6);

export const getRolledNumber = (randomGenerator = Math.random) =>
  rollDice(randomGenerator) + rollDice(randomGenerator);
