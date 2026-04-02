import { toId, toSentenceCase } from "./utils.js";

const getTemplateClone = (templateId) => {
  const template = document.querySelector(`#${templateId}`);
  return template.content.cloneNode(true);
};

const createOption = (option, optionLabel) => {
  const optionClone = getTemplateClone("option-template");
  const optionElement = optionClone.querySelector(".option");
  const input = optionClone.querySelector("input");
  const label = optionClone.querySelector("label");

  input.name = optionLabel;
  input.value = toId(option);
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

const renderAccusationForm = (suspects, weapons, rooms) => {
  const accusationTemplateClone = getTemplateClone("accusation-template");
  const accusationPopup = accusationTemplateClone.querySelector(
    "#accusation-popup",
  );

  const body = document.querySelector("body");
  body.appendChild(accusationPopup);
  renderOptions([suspects, weapons, rooms]);
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
