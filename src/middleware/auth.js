import { getCookie } from "hono/cookie";

export const restrictAuthorizedUser = (c, next) => {
  const lobbyId = getCookie(c, "lobbyId");

  if (lobbyId) {
    return c.redirect("/pages/join.html");
  }

  return next();
};
