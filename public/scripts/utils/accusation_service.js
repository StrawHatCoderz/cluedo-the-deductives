import { displayPopup, sendRequest } from "../utils.js";
import { parseFormData } from "./api_service.js";

export const SUSPECTS = [
  "miss scarlett",
  "colonel mustard",
  "mrs white",
  "reverend green",
  "mrs peacock",
  "professor plum",
];

export const WEAPONS = [
  "dagger",
  "rope",
  "revolver",
  "spanner",
  "lead piping",
  "candlestick",
];

export const ROOMS = [
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

const handleInvalidAccusation = () => {
  const message = "Incomplete combination";
  displayPopup(message, "error");
};

const isValidAccusation = (accusationDetails) =>
  Object.keys(accusationDetails).length === 3;

export const handleAccusationSubmission = async (form, overlay) => {
  const accusationDetails = parseFormData(form);
  const { suspects: suspect, weapons: weapon, rooms: room } = accusationDetails;

  if (!isValidAccusation(accusationDetails)) {
    return handleInvalidAccusation(accusationDetails);
  }

  await sendRequest({
    url: "/turn/accuse",
    method: "post",
    body: { suspect, weapon, room },
  });

  overlay.close();
  form.reset();
};
