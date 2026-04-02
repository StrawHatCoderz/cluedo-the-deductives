import { Player } from "../models/player.js";

export const addMockPlayer = async (c, next) => {
  const game = c.get("game");

  const playersData = [
    { id: 1, name: "Thor", isHost: true },
    { id: 2, name: "Hulk", isHost: false },
    { id: 3, name: "Loki", isHost: false },
  ];

  playersData.forEach(({ id, name, isHost }) => {
    const player = new Player(id, name, isHost);
    game.addPlayer(player);
  });

  await next();
};
