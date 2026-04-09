import { z } from "zod";
import { ROOMS, SUSPECTS, WEAPONS } from "../constants/game_config.js";

export const accusationSchema = z.object({
  suspect: z.enum(SUSPECTS),
  weapon: z.enum(WEAPONS),
  room: z.enum(ROOMS),
});

export const createLobbySchema = z.object({
  name: z.string().nonempty(),
});
