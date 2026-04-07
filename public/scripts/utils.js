import { renderActions } from "./board.js";
import { disproveASuspicion } from "./disprove.js";
import { renderBoard } from "./render_board.js";
import { renderPlayers } from "./render_player.js";
import { renderPlayerCards } from "./render_player_cards.js";
import { removePawnHighlight, suspicionBtnListener } from "./suspicion.js";
import { handleRedirectBasedOnGameState } from "./victory.js";

export const isCurrentPlayer = (playerId, currentPlayerId) =>
  playerId === currentPlayerId;

export const getCharacterColor = (char) => {
  const colors = {
    colonel_mustard: "#E1C05A",
    miss_scarlett: "#D42A2A",
    professor_plum: "#7D4CA1",
    mrs_peacock: "#2C75FF",
    reverend_green: "#2E7D32",
    mrs_white: "#FFFFFF",
  };

  return colors[char] || "white";
};

export const toId = (data) => data.toLowerCase().replace(" ", "_");

export const toSentenceCase = (data) =>
  data.charAt(0).toUpperCase() + data.slice(1);

const parsePlayersData = (players) => {
  return players.map((player) => ({
    id: player.id,
    name: player.name,
    pawn: toId(player.pawn.name),
    isEliminated: player.isEliminated,
    isWon: player.isWon,
  }));
};

const parsePawnsData = (pawns) => {
  return pawns.map(({ position, name, id }) => ({
    pos: {
      x: position?.x,
      y: position?.y,
      room: position?.room,
    },
    char: toId(name),
    name,
    id,
  }));
};

export const sendRequest = async ({ method, body, url }) => {
  const requestConfig = method === "post"
    ? {
      method,
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
      },
    }
    : { method };
  return await fetch(url, requestConfig).then((data) => data.json());
};

export const fetchGameConfig = async (url) => {
  const { data: gameContext } = await sendRequest({ url });

  return {
    state: gameContext.state,
    players: parsePlayersData(gameContext.players),
    pawns: parsePawnsData(gameContext.pawns),
    currentPlayer: {
      id: gameContext.activePlayer.id,
      hand: gameContext.hand,
      pawn: gameContext.activePlayer.pawn,
    },
    canRoll: gameContext.canRoll,
    canSuspect: gameContext.canSuspect,
    secretPassageId: gameContext.secretPassageId,
  };
};

export const fetchLobbyState = async (url) => {
  const { data } = await sendRequest({ url });
  return data;
};

const DOT_COLORS = {
  success: "#1D9E75",
  error: "#E24B4A",
  info: "#378ADD",
  default: "#888780",
};

export const displayPopup = (message, type = "default") => {
  const popup = document.querySelector(".popup");
  const dot = popup.querySelector(".popup-dot");
  const p = popup.querySelector("p");

  dot.style.background = DOT_COLORS[type] ?? DOT_COLORS.default;
  p.textContent = message;
  popup.classList.add("visible");

  setTimeout(() => {
    popup.classList.remove("visible");
    setTimeout(() => {
      p.textContent = "";
    }, 200);
  }, 2000);
};

export const getHighlightPath = () => {
  const reachableNodes = localStorage.getItem("reachableNodes") ?? "[]";
  return JSON.parse(reachableNodes);
};

const disableButtons = () => {
  const accuseBtn = document.querySelector("#accuse-button");
  const passBtn = document.querySelector("#pass-button");
  const path = getHighlightPath();

  if (path.length) {
    passBtn.setAttribute("disabled", "");
    accuseBtn.setAttribute("disabled", "");
    removePawnHighlight();
  } else {
    accuseBtn.removeAttribute("disabled");
  }
};

export const polling = (playerCardsContainer) => {
  let prevState = null;

  setInterval(async () => {
    const newState = await fetchGameConfig("/game-state");

    disableButtons();
    if (JSON.stringify(newState) !== JSON.stringify(prevState)) {
      handleRedirectBasedOnGameState(newState);
      renderBoard(newState);
      renderPlayers(newState);
      renderPlayerCards(newState.currentPlayer.hand, playerCardsContainer);
      renderActions(newState);
      suspicionBtnListener(newState);
      newState.hasSuspected && disproveASuspicion(newState);
      prevState = newState;
    }
  }, 300);
};

export const displayInitialMessage = async () => {
  const boardConfig = await fetchGameConfig("/game-state");
  const alreadyShown = sessionStorage.getItem("gameStartedPopup");

  if (boardConfig.state === "running" && !alreadyShown) {
    displayPopup("Game has started!", "info");
    sessionStorage.setItem("gameStartedPopup", "true");
  }
};

export const displayAlertToast = (popup, message) => {
  popup.textContent = message;
  popup.style.opacity = 1;

  setTimeout(() => {
    popup.style.opacity = 0;
  }, 1000);
};
