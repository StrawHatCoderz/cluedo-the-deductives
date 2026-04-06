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
