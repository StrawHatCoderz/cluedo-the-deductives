import { setCookie } from "hono/cookie";

export const createLobby = async (c) => {
  const { username } = await c.req.parseBody();

  if (!username) {
    return c.json({ success: false, data: {}, error: "Invalid Username" }, 400);
  }
  const lobbyController = c.get("lobbyController");
  const { playerId, lobbyId } = lobbyController.hostLobby(username);
  setCookie(c, "lobbyId", lobbyId);
  setCookie(c, "playerId", playerId);
  return c.json({ success: true, data: { playerId, lobbyId } }, 201);
};

export const joinLobby = (c) => {
  try {
    const { username, roomId } = c.get("body");
    if (!username) {
      return c
        .json({ success: false, data: {}, error: "Invalid Username" }, 400);
    }

    if (!roomId) {
      return c
        .json({ success: false, data: {}, error: "Invalid RoomId" }, 400);
    }
    const lobbyController = c.get("lobbyController");
    const { playerId, lobbyId } = lobbyController.joinLobby(username, roomId);
    setCookie(c, "lobbyId", lobbyId);
    setCookie(c, "playerId", playerId);
    return c.json({ success: true, data: { playerId, lobbyId } }, 200);
  } catch (e) {
    return c.json({ success: false, data: {}, error: e.message }, 400);
  }
};
