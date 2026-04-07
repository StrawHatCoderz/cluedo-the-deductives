export class Lobby {
  #id;
  #maxPlayer;
  #minPlayer;
  #pawns;
  #players;
  #isStarted;

  constructor(id, maxPlayer, minPlayer, pawns) {
    this.#id = id;
    this.#maxPlayer = maxPlayer;
    this.#minPlayer = minPlayer;
    this.#pawns = pawns;
    this.#players = [];
    this.#isStarted = false;
  }

  #findPlayer(playerId) {
    return this.#players.find((player) => player.id === playerId);
  }

  getState() {
    return {
      id: this.#id,
      isStarted: this.#isStarted,
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

    if (this.#isStarted) throw new Error("Game already started");
    const character = this.#pawns.pop();
    this.#players.push({ id, name, isHost, character });
  }

  updateState(playerId) {
    const playerCount = this.#players.length;
    const belowMinPlayers = playerCount < this.#minPlayer;
    const aboveMaxPlayers = playerCount > this.#maxPlayer;

    if (!this.isHost(playerId)) {
      throw new Error("You Can't Start Game");
    }

    if (belowMinPlayers || aboveMaxPlayers) {
      throw new Error("Invalid Player Count");
    }

    this.#isStarted = true;
  }
}
