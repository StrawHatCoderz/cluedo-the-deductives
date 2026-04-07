import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { parseBody } from "../../src/middleware/parse_body.js";

describe("parse body", () => {
  it(" => shouldn't set body if method is GET", () => {
    let body;
    const context = {
      req: {
        method: "GET",
      },
      set: (x) => {
        body = x;
      },
    };

    parseBody(context, () => {});
    assertEquals(body, undefined);
  });

  it(" => shouldn't set body if method is HEAD", () => {
    let body;
    const context = {
      req: {
        method: "HEAD",
      },
      set: (x) => {
        body = x;
      },
    };

    parseBody(context, () => {});
    assertEquals(body, undefined);
  });

  it(" => shouldn't set body if method is not GET and HEAD and content type is formdata", async () => {
    const mockBody = {};

    const context = {
      req: {
        method: "POST",
        header: () => ({ "content-type": "multipart/formdata" }),
        parseBody: () => Promise.resolve("1"),
      },
      set: (key, value) => {
        mockBody[key] = value;
      },
    };

    await parseBody(context, () => {});
    assertEquals(mockBody, { body: "1" });
  });

  it(" => shouldn't set body if method is not GET and HEAD and content type is json", async () => {
    const mockBody = {};

    const context = {
      req: {
        method: "POST",
        header: () => ({ "content-type": "application/json" }),
        json: () => Promise.resolve("1"),
      },
      set: (key, value) => {
        mockBody[key] = value;
      },
    };

    await parseBody(context, () => {});
    assertEquals(mockBody, { body: "1" });
  });
});
