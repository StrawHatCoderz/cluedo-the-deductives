export class LobbyController {
  #createLobby;
  #lobbies;
  #currentLobbyId;
  #currentPlayerId;

  constructor(createLobby) {
    this.#createLobby = createLobby;
    this.#currentLobbyId = 0;
    this.#currentPlayerId = 0;
    this.#lobbies = {};
  }

  static create(createLobby) {
    if (typeof createLobby !== "function") {
      throw new Error("createLobby is not a function");
    }

    return new LobbyController(createLobby);
  }

  hostLobby(name) {
    const lobby = this.#createLobby(++this.#currentLobbyId);

    const id = lobby.getState().id;
    this.#lobbies[id] = lobby;
    const isHost = true;
    lobby.addPlayer(++this.#currentPlayerId, name, isHost);
    return { lobbyId: this.#currentLobbyId, playerId: this.#currentPlayerId };
  }

  joinLobby(name, lobbyId) {
    const lobby = this.#lobbies[lobbyId];
    if (!lobby) throw new Error("RoomId is invalid");
    const isHost = false;
    lobby.addPlayer(++this.#currentPlayerId, name, isHost);
    return { lobbyId, playerId: this.#currentPlayerId };
  }

  updateLobbyState(lobbyId, playerId) {
    const lobby = this.#lobbies[lobbyId];
    return lobby.updateState(playerId);
  }

  getLobbyState(lobbyId, playerId) {
    const lobby = this.#lobbies[lobbyId];

    return {
      ...lobby.getState(),
      isHost: lobby.isHost(parseInt(playerId)),
      currentPlayerId: playerId,
    };
  }
}
