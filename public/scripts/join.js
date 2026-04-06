const hostJoin = (body) =>
  fetch("/lobby/join", {
    method: "post",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  })
    .then((res) => res.json());

const handleJoin = async (e, form) => {
  e.preventDefault();
  const roomId = new FormData(form).get("room");
  const username = localStorage.getItem("username");
  const { success, error } = await hostJoin({ roomId, username });

  if (success) {
    localStorage.clear();
    globalThis.window.location.href = "/pages/waiting.html";
    return;
  }

  alert(error);
};

globalThis.window.onload = () => {
  const form = document.querySelector("form");
  const joinBtn = document.querySelector("#joinBtn");

  joinBtn.addEventListener("click", (e) => handleJoin(e, form));
};
