import { getCookie, setCookie } from "hono/cookie";
import { createLobbySchema, joinLobbySchema } from "../validators/schema.js";

export const createLobby = async (c) => {
  const body = await c.get("body");

  const result = createLobbySchema.safeParse(body);
  if (!result.success) {
    return c.json({ success: false, error: "Invalid player name" }, 400);
  }

  const lobbyController = c.get("lobbyController");
  const { playerId, lobbyId } = lobbyController.hostLobby(result.data.name);
  setCookie(c, "lobbyId", lobbyId);
  setCookie(c, "playerId", playerId);
  return c.json({ success: true, data: { playerId, lobbyId } }, 201);
};

export const joinLobby = async (c) => {
  const body = await c.get("body");

  const result = joinLobbySchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { success: false, error: "Invalid player name or room id" },
      400,
    );
  }

  const lobbyController = c.get("lobbyController");
  const { playerId, lobbyId } = lobbyController.joinLobby(
    name,
    result.data.roomId,
  );
  setCookie(c, "lobbyId", lobbyId);
  setCookie(c, "playerId", playerId);
  return c.json({ success: true, data: { playerId, lobbyId } }, 200);
};

export const serveLobbyState = (c) => {
  const lobbyController = c.get("lobbyController");
  const lobbyId = getCookie(c, "lobbyId");
  const playerId = getCookie(c, "playerId");

  return c.json({
    success: true,
    data: lobbyController.getLobbyState(parseInt(lobbyId), parseInt(playerId)),
    currentPlayer: +playerId,
  });
};
