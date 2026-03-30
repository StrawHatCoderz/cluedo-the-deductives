import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { createApp } from "../src/app.js";

describe("TEST", () => {
  it(" => should app test", async () => {
    const app = createApp();
    const res = await app.request("/");
    await res.text();
    assertEquals(res.status, 200);
  });
});
