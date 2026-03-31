const displayPopup = (p, message) => {
  p.textContent = message;
  setTimeout(() => {
    p.textContent = "";
  }, 1000);
};

const highlightTurns = (turns) => {
  turns.forEach((turn) => {
    const tile = document.querySelector(`#${turn}`);
    tile.setAttribute("style", "fill:white");
  });
};

const movePlayer = (turns) => {
  turns.map((turn) => {
    const tile = document.querySelector(`#${turn}`);
    tile.addEventListener("click", async (e) => {
      e.preventDefault();
      const currentNodeId = e.target.id;
      const [_, x, y] = currentNodeId.split("-");
      await fetch("/update-pawn-position", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ x: parseInt(x), y: parseInt(y) }),
      });
    });
  });
};

export const diceListener = (dice, p) => {
  dice.addEventListener("click", async (event) => {
    event.preventDefault();
    dice.setAttribute("disabled", true);
    const { diceValue, turns } = await fetch("/roll-and-get-turns").then((
      response,
    ) => response.json());
    const message = `dice value is ${diceValue}`;
    displayPopup(p, message);
    highlightTurns(turns);
    movePlayer(turns);
  });
};
