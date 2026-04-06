export const parseBody = async (c, next) => {
  if (c.req.method === "GET" || c.req.method === "HEAD") {
    return next();
  }

  if (c.req.header()["content-type"].includes("form")) {
    c.set("body", await c.req.parseBody());
  } else {
    c.set("body", await c.req.json());
  }

  return next();
};
