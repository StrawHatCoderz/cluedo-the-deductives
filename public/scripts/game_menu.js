const hostLobby = (formData) =>
  fetch("/lobby/create", { method: "post", body: formData })
    .then((res) => res.json());

globalThis.window.onload = () => {
  const form = document.querySelector("form");
  const hostBtn = document.querySelector("#hostBtn");

  hostBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const { success, error } = await hostLobby(formData);
    if (success) {
      globalThis.window.location.href = "/pages/waiting.html";
      return;
    }
    alert(error);
  });
};
