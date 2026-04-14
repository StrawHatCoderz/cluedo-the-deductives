export const sendRequest = async ({ method, body, url }) => {
  const requestConfig = method === "post"
    ? {
      method,
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
      },
    }
    : { method };
  return await fetch(url, requestConfig)
    .then((data) => data.json());
};

export const sendRequestWithEtagEnabled = async (
  { method, body, url, etag },
) => {
  const requestConfig = method === "post"
    ? {
      method,
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        "If-None-Match": etag,
      },
    }
    : { method, headers: { "If-None-Match": etag } };
  const res = await fetch(url, requestConfig);

  if (res.status === 304) {
    return { etag, changed: false };
  }

  const newEtag = res.headers.get("etag");
  const resBody = await res.json();
  return { etag: newEtag, body: resBody, changed: true };
};
