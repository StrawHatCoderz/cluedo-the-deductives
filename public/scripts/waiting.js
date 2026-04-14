import { sendRequest } from "./api/api_service.js";
import { fetchLobbyState } from "./api/fetch_service.js";
import { toId } from "./utils/common.js";

const handleCopyLobbyId = (_e, lobbyId) => {
  const copyToast = document.getElementById("copy-toast");
  navigator.clipboard.writeText(lobbyId);
  copyToast.removeAttribute("hidden", "");
  copyToast.classList.add("toast");
  setTimeout(() => {
    copyToast.setAttribute("hidden", "");
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
    lobbyIdContainer.replaceChildren(lobbyIdText, copyButton);
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

  const pawnImage = profileContainer.querySelector(".profile-image");
  pawnImage.src = `/images/${toId(profileData.character.name)}_profile.avif`;

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

const handleLeaveLobby = async (btn) => {
  btn.disabled = true;

  const { success } = await sendRequest({
    url: "/lobby/leave",
    method: "post",
  });

  if (success) {
    globalThis.window.location = "/pages/game-menu.html";
  }
};

const assignStartBtn = (isHost, playersCount, hostActions) => {
  const lobbyInfo = document.getElementById("lobby-status-actions");

  const startBtn = hostActions.querySelector("#lobby-start-btn");
  const leaveBtn = hostActions.querySelector("#leave-lobby-btn");

  startBtn.addEventListener("click", handleGameStart);
  leaveBtn.addEventListener("click", () => handleLeaveLobby(leaveBtn));

  const isWaiting = playersCount < 3;

  if (!isWaiting) {
    startBtn.removeAttribute("disabled");
  }

  if (isHost) {
    lobbyInfo.replaceChildren(startBtn, leaveBtn);
    return;
  }

  lobbyInfo.replaceChildren(leaveBtn);
};

const renderUi = (lobby, profilesTemplate, profilesContainer, hostActions) => {
  setupLobbyId(lobby.id, lobby.isHost, hostActions);
  setupProfiles(lobby, profilesTemplate, profilesContainer);
  setupLobbyStatus(lobby.isHost, lobby.players.length);
  assignStartBtn(lobby.isHost, lobby.players.length, hostActions);
};

const setupWaitingPage = () => {
  let prevEtag = null;

  const hostActionsTemplate = document.getElementById("host-actions");
  const profilesTemplate = document.getElementById("player-profile-template");
  const profilesContainer = document.querySelector(".profile-container");

  setInterval(async () => {
    const { etag, lobby, changed } = await fetchLobbyState(
      "/lobby",
      prevEtag,
    );

    prevEtag = etag;

    if (!changed) return;

    const hostActions = hostActionsTemplate.content.cloneNode(true);
    renderUi(lobby, profilesTemplate, profilesContainer, hostActions);
    redirectToSetupPage(lobby.isStarted);
  }, 1000);
};

globalThis.window.onload = setupWaitingPage;
