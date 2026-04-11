export class Shimmer {
  constructor(element, options = {}) {
    if (!element) throw new Error("Shimmer element is required");

    this.element = element;
    this.timer = null;
    this.isShimmering = false;

    this.minDelay = options.minDelay ?? 2000;
    this.maxDelay = options.maxDelay ?? 6000;
    this.autoStart = options.autoStart ?? true;

    this.handleAnimationEnd = this.handleAnimationEnd.bind(this);

    this.element.addEventListener(
      "animationend",
      this.handleAnimationEnd,
    );
  }

  init() {
    if (this.autoStart) {
      this.scheduleNext();
    }
    return this;
  }

  trigger() {
    if (this.isShimmering) return;

    this.isShimmering = true;

    this.element.classList.remove("active");
    void this.element.offsetWidth;
    this.element.classList.add("active");
  }

  scheduleNext() {
    this.clear();

    const delay = this.minDelay +
      Math.random() * (this.maxDelay - this.minDelay);

    this.timer = setTimeout(() => {
      this.trigger();
    }, delay);
  }

  handleAnimationEnd() {
    this.isShimmering = false;
    this.element.classList.remove("active");
    this.scheduleNext();
  }

  clear() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  destroy() {
    this.clear();
    this.element.classList.remove("active");
    this.element.removeEventListener(
      "animationend",
      this.handleAnimationEnd,
    );
    this.isShimmering = false;
  }
}
