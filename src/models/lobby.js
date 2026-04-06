export class Lobby {
  #id;
  #state;
  #maxPlayer;
  #minPlayer;
  #pawns;
  #players;

  constructor(id, maxPlayer, minPlayer, pawns) {
    this.#id = id;
    this.#maxPlayer = maxPlayer;
    this.#minPlayer = minPlayer;
    this.#pawns = pawns;
    this.#players = [];
    this.#state = "waiting";
  }

  getState() {
    return {
      id: this.#id,
      state: this.#state,
      players: this.#players,
    };
  }

  addPlayer(id, username, isHost) {
    if (this.#players.length >= this.#maxPlayer) {
      throw new Error("MaxPlayer reached");
    }
    const character = this.#pawns.pop();
    this.#players.push({ id, username, isHost, character });
  }
}
