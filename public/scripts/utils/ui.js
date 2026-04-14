import { displayPopup } from "../../components/popup.js";
import { removePawnHighlight } from "../suspicion.js";
import { toId, toNormalCase } from "./common.js";

export const createOption = (option, optionLabel, optionFor) => {
  const optionClone = createClone("option-template");
  const optionElement = optionClone.querySelector(".option");
  const input = optionClone.querySelector("input");
  const label = optionClone.querySelector("label");

  const optionId = `${optionFor}-${toId(option)}`;

  input.name = optionLabel;
  input.value = option;
  input.id = optionId;

  label.textContent = toNormalCase(option);
  label.setAttribute("for", optionId);

  return optionElement;
};

export const createClone = (templateId) => {
  const template = document.getElementById(templateId);
  return template.content.cloneNode(true);
};

export const disableButtons = (boardConfig) => {
  const accuseBtn = document.querySelector("#accuse-button");
  const passBtn = document.querySelector("#pass-button");
  const path = boardConfig.possiblePaths;

  if (path.length && boardConfig.isPlayerActive) {
    passBtn?.setAttribute("disabled", "");
    accuseBtn?.setAttribute("disabled", "");
    removePawnHighlight();
    return;
  }

  if (boardConfig.hasDisproved) {
    accuseBtn?.setAttribute("disabled", "");
    return;
  }

  if (boardConfig.canPass) {
    passBtn?.removeAttribute("disabled");
  } else {
    passBtn?.setAttribute("disabled", "");
  }

  accuseBtn?.removeAttribute("disabled");
};

export const toggleActionButton = ({ isPlayerActive }) => {
  const actionsContainer = document.querySelector(".action-buttons");

  if (!isPlayerActive) {
    actionsContainer.classList.add("hide");
    return;
  }

  actionsContainer.classList.remove("hide");
  const isTurnPopUpShown = localStorage.getItem("isTurnPopUpShown") ?? "";

  if (!isTurnPopUpShown) {
    localStorage.setItem("isTurnPopUpShown", "1");
    displayPopup("It's Your Turn");
  }
};

export const createCard = (node, card, cardStyles = ["player-card"]) => {
  const cardImg = node.querySelector(".player-card");
  const imgName = card.split(" ").join("_");
  cardImg.src = `/images/${imgName}.jpg`;
  cardImg.alt = card;
  cardImg.classList.add(...cardStyles);
};
