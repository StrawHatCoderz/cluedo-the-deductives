import { displayAlertToast } from "../components/popup.js";

const hostLobby = (formData) =>
  fetch("/lobby/create", { method: "post", body: formData }).then((res) =>
    res.json()
  );

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
  const name = new FormData(form).get("name");

  if (!name) {
    const alertPopup = document.querySelector("#alert-toast");
    displayAlertToast(alertPopup, "Invalid name");
    return;
  }
  localStorage.setItem("name", name);
  globalThis.window.location.href = "/pages/join.html";
};

const displayRules = () => {
  const rules = document.querySelector("#game-rules");
  rules.toggleAttribute("hidden");
};

const closeRules = (e) => {
  const rules = e.target.closest("#game-rules");
  rules.toggleAttribute("hidden");
};

globalThis.window.onload = () => {
  const form = document.querySelector("form");
  const hostBtn = document.querySelector("#hostBtn");
  const joinBtn = document.querySelector("#joinBtn");
  const about = document.querySelector("#about-btn");
  const close = document.querySelector("#close");
  close.addEventListener("click", closeRules);
  about.addEventListener("click", displayRules);
  form.addEventListener("submit", (e) => e.preventDefault());
  hostBtn.addEventListener("click", (e) => handleHost(e, form));
  joinBtn.addEventListener("click", (e) => handleJoin(e, form));
};
