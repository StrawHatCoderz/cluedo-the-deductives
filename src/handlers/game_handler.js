import { getCookie } from "hono/cookie";
import { accusationSchema } from "../validators/schema.js";

export const startGame = (c) => {
  const gameController = c.get("gameController");
  const lobbyController = c.get("lobbyController");
  const lobbyId = getCookie(c, "lobbyId");
  const playerId = getCookie(c, "playerId");

  lobbyController.updateLobbyState(+lobbyId, +playerId);
  const allPlayers = lobbyController.getLobbyState(+lobbyId, +playerId).players;

  gameController.startGame(lobbyId, allPlayers);

  return c.redirect("/pages/setup.html", 303);
};

export const getGameState = (c) => {
  const gameController = c.get("gameController");

  const lobbyId = getCookie(c, "lobbyId");
  const playerId = getCookie(c, "playerId");

  const gameState = gameController.getGameState(+lobbyId, +playerId);
  return c.json({ success: true, data: gameState }, 200);
};

export const updateTurn = (c) => {
  const gameController = c.get("gameController");
  const lobbyId = getCookie(c, "lobbyId");
  const currentPlayer = gameController.updateTurn(lobbyId);
  return c.json({ currentPlayer }, 200);
};

export const handleAccusation = async (c) => {
  const body = await c.req.json();

  const result = accusationSchema.safeParse(body);
  if (!result.success) {
    return c.json({ success: false, error: result.error.flatten() }, 400);
  }

  const gameController = c.get("gameController");
  const lobbyId = getCookie(c, "lobbyId");
  const { isCorrect } = gameController.accuse(lobbyId, result.data);

  return c.json({ success: true, data: { isCorrect } });
};

export const addSuspicion = async (c) => {
  try {
    const suspicion = await c.req.json();
    const lobbyId = getCookie(c, "lobbyId");
    const playerId = getCookie(c, "playerId");
    const gameController = c.get("gameController");
    gameController.addSuspicion(lobbyId, +playerId, suspicion);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: error.message });
  }
};

export const confirmDisprove = async (c) => {
  const { disprove } = await c.req.parseBody();
  const lobbyId = getCookie(c, "lobbyId");
  const gameController = c.get("gameController");
  const combo = Object.values(gameController.getSuspicionCombination(lobbyId));
  if (!combo.includes(disprove)) {
    return c.json({ success: false, error: "Invalid disproval card" }, 400);
  }
  return c.json(gameController.confirmDisproval(lobbyId, disprove));
};

export const getDisprovedCard = (c) => {
  const gameController = c.get("gameController");
  const lobbyId = getCookie(c, "lobbyId");
  return c.json(gameController.getDisprovedCard(lobbyId));
};
