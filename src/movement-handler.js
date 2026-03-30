const rollDice = (diceNumber) => Math.ceil(diceNumber() * 6);

export const getRolledNumber = (diceNumber = Math.random) => {
  const dice1 = rollDice(diceNumber);
  const dice2 = rollDice(diceNumber);
  return dice1 + dice2;
};
