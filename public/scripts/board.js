const displayPopup = (p, message) => {
  p.textContent = message;
  setTimeout(() => {
    p.textContent = "";
  }, 1000);
};

const highlightPaths = async () => {
  // const nodes = ["tile-9-1", "tile-14-1"];
  const { nodes } = await fetch("/get-reachable-nodes").then((response) =>
    response.json()
  );
  nodes.forEach((node) => {
    const tile = document.querySelector(`#${node}`);
    tile.setAttribute("style", "fill:white");
  });
};

export const diceListener = (dice, p) => {
  dice.addEventListener("click", async (event) => {
    event.preventDefault();
    const { diceValue } = await fetch("/get-dice-value").then((response) =>
      response.json()
    );
    const message = `dice value is ${diceValue}`;
    displayPopup(p, message);
    highlightPaths();
  });
};
