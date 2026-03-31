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

export const diceListener = (dice, p) => {
  dice.addEventListener("click", async (event) => {
    event.preventDefault();
    const { diceValue, turns } = await fetch("/roll-and-get-turns").then((
      response,
    ) => response.json());
    const message = `dice value is ${diceValue}`;
    displayPopup(p, message);
    highlightTurns(turns);
  });
};
