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

  #findPlayer(playerId) {
    return this.#players.find((player) => player.id === playerId);
  }

  getState() {
    return {
      id: this.#id,
      state: this.#state,
      players: this.#players,
    };
  }

  isHost(playerId) {
    return this.#findPlayer(playerId)?.isHost;
  }

  addPlayer(id, name, isHost) {
    if (this.#players.length >= this.#maxPlayer) {
      throw new Error("MaxPlayer reached");
    }

    if (this.#state !== "waiting") throw new Error("Game already started");
    const character = this.#pawns.pop();
    this.#players.push({ id, name, isHost, character });
  }

  updateState() {
    if (this.#players.length >= 3 && this.#players.length <= 6) {
      this.#state = "started";
      return;
    }

    throw new Error("Invalid Player Count");
  }
}
