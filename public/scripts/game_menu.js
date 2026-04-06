import { displayAlertToast } from "./utils.js";

const hostLobby = (formData) =>
  fetch("/lobby/create", { method: "post", body: formData })
    .then((res) => res.json());

const handleHost = async (e, form) => {
  e.preventDefault();
  const formData = new FormData(form);
  const { success, error } = await hostLobby(formData);

  if (success) {
    globalThis.window.location.href = "/pages/waiting.html";
    return;
  }

  const alertPopup = document.querySelector("#alert-toast");
  displayAlertToast(alertPopup, error);
};

const handleJoin = (e, form) => {
  e.preventDefault();
  const username = new FormData(form).get("username");

  if (!username) {
    const alertPopup = document.querySelector("#alert-toast");
    displayAlertToast(alertPopup, "Invalid Username");
    return;
  }
  localStorage.setItem("username", username);
  globalThis.window.location.href = "/pages/join.html";
};

globalThis.window.onload = () => {
  const form = document.querySelector("form");
  const hostBtn = document.querySelector("#hostBtn");
  const joinBtn = document.querySelector("#joinBtn");

  hostBtn.addEventListener("click", (e) => handleHost(e, form));
  joinBtn.addEventListener("click", (e) => handleJoin(e, form));
};
