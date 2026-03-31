import { createApp } from "./src/app.js";
import { createGameInstance } from "./src/utils/game.js";

const main = () => {
  const PORT = Deno.env.get("PORT") || 8000;
  const game = createGameInstance();
  const app = createApp(game);
  Deno.serve({ port: PORT }, app.fetch);
};

main();
