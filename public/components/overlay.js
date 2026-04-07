class Overlay extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById("overlay-template");
    const content = template.content.cloneNode(true);

    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <link rel="stylesheet" href="/styles/overlay.css">
    `;

    shadow.appendChild(content);
  }

  connectedCallback() {
    this.addEventListener("click", (e) => {
      if (e.target === this) {
        this.close();
      }
    });
  }

  open() {
    this.setAttribute("open", "");
  }

  close() {
    this.removeAttribute("open");
    this.remove();
  }
}

customElements.define("our-overlay", Overlay);
