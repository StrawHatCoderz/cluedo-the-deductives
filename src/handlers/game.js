import { getPlayerId } from "../utils/game.js";

export const startGame = (c) => {
  const game = c.get("game");
  game.start();
  return c.redirect("/pages/setup.html", 303);
};

export const getGameState = (c) => {
  const game = c.get("game");
  const playerId = getPlayerId(c);
  const gameState = game.getState(playerId);
  return c.json(gameState, 200);
};

export const updateGameState = (c) => {
  const game = c.get("game");
  game.changeCurrentState();
  game.updateTurn();

  const playerId = getPlayerId(c);
  const currentState = game.getState(playerId);

  return c.json({ state: currentState.state }, 200);
};

export const updateTurn = (c) => {
  const game = c.get("game");
  const currentPlayer = game.updateTurn();

  return c.json({ currentPlayer }, 200);
};
