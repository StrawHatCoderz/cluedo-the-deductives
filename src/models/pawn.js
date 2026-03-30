export class Pawn {
  #id;
  #name;
  #position;
  #color;
  #playerId;
  constructor(id, name, position, color, playerId) {
    this.#id = id;
    this.#name = name;
    this.#position = position;
    this.#color = color;
    this.#playerId = playerId;
  }

  getPosition() {
    return this.#position;
  }
}
