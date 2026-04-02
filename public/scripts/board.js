import { displayAccusationPopup } from "./accusation.js";
import { displayPopup } from "./utils.js";

const hightlightTiles = (tiles) => {
  tiles.forEach((turn) => {
    const tile = document.querySelector(`#${turn}`);
    tile.classList.add("highlight");
    tile.parentNode.appendChild(tile);
  });
};

const movePlayer = (tiles) => {
  tiles.map((turn) => {
    const tile = document.querySelector(`#${turn}`);
    tile.addEventListener("click", async (e) => {
      e.preventDefault();
      const currentNodeId = e.target.id;

      await fetch("/update-pawn-position", {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentNodeId, turns: tiles }),
      });
      globalThis.window.location.reload();
    });
  });
};

export const diceListener = (dice) => {
  dice.addEventListener("click", async (event) => {
    event.preventDefault();
    dice.setAttribute("disabled", true);

    const parsedResponse = await fetch("/roll-and-get-turns").then((response) =>
      response.json()
    );
    console.log(parsedResponse);

    const { diceValue, turns } = parsedResponse;
    const message = `dice value is ${diceValue}`;

    displayPopup(message);
    hightlightTiles(turns);
    movePlayer(turns);
  });
};

export const passBtnListener = (passBtn) => {
  passBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    const res = await fetch("/pass", { method: "post" });

    if (res.status === 200) {
      const { currentPlayer } = await res.json();
      displayPopup(`${currentPlayer.name} turns!`);
    }
  });
};

export const accuseBtnListener = (accuseBtn) => {
  accuseBtn.addEventListener("click", (event) => {
    event.preventDefault();
    displayAccusationPopup();
  });
};
