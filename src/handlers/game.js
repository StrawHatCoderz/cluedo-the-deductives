export const startGame = (c) => {
  const game = c.get("game");
  game.start();
  return c.redirect("/pages/setup.html", 303);
};

export const getGameState = (c) => {
  const game = c.get("game");
  const currentState = game.getCurrentState();
  return c.json(currentState, 200);
};

export const getTotalPlayers = (c) => {
  const game = c.get("game");
  const currentState = game.getCurrentState();
  return c.json({ totalPlayers: currentState.players.length }, 200);
};

export const updateGameState = (c) => {
  const game = c.get("game");
  game.changeCurrentState();
  game.updateTurn();
  const currentState = game.getCurrentState();

  return c.json({ state: currentState.state }, 200);
};

export const updateTurn = (c) => {
  const game = c.get("game");
  const currentPlayer = game.updateTurn();

  return c.json({ currentPlayer }, 200);
};
