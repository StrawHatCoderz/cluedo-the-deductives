import { fetchGameState } from "../scripts/api/fetch_service.js";

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

export const displayInitialMessage = async () => {
  const { gameConfig } = await fetchGameState("/game");
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
