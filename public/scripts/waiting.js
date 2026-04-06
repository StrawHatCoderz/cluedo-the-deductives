const fetchLobbyState = (_url) => {
  return {
    id: 3412134,
    status: "waiting",
    isHost: true,
    players: [
      { id: 1324, name: "tony", pawn: "Mrs Scarlet", isHost: true },
      { id: 1325, name: "steve", pawn: "Mr Green", isHost: false },
      { id: 1326, name: "banner", pawn: "Prof Plum", isHost: false },
    ],
  };
};

const setupLobbyId = (lobbyId, isHost, hostActions) => {
  const lobbyIdContainer = document.getElementById("lobby-id-container");
  const lobbyIdText = lobbyIdContainer.querySelector("#lobby-id");

  lobbyIdText.textContent = lobbyId;
  if (isHost) {
    const copyButton = hostActions.querySelector("#copy-lobby-id-btn");
    lobbyIdContainer.appendChild(copyButton);
  }
};

const setupPlayerProfiles = (profileData, profileContainer) => {
  const playerRole = profileContainer.querySelector(".player-role");
  if (profileData.isHost) {
    playerRole.classList.add("host");
  }

  const pawnName = profileContainer.querySelector(".pawn-name");
  pawnName.textContent = profileData.pawn;

  const playerName = profileContainer.querySelector(".player-name");

  playerName.textContent = profileData.name;
};

const setupLobbyStatus = (isHost, playersCount) => {
  const lobbyStatusContainer = document.getElementById("lobby-status");
  const message = isHost
    ? `${playersCount} Player Joined`
    : "Waiting For Host To Join";

  lobbyStatusContainer.textContent = message;
};

const assignStartBtn = (isHost, hostActions) => {
  const lobbyInfo = document.getElementById("lobby-info");

  const startBtn = hostActions.querySelector("#lobby-start-btn");
  if (isHost) {
    lobbyInfo.appendChild(startBtn);
  }
};

const setupWaitingPage = () => {
  const lobby = fetchLobbyState("/lobby");
  const hostActionsTemplate = document.getElementById("host-actions");
  const profilesTemplate = document.getElementById("player-profile-template");
  const profilesContainer = document.querySelector(".profile-container");
  const totalPlayers = lobby.players.length;
  const hostActions = hostActionsTemplate.content.cloneNode(true);

  setupLobbyId(lobby.id, lobby.isHost, hostActions);

  const profiles = lobby.players.map((player) => {
    const profileContainer = profilesTemplate.content.cloneNode(true);
    setupPlayerProfiles(player, profileContainer);
    return profileContainer;
  });

  profilesContainer.append(...profiles);
  setupLobbyStatus(lobby.isHost, totalPlayers);
  assignStartBtn(lobby.isHost, hostActions);
};

globalThis.window.onload = setupWaitingPage;
