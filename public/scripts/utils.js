import { renderAccusationResult } from "./accusation_result.js";
import { renderActions } from "./board.js";
import { disproveASuspicion } from "./disprove.js";
import { renderBoard } from "./render_board.js";
import { renderPlayers } from "./render_player.js";
import { renderPlayerCards } from "./render_player_cards.js";
import { removePawnHighlight, suspicionBtnListener } from "./suspicion.js";
import { handleRedirectBasedOnGameState } from "./victory.js";

export const closeOverlay = (overlay, ms = 5000) => {
  setTimeout(() => {
    overlay?.close();
  }, ms);
};

export const isActivePlayer = (playerId, activePlayer) =>
  playerId === activePlayer.id;

export const isCurrentPlayer = (playerId, currentPlayer) =>
  playerId === currentPlayer.id;

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
export const toNormalCase = (data) => data.replace("_", " ");

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
  return await fetch(url, requestConfig)
    .then((data) => data.json());
};

export const getWithEtagEnabled = async ({ method, body, url, etag }) => {
  const requestConfig = method === "post"
    ? {
      method,
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        "If-None-Match": etag,
      },
    }
    : { method, headers: { "If-None-Match": etag } };
  const res = await fetch(url, requestConfig);

  if (res.status === 304) {
    return { etag, changed: false };
  }

  const newEtag = res.headers.get("etag");
  const resBody = await res.json();
  return { etag: newEtag, body: resBody, changed: true };
};

export const fetchGameConfig = async (url, etag) => {
  const res = await getWithEtagEnabled({ url, etag });
  if (!res.changed) {
    return res;
  }
  const gameContext = res.body.data;
  const disprovalData = gameContext.disprovalData;

  const gameConfig = {
    state: gameContext.state,
    players: parsePlayersData(gameContext.players),
    pawns: parsePawnsData(gameContext.pawns),
    currentPlayer: {
      id: gameContext.currentPlayer.id,
      hand: gameContext.hand,
      pawn: gameContext.currentPlayer.pawn,
    },
    activePlayer: {
      id: gameContext.activePlayer.id,
      pawn: gameContext.activePlayer.pawn,
      name: gameContext.activePlayer.name,
    },
    canRoll: gameContext.canRoll,
    canSuspect: gameContext.canSuspect,
    secretPassageId: gameContext.secretPassageId,
    isPlayerActive:
      gameContext.currentPlayer.id === gameContext.activePlayer.id,
    diceValues: gameContext.diceValues,
    shouldShowDicePopup: gameContext.shouldShowDicePopup,
    ...disprovalData,
    shouldShowAccusationResult: gameContext.shouldShowAccusationResult,
    accusationDetails: gameContext.accusationDetails,
    murderCombination: gameContext.murderCombination,
    possiblePaths: gameContext.possiblePaths,
    canPass: gameContext.canPass,
  };
  return { etag: res.etag, changed: res.changed, gameConfig };
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

const disableButtons = (boardConfig) => {
  const accuseBtn = document.querySelector("#accuse-button");
  const passBtn = document.querySelector("#pass-button");
  const path = boardConfig.possiblePaths;

  if (path.length && boardConfig.isPlayerActive) {
    passBtn?.setAttribute("disabled", "");
    accuseBtn?.setAttribute("disabled", "");
    removePawnHighlight();
    return;
  }

  if (boardConfig.hasDisproved) {
    accuseBtn?.setAttribute("disabled", "");
    return;
  }

  if (boardConfig.canPass) {
    passBtn?.removeAttribute("disabled");
  } else {
    passBtn?.setAttribute("disabled", "");
  }

  accuseBtn?.removeAttribute("disabled");
};

const toggleActionButton = ({ isPlayerActive }) => {
  const actionsContainer = document.querySelector(".action-buttons");

  if (!isPlayerActive) {
    actionsContainer.classList.add("hide");
    return;
  }

  actionsContainer.classList.remove("hide");
  const isTurnPopUpShown = localStorage.getItem("isTurnPopUpShown") ?? "";

  if (!isTurnPopUpShown) {
    localStorage.setItem("isTurnPopUpShown", "1");
    displayPopup("It's Your Turn");
  }
};

export const fetchLobbyStateWithEtag = async (url, etag) => {
  const res = await getWithEtagEnabled({ url, etag });

  if (!res.changed) {
    return res;
  }

  return {
    etag: res.etag,
    changed: true,
    lobby: res.body.data,
  };
};

export const polling = (playerCardsContainer) => {
  let prevEtag = null;

  setInterval(async () => {
    const { etag, changed, gameConfig } = await fetchGameConfig(
      "/game",
      prevEtag,
    );
    prevEtag = etag;

    if (changed) {
      disableButtons(gameConfig);
      handleRedirectBasedOnGameState(gameConfig);
      renderBoard(gameConfig);
      renderPlayers(gameConfig);
      renderPlayerCards(gameConfig.currentPlayer.hand, playerCardsContainer);
      suspicionBtnListener(gameConfig);
      gameConfig.hasSuspected && disproveASuspicion(gameConfig);
      toggleActionButton(gameConfig);
      renderActions(gameConfig);
      if (gameConfig.shouldShowAccusationResult) {
        renderAccusationResult(gameConfig);
      }
    }
  }, 1000);
};

export const displayInitialMessage = async () => {
  const { gameConfig } = await fetchGameConfig("/game");
  const alreadyShown = sessionStorage.getItem("gameStartedPopup");

  if (gameConfig.state === "running" && !alreadyShown) {
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
