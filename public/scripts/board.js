import { displayPopup } from "./utils.js";

const highlightTurns = (turns) => {
  turns.forEach((turn) => {
    const tile = document.querySelector(`#${turn}`);
    tile.classList.add("highlight");
    tile.parentNode.appendChild(tile);
  });
};

const movePlayer = (turns) => {
  turns.map((turn) => {
    const tile = document.querySelector(`#${turn}`);
    tile.addEventListener("click", async (e) => {
      e.preventDefault();
      const currentNodeId = e.target.id;

      await fetch("/update-pawn-position", {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentNodeId, turns }),
      });
      globalThis.window.location.reload();
    });
  });
};

export const diceListener = (dice) => {
  dice.addEventListener("click", async (event) => {
    event.preventDefault();
    dice.setAttribute("disabled", true);

    const { diceValue, turns } = await fetch("/roll-and-get-turns").then(
      (response) => response.json(),
    );
    const message = `dice value is ${diceValue}`;

    displayPopup(message);
    highlightTurns(turns);
    movePlayer(turns);
  });
};

export const passBtnListener = (passBtn) => {
  passBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    const res = await fetch("/pass", { method: "post" });

    if (res.status === 200) {
      const { currentPlayer } = await res.json();
      displayPopup(`${currentPlayer.playerName} turns!`);
    }
  });
};
