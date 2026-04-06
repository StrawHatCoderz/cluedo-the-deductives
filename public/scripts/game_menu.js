const hostLobby = (formData) =>
  fetch("/lobby/create", { method: "post", body: formData });

globalThis.window.onload = () => {
  const form = document.querySelector("form");
  const hostBtn = document.querySelector("#hostBtn");

  hostBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    hostLobby(formData);
  });
};
