import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createApp } from "../src/app.js";

describe("TEST", () => {
  it(" => should app test", async () => {
    const app = createApp({ game: {}, logger: () => (_, next) => next() });
    const res = await app.request("/");
    await res.text();
    assertEquals(res.status, 200);
  });
});
