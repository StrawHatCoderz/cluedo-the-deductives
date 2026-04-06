export class LobbyController {
  #createLobby;
  #lobbies;
  #currentLobbyId;
  #currentPlayerId;

  constructor(createLobby) {
    if (typeof createLobby !== "function") {
      throw new Error("createLobby is not a function");
    }
    this.#createLobby = createLobby;
    this.#currentLobbyId = 0;
    this.#currentPlayerId = 0;
    this.#lobbies = {};
  }

  hostLobby(username) {
    const lobby = this.#createLobby(++this.#currentLobbyId);
    const id = lobby.getState().id;
    this.#lobbies[id] = lobby;
    const isHost = true;
    lobby.addPlayer(++this.#currentPlayerId, username, isHost);
    return { lobbyId: this.#currentLobbyId, playerId: this.#currentPlayerId };
  }

  joinLobby(username, roomId) {
    const lobby = this.#lobbies[roomId];
    if (!lobby) throw new Error("RoomId is invalid");
    const isHost = false;
    lobby.addPlayer(++this.#currentPlayerId, username, isHost);
    return { lobbyId: this.#currentLobbyId, playerId: this.#currentPlayerId };
  }

  getLobbyState(lobbyId) {
    return this.#lobbies[lobbyId].getState();
  }
}
