import {
  handleAccusationSubmission,
  ROOMS,
  SUSPECTS,
  WEAPONS,
} from "./utils/accusation_service.js";
import { createClone, createOption } from "./utils/ui_service.js";

const setupSubmitListner = (overlay) => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleAccusationSubmission(form, overlay);
  });
};

const renderOptions = (optionsToRender) => {
  optionsToRender.forEach(({ options, label }) => {
    const optionsContainer = document.getElementById(label);

    const optionElements = options.map((option) =>
      createOption(option, label, "accuse")
    );

    optionsContainer.append(...optionElements);
  });
};

const renderAccusationForm = (suspects, weapons, rooms) => {
  const accusationForm = createClone("accusation-form-template");

  const overlay = document.createElement("our-overlay");
  overlay.appendChild(accusationForm);

  document.body.appendChild(overlay);
  overlay.open();

  renderOptions([suspects, weapons, rooms]);
  setupSubmitListner(overlay);
};

export const displayAccusationOverlay = () => {
  const suspects = { label: "suspects", options: SUSPECTS };
  const weapons = { label: "weapons", options: WEAPONS };
  const rooms = { label: "rooms", options: ROOMS };

  renderAccusationForm(suspects, weapons, rooms);
};
