import { Player } from "../models/player.js";

export const addMockPlayer = async (c, next) => {
  const game = c.get("game");

  const playersData = [
    { id: 1, playerName: "Thor", isHost: true },
    { id: 2, playerName: "Hulk", isHost: false },
    { id: 3, playerName: "Loki", isHost: false },
  ];

  playersData.forEach(({ id, playerName, isHost }) => {
    const player = new Player(id, playerName, isHost);
    game.addPlayer(player);
  });

  await next();
};
