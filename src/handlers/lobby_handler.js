export const createLobby = async (c) => {
  const { username } = await c.req.parseBody();
  const lobbyController = c.get("lobbyController");
  lobbyController.create(username);
  return c.text("Ok");
};
