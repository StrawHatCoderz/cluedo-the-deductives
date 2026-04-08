import { toId, toSentenceCase } from "../utils.js";

export const createOption = (option, optionLabel, optionFor) => {
  const optionClone = createClone("option-template");
  const optionElement = optionClone.querySelector(".option");
  const input = optionClone.querySelector("input");
  const label = optionClone.querySelector("label");

  const optionId = `${optionFor}-${toId(option)}`;

  input.name = optionLabel;
  input.value = option;
  input.id = optionId;

  label.textContent = toSentenceCase(option);
  label.setAttribute("for", optionId);

  return optionElement;
};

export const createClone = (templateId) => {
  const template = document.getElementById(templateId);
  return template.content.cloneNode(true);
};
