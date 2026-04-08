import { displayAccusationOverlay } from "./accusation.js";
import { showDiceAnimation } from "./dice_animation.js";
import { displayPopup, getHighlightPath, toId } from "./utils.js";

const removePlayerIcon = (pawn) => {
  const pawnId = toId(pawn.name);

  const selector = pawn.position.room
    ? `#${pawn.position.room}-group .room-slot[data-occupied-by=${pawnId}]`
    : `rect[data-occupied-by=${pawnId}]`;

  const prevTile = document.querySelector(selector);
  if (!prevTile) return;

  prevTile.removeAttribute("data-occupied-by");

  if (pawn.position.room) {
    prevTile.setAttribute("fill", "transparent");
    prevTile.classList.remove("highlight-suspect");
    return;
  }

  prevTile.removeAttribute("style");
};

const highlightTiles = (tiles) => {
  const svg = document.querySelector("#board-svg");

  tiles.forEach((turn) => {
    const el = document.querySelector(`#${turn}`);
    if (!el) return;

    const isRoom = el.tagName.toLowerCase() === "path";

    if (isRoom) {
      el.classList.add("highlight-room");
      svg.appendChild(el);
    } else {
      el.classList.add("highlight");
      el.parentNode.appendChild(el);
    }
  });
};

const clearHighlights = () => {
  document.querySelectorAll(".highlight").forEach((tile) => {
    tile.classList.remove("highlight");
    tile.removeEventListener("click", tile._handler);
    tile._handler = null;
  });

  document.querySelectorAll(".highlight-room").forEach((room) => {
    room.classList.remove("highlight-room");
    room.removeEventListener("click", room._handler);
    room._handler = null;

    const group = document.querySelector(`#${room.id}-group`);
    if (group) group.prepend(room);
  });
};

const handleMovePlayer = async (e, tiles, pawn) => {
  e.preventDefault();
  const newNodeId = e.target.id;

  await fetch(`/board/update-pawn-position/${pawn.id}`, {
    method: "put",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ newNodeId, tiles, isUsingSecretPassage: false }),
  });

  localStorage.removeItem("reachableNodes");
  removePlayerIcon(pawn);
  clearHighlights();
  const passBtn = document.querySelector("#pass-button");
  passBtn.removeAttribute("disabled");
};

const movePlayer = (tiles, pawn) => {
  tiles.forEach((turn) => {
    const tile = document.querySelector(`#${turn}`);
    if (!tile) return;

    if (tile._handler) {
      tile.removeEventListener("click", tile._handler);
    }

    const handler = async (e) => await handleMovePlayer(e, tiles, pawn);
    tile._handler = handler;
    tile.addEventListener("click", handler, { once: true });
  });
};

const fetchReachableNodes = () =>
  fetch("/board/reachable-nodes")
    .then((response) => response.json());

const fetchRollDice = () =>
  fetch("/turn/roll", { method: "POST" })
    .then((response) => response.json());

const handleDiceClick = async (event, dice, pawn) => {
  event.preventDefault();
  dice.setAttribute("disabled", true);

  const { diceValues } = await fetchRollDice();

  showDiceAnimation(diceValues, async () => {
    displayPopup(`dice value is ${diceValues[0] + diceValues[1]}`, "info");
    const { reachableNodes } = await fetchReachableNodes();
    localStorage.setItem("reachableNodes", JSON.stringify(reachableNodes));
    highlightTiles(reachableNodes);
    movePlayer(reachableNodes, pawn);
  });
};

const diceListener = (dice, pawn) => {
  if (dice._handler) {
    dice.removeEventListener("click", dice._handler);
  }

  const handler = async (e) => await handleDiceClick(e, dice, pawn);

  dice._handler = handler;
  dice.addEventListener("click", handler, { once: true });
};

const handlePass = async (event) => {
  event.preventDefault();
  const res = await fetch("/turn/pass", { method: "post" });

  if (res.status === 200) {
    const { currentPlayer } = await res.json();
    displayPopup(`${currentPlayer.name} turns!`, "info");
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
  pawn,
) => {
  e.preventDefault();
  await fetch(`/board/update-pawn-position/${pawn.id}`, {
    method: "put",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      newNodeId: secretPassage,
      tiles: [secretPassage],
      isUsingSecretPassage: true,
    }),
  });

  removePlayerIcon(pawn);
  clearAllSecretPassages();
  clearHighlights();

  localStorage.removeItem("reachableNodes");
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

const secretPassageHandler = (secretPassage, pawn) => {
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
    await handleSecretPassageClick(e, secretPassage, pawn);

  scrtPsgElement._handler = handler;
  scrtPsgElement.addEventListener("click", handler, { once: true });
};

const renderDice = (boardConfig) => {
  const dice = document.querySelector("#dice-button");

  if (boardConfig.canRoll) {
    dice.removeAttribute("disabled");
  } else {
    dice.setAttribute("disabled", "");
  }

  diceListener(dice, boardConfig.currentPlayer.pawn);
};

const renderPassBtn = () => {
  const passBtn = document.querySelector("#pass-button");
  passBtnListener(passBtn);
};

const showDiceAnimationForPassivePlayer = (boardConfig) => {
  if (!boardConfig.isPlayerActive && boardConfig.shouldShowDicePopup) {
    showDiceAnimation(boardConfig.diceValues, () => {
      displayPopup(
        `${boardConfig.activePlayer.name} rolled the dice and got ${
          boardConfig.diceValues[0] + boardConfig.diceValues[1]
        }`,
        "info",
      );
    });
  }
};

export const renderActions = (boardConfig) => {
  showDiceAnimationForPassivePlayer(boardConfig);
  const path = getHighlightPath();

  renderDice(boardConfig);
  renderPassBtn();
  secretPassageHandler(
    boardConfig.secretPassageId,
    boardConfig.currentPlayer.pawn,
  );

  if (boardConfig.canRoll) localStorage.removeItem("reachableNodes");
  if (path.length) {
    highlightTiles(path);
    movePlayer(path, boardConfig.currentPlayer.pawn);
  }
};

export const accuseBtnListener = (accuseBtn) => {
  accuseBtn.addEventListener("click", (event) => {
    event.preventDefault();
    displayAccusationOverlay();
  });
};
