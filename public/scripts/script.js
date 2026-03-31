globalThis.onload = () => {
  const dice = document.querySelector("#dice-button");
  dice.addEventListener("click", async (event) => {
    event.preventDefault();
    const { diceValue } = await fetch("/get-dice-value")
      .then((response) => response.json());
    alert(diceValue);
  });
};
