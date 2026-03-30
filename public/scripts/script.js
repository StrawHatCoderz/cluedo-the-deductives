globalThis.onload = () => {
  const dice = document.querySelector("#dice");
  dice.addEventListener("click", (event) => {
    event.preventDefault();
    // const { diceValue } = await fetch("/getDiceValue")
    //   .then((response) => response.json());
    alert("dice rolled");
  });
};
