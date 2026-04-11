import { ValidationError } from "../utils/custom_errors.js";

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
      throw new ValidationError("createLobby should be a function");
    }

    return new LobbyController(createLobby);
  }

  hostLobby(name) {
    const lobby = this.#createLobby(++this.#currentLobbyId);
    const isHost = true;
    lobby.addPlayer(++this.#currentPlayerId, name, isHost);

    const id = lobby.getState(this.#currentPlayerId).id;
    this.#lobbies[id] = lobby;
    return { lobbyId: this.#currentLobbyId, playerId: this.#currentPlayerId };
  }

  joinLobby(name, lobbyId) {
    const lobby = this.#lobbies[lobbyId];
    if (!lobby) throw new ValidationError(`Lobby id ${lobbyId} is invalid`);
    const isHost = false;
    lobby.addPlayer(++this.#currentPlayerId, name, isHost);
    return { lobbyId, playerId: this.#currentPlayerId };
  }

  updateLobbyState(lobbyId, playerId) {
    const lobby = this.#lobbies[lobbyId];
    if (!lobby) throw new ValidationError(`${lobbyId} Invalid Lobby Id`);
    return lobby.updateState(playerId);
  }

  getLobbyState(lobbyId, playerId) {
    const lobby = this.#lobbies[lobbyId];
    if (!lobby) throw new ValidationError("Invalid lobby id");
    return {
      ...lobby.getState(playerId),
      isHost: lobby.isHost(parseInt(playerId)),
      currentPlayerId: playerId,
    };
  }

  leaveLobby(lobbyId, playerId) {
    const lobby = this.#lobbies[lobbyId];
    if (!lobby) throw new ValidationError("Invalid lobby id");

    return lobby.leaveLobby(playerId);
  }
}
