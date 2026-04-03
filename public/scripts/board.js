import { displayAccusationPopup } from "./accusation.js";
import { displayPopup } from "./utils.js";

const highlightTiles = (tiles) => {
  tiles.forEach((turn) => {
    const tile = document.querySelector(`#${turn}`);
    tile.classList.add("highlight");
    tile.parentNode.appendChild(tile);
  });
};

const getHighlightPath = () => {
  const reachableNodes = localStorage.getItem("reachableNodes") ?? "[]";
  return JSON.parse(reachableNodes);
};

const handleMovePlayer = async (e, tiles, pawnId) => {
  e.preventDefault();
  const newNodeId = e.target.id;

  await fetch(`/update-pawn-position/${pawnId}`, {
    method: "put",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ newNodeId, tiles, isUsingSecretPassage: false }),
  });
  globalThis.window.location.reload();
  localStorage.clear();
};

const movePlayer = (tiles, pawnId) => {
  tiles.map((turn) => {
    const tile = document.querySelector(`#${turn}`);
    if (tile._handler) {
      tile.removeEventListener("click", tile._handler);
    }
    const handler = async (e) => await handleMovePlayer(e, tiles, pawnId);

    tile._handler = handler;
    tile.addEventListener("click", handler, { once: true });
  });
};

const fetchReachableNodes = () =>
  fetch("/get-reachable-nodes")
    .then((response) => response.json());

const fetchRollDice = () =>
  fetch("/roll", { method: "POST" })
    .then((response) => response.json());

const handleDiceClick = async (event, dice, pawnId) => {
  event.preventDefault();
  dice.setAttribute("disabled", true);

  const { diceValue } = await fetchRollDice();
  displayPopup(`dice value is ${diceValue}`);

  const { reachableNodes } = await fetchReachableNodes();
  localStorage.setItem("reachableNodes", JSON.stringify(reachableNodes));
  highlightTiles(reachableNodes);
  movePlayer(reachableNodes, pawnId);
};

const diceListener = (dice, pawnId) => {
  if (dice._handler) {
    dice.removeEventListener("click", dice._handler);
  }

  const handler = async (e) => await handleDiceClick(e, dice, pawnId);

  dice._handler = handler;
  dice.addEventListener("click", handler, { once: true });
};

const handlePass = async (event) => {
  event.preventDefault();
  const res = await fetch("/pass", { method: "post" });

  if (res.status === 200) {
    const { currentPlayer } = await res.json();
    displayPopup(`${currentPlayer.name} turns!`);
    localStorage.clear();
  }
};

const passBtnListener = (passBtn) => {
  if (passBtn._handler) {
    passBtn.removeEventListener("click", passBtn._handler);
  }

  const handler = async (e) => await handlePass(e, passBtn);

  passBtn._handler = handler;
  passBtn.addEventListener("click", handler, { once: true });
};

const handleSecretPassageClick = async (
  e,
  secretPassage,
  pawnId,
) => {
  e.preventDefault();
  await fetch(`/update-pawn-position/${pawnId}`, {
    method: "put",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      newNodeId: secretPassage,
      tiles: [secretPassage],
      isUsingSecretPassage: true,
    }),
  });
  globalThis.window.location.reload();
  localStorage.clear();
};

const clearAllSecretPassages = () => {
  const elements = document.querySelectorAll('[data-secret-passage="true"]');

  elements.forEach((el) => {
    if (el._handler) {
      el.removeEventListener("click", el._handler);
      el._handler = null;
    }

    el.classList.remove("highlight");
    delete el.dataset.secretPassage;
  });
};

const secretPassageHandler = (secretPassage, pawnId) => {
  clearAllSecretPassages();
  if (!secretPassage) return;

  const scrtPsgElement = document
    .querySelector(`rect[data-to="${secretPassage}"]`);
  const room = document.querySelector(`#${secretPassage}`);

  scrtPsgElement.classList.add("highlight");
  scrtPsgElement.dataset.secretPassage = "true";

  room.classList.add("highlight");
  room.dataset.secretPassage = "true";

  const handler = async (e) =>
    await handleSecretPassageClick(e, secretPassage, pawnId);

  scrtPsgElement._handler = handler;
  scrtPsgElement.addEventListener("click", handler, { once: true });
};

export const renderActions = (boardConfig) => {
  const dice = document.querySelector("#dice-button");
  const passBtn = document.querySelector("#pass-button");
  const accuseBtn = document.querySelector("#accuse-button");
  const attributeFn = !boardConfig.canRoll ? "setAttribute" : "removeAttribute";
  dice[attributeFn]("disabled", "");
  if (boardConfig.canRoll) {
    localStorage.clear();
  }

  diceListener(dice, boardConfig.currentPlayer.pawn.id);
  passBtnListener(passBtn);

  secretPassageHandler(
    boardConfig.secretPassageId,
    boardConfig.currentPlayer.pawn.id,
  );

  const path = getHighlightPath();
  if (path.length) {
    passBtn.setAttribute("disabled", "");
    accuseBtn.setAttribute("disabled", "");
    highlightTiles(path);
    movePlayer(path, boardConfig.currentPlayer.pawn.id);
  }
};

export const accuseBtnListener = (accuseBtn) => {
  accuseBtn.addEventListener("click", (event) => {
    event.preventDefault();
    displayAccusationPopup();
  });
};
