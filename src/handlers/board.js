export const serveDiceValue = (c, randomFn = Math.random) => {
  const game = c.get("game");
  const diceValue = game.getRolledNumber(randomFn);
  return c.json({ diceValue });
};

export const serveReachableNodes = (_c) => {
};
