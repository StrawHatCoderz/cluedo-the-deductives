import { getCookie } from "hono/cookie";

export const startGame = (c) => {
  const gameController = c.get("gameController");
  const lobbyController = c.get("lobbyController");
  const lobbyId = getCookie(c, "lobbyId");
  const playerId = getCookie(c, "playerId");

  lobbyController.startGame(lobbyId);
  const allPlayers = lobbyController.getLobbyState(+lobbyId, +playerId).players;

  gameController.startGame(lobbyId, allPlayers);

  return c.redirect("/pages/setup.html", 303);
};

export const getGameState = (c) => {
  const gameController = c.get("gameController");

  const lobbyId = getCookie(c, "lobbyId");

  const gameState = gameController.getGameState(lobbyId);
  return c.json({ success: true, data: gameState }, 200);
};

export const updateTurn = (c) => {
  const game = c.get("game");
  const currentPlayer = game.updateTurn();
  return c.json({ currentPlayer }, 200);
};

export const handleAccusation = async (c) => {
  const accusationDetails = await c.req.json();
  const game = c.get("game");
  const { isCorrect, murderCombination } = game.accuse(accusationDetails);

  return c.json({ isCorrect, murderCombination });
};

export const addSuspicion = async (c) => {
  const suspicion = await c.req.json();
  const game = c.get("game");
  if (game.canSuspect()) {
    game.addSuspicion(suspicion);
    return c.json({ status: true });
  }
  return c.json({ status: false });
};

export const confirmDisprove = async (c) => {
  const { disprove } = await c.req.parseBody();
  const game = c.get("game");
  game.addDisprovedCard(disprove);
  return c.json({ success: true });
};

export const getDisprovedCard = (c) => {
  const game = c.get("game");
  const card = game.getDisprovedCard();
  return c.json({ data: card });
};
