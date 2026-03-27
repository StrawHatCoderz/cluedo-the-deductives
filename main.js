import { createApp } from "./src/app.js";

const main = () => {
  const PORT = Deno.env.get("PORT") || 8000;
  const app = createApp();
  Deno.serve({ port: PORT }, app.fetch);
};

main();
