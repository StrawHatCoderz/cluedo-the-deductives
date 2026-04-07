import { fetchLobbyState, sendRequest } from "./utils.js";

const handleCopyLobbyId = (_e, lobbyId) => {
  const copyToast = document.getElementById("copy-toast");
  navigator.clipboard.writeText(lobbyId);

  copyToast.classList.add("toast");
  setTimeout(() => {
    copyToast.classList.remove("toast");
  }, 2000);
};

const setupLobbyId = (lobbyId, isHost, hostActions) => {
  const lobbyIdContainer = document.getElementById("lobby-id-container");
  const lobbyIdText = lobbyIdContainer.querySelector("#lobby-id");

  lobbyIdText.textContent = lobbyId;
  if (isHost) {
    const copyButton = hostActions.querySelector("#copy-lobby-id-btn");
    copyButton.addEventListener("click", (e) => handleCopyLobbyId(e, lobbyId));
    lobbyIdContainer.appendChild(copyButton);
  }
};

const setupPlayerProfiles = (
  profileData,
  currentPlayerId,
  profileContainer,
) => {
  const playerRole = profileContainer.querySelector(".player-role");
  if (profileData.isHost) {
    playerRole.classList.add("host");
  }

  const pawnName = profileContainer.querySelector(".pawn-name");
  pawnName.textContent = profileData.character.name;

  const playerName = profileContainer.querySelector(".player-name");

  const isCurrentPlayer = profileData.id === currentPlayerId;

  playerName.textContent = isCurrentPlayer ? "You" : profileData.name;
};

const setupProfiles = (lobby, profilesTemplate, profilesContainer) => {
  const profiles = lobby.players.map((player) => {
    const profileContainer = profilesTemplate.content.cloneNode(true);
    setupPlayerProfiles(player, lobby.currentPlayerId, profileContainer);
    return profileContainer;
  });

  profilesContainer.replaceChildren(...profiles);
};

const setupLobbyStatus = (isHost, playersCount) => {
  const lobbyStatusContainer = document.getElementById("lobby-status");
  const message = isHost
    ? `${playersCount} Player Joined`
    : "Waiting For Host To Start";

  lobbyStatusContainer.textContent = message;
};

const redirectToSetupPage = (isStarted) => {
  if (isStarted) {
    globalThis.window.location = "/pages/setup.html";
  }
};

const handleGameStart = async () => {
  const _response = await sendRequest({ url: "/game/start", method: "post" });
  globalThis.window.location = "/pages/setup.html";
};

const assignStartBtn = (isHost, playersCount, hostActions) => {
  const lobbyInfo = document.getElementById("lobby-status-actions");
  const startBtn = hostActions.querySelector("#lobby-start-btn");

  startBtn.addEventListener("click", handleGameStart);
  const isWaiting = playersCount < 3;

  if (!isWaiting) {
    startBtn.removeAttribute("disabled");
    startBtn.setAttribute("enabled", true);
  }

  if (isHost) {
    lobbyInfo.replaceChildren(startBtn);
  }
};

const setupWaitingPage = async () => {
  const initialLobby = await fetchLobbyState("/lobby");
  let prevState = "";
  const hostActionsTemplate = document.getElementById("host-actions");
  const profilesTemplate = document.getElementById("player-profile-template");
  const profilesContainer = document.querySelector(".profile-container");
  const hostActions = hostActionsTemplate.content.cloneNode(true);

  setupLobbyId(initialLobby.id, initialLobby.isHost, hostActions);
  setInterval(async () => {
    const lobby = await fetchLobbyState("/lobby");
    if (JSON.stringify(prevState) !== JSON.stringify(lobby)) {
      const hostActions = hostActionsTemplate.content.cloneNode(true);
      const totalPlayers = lobby.players.length;

      setupProfiles(lobby, profilesTemplate, profilesContainer);
      setupLobbyStatus(lobby.isHost, totalPlayers);
      assignStartBtn(lobby.isHost, totalPlayers, hostActions);
      redirectToSetupPage(lobby.isStarted);
      prevState = lobby;
    }
  }, 500);
};

globalThis.window.onload = setupWaitingPage;
