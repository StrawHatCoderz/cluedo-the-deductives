import { getCookie, setCookie } from "hono/cookie";

export const createLobby = async (c) => {
  try {
    const { name } = await c.req.parseBody();

    if (!name) {
      throw new Error("Invalid name");
    }

    const lobbyController = c.get("lobbyController");
    const { playerId, lobbyId } = lobbyController.hostLobby(name);
    setCookie(c, "lobbyId", lobbyId);
    setCookie(c, "playerId", playerId);
    return c.json({ success: true, data: { playerId, lobbyId } }, 201);
  } catch (e) {
    return c.json({ success: false, data: {}, error: e.message }, 400);
  }
};

export const joinLobby = (c) => {
  try {
    const { name, roomId } = c.get("body");
    if (!name) {
      throw new Error("Invalid name");
    }

    if (!roomId) {
      throw new Error("Invalid RoomId");
    }
    const lobbyController = c.get("lobbyController");
    const { playerId, lobbyId } = lobbyController.joinLobby(name, roomId);
    setCookie(c, "lobbyId", lobbyId);
    setCookie(c, "playerId", playerId);
    return c.json({ success: true, data: { playerId, lobbyId } }, 200);
  } catch (e) {
    return c.json({ success: false, data: {}, error: e.message }, 400);
  }
};

export const serveLobbyState = (c) => {
  const lobbyController = c.get("lobbyController");
  const lobbyId = getCookie(c, "lobbyId");
  const playerId = getCookie(c, "playerId");

  return c.json({
    success: true,
    data: lobbyController.getLobbyState(parseInt(lobbyId), parseInt(playerId)),
  });
};
