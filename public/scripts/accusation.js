import { createCard } from "./render_player_cards.js";
import { displayPopup, sendRequest, toId, toSentenceCase } from "./utils.js";

const getTemplateClone = (templateId) => {
  const template = document.getElementById(templateId);
  return template.content.cloneNode(true);
};

const createOption = (option, optionLabel) => {
  const optionClone = getTemplateClone("option-template");
  const optionElement = optionClone.querySelector(".option");
  const input = optionClone.querySelector("input");
  const label = optionClone.querySelector("label");

  input.name = optionLabel;
  input.value = option;
  input.id = `accuse-${toId(option)}`;

  label.textContent = toSentenceCase(option);
  label.setAttribute("for", input.id);
  return optionElement;
};

const renderOptions = (optionsToRender) => {
  optionsToRender.forEach(({ options, label }) => {
    const optionsContainer = document.getElementById(label);

    const optionElements = options.map((option) => createOption(option, label));
    optionsContainer.append(...optionElements);
  });
};

const displayMurderCombination = (combination) => {
  const envelope = document.querySelector("#envelop");

  const cards = Object.values(combination).map((card) => {
    const cardClone = getTemplateClone("card-template");
    const matchingClass = card.isMatching ? "correct" : "incorrect";
    createCard(cardClone, card.name, ["envelop-card", matchingClass]);
    return cardClone;
  });
  envelope.append(...cards);
};

const matchCards = (accusingCombination, murderCombination) => {
  const accusedCards = Object.values(accusingCombination);
  const murderCards = Object.values(murderCombination);

  return murderCards.map((card) => ({
    name: card,
    isMatching: accusedCards.includes(card),
  }));
};

const handleAccusationSubmission = async (combination) => {
  const res = await sendRequest({
    url: "/turn/accuse",
    method: "post",
    body: combination,
  });

  const matchingCards = matchCards(combination, res.murderCombination);

  displayMurderCombination(matchingCards);

  if (res.isCorrect) {
    displayPopup("Congratulation, You Won!", "success");
    setTimeout(() => {
      globalThis.window.location.href = "/pages/victory.html";
    }, 3000);
  } else {
    displayPopup("The combination is wrong. You are eliminated", "error");
  }
};

const closePopup = (popup) => {
  setTimeout(() => {
    popup.remove();
  }, 3000);
};

const attachSubmitAccusationListener = () => {
  const form = document.querySelector("form");
  const accusationBackGround = document.getElementById("accusation-popup");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formdata = new FormData(form);
    const accusationDetails = Object.fromEntries(formdata.entries());
    const {
      suspects: suspect,
      weapons: weapon,
      rooms: room,
    } = accusationDetails;

    if (Object.keys(accusationDetails).length === 3) {
      await handleAccusationSubmission({ suspect, weapon, room });
      closePopup(accusationBackGround);
    } else {
      displayPopup("Incomplete combination", "error");
    }

    form.reset();
  });
};

const attachClosePopupListener = () => {
  const accusationBackGround = document.getElementById("accusation-popup");

  accusationBackGround.addEventListener("click", (e) => {
    if (e.target.id === "accusation-popup") {
      accusationBackGround.remove();
    }
  });
};

const renderAccusationForm = (suspects, weapons, rooms) => {
  const accusationTemplateClone = getTemplateClone("accusation-template");
  const accusationPopup = accusationTemplateClone.querySelector(
    "#accusation-popup",
  );

  const body = document.querySelector("body");
  body.appendChild(accusationPopup);
  attachClosePopupListener();
  renderOptions([suspects, weapons, rooms]);
  attachSubmitAccusationListener();
};

export const displayAccusationPopup = () => {
  const SUSPECTS = [
    "miss scarlett",
    "colonel mustard",
    "mrs white",
    "reverend green",
    "mrs peacock",
    "professor plum",
  ];

  const WEAPONS = [
    "dagger",
    "rope",
    "revolver",
    "spanner",
    "lead piping",
    "candlestick",
  ];

  const ROOMS = [
    "dining room",
    "kitchen",
    "ballroom",
    "conservatory",
    "billiard room",
    "library",
    "study",
    "hall",
    "lounge",
  ];

  renderAccusationForm(
    { label: "suspects", options: SUSPECTS },
    { label: "weapons", options: WEAPONS },
    { label: "rooms", options: ROOMS },
  );
};
