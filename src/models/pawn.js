export class Pawn {
  #name;
  #position;
  #color;
  #id;
  constructor(id, name, position, color) {
    this.#id = id;
    this.#name = name;
    this.#position = position;
    this.#color = color;
  }

  getPawnData() {
    return {
      id: this.#id,
      name: this.#name,
      position: this.#position,
      color: this.#color,
    };
  }

  getPosition() {
    return this.#position;
  }

  updatePosition(currentPosition) {
    this.#position = currentPosition;
    return this.#position;
  }
}
