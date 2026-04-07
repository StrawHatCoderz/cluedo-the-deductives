import { getCookie } from "hono/cookie";

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
  const accusationDetails = await c.req.json();
  const gameController = c.get("gameController");
  const lobbyId = getCookie(c, "lobbyId");
  const { isCorrect, murderCombination } = gameController.accuse(
    lobbyId,
    accusationDetails,
  );

  return c.json({ isCorrect, murderCombination });
};

export const addSuspicion = async (c) => {
  const suspicion = await c.req.json();
  const lobbyId = getCookie(c, "lobbyId");
  const gameController = c.get("gameController");
  return c.json(gameController.addSuspicion(lobbyId, suspicion));
};

export const confirmDisprove = async (c) => {
  const { disprove } = await c.req.parseBody();
  const gameController = c.get("gameController");
  const lobbyId = getCookie(c, "lobbyId");
  c.json(gameController.confirmDisproval(lobbyId, disprove), 303);
};

export const getDisprovedCard = (c) => {
  const gameController = c.get("gameController");
  const lobbyId = getCookie(c, "lobbyId");
  return c.json(gameController.getDisprovedCard(lobbyId));
};
