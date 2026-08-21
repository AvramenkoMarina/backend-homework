const CONTENT_TYPES = {
  textPlain: "text/plain",
};

const STATUS_CODES = {
  200: "OK",
  404: "Not Found",
};

export function serialize({ status, type, body }) {
  return (
    `HTTP/1.1 ${status} ${STATUS_CODES[status]}\r\n` +
    `Content-Type: ${type}\r\n` +
    `Content-Length: ${Buffer.byteLength(body)}\r\n` +
    "Connection: close\r\n\r\n" +
    body
  );
}

export function parseRequest(buf) {
  const headerEnd = buf.indexOf("\r\n\r\n");
  if (headerEnd === -1) return null;
  const [requestLine, ...headerLines] = buf.slice(0, headerEnd).split("\r\n");
  const [method, path, httpVersion] = requestLine.split(" ");
  const headers = Object.fromEntries(
    headerLines.map((line) => {
      const i = line.indexOf(":");
      return [line.slice(0, i).toLowerCase(), line.slice(i + 1).trim()];
    }),
  );
  return { method, path, httpVersion, headers };
}

function headersStringify(headers) {
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

export function routeHandler({ path, headers }) {
  switch (path) {
    case "/":
      return { status: 200, type: CONTENT_TYPES.textPlain, body: "Hello" };

    case "/headers":
      return {
        status: 200,
        type: CONTENT_TYPES.textPlain,
        body: headersStringify(headers),
      };

    default:
      return { status: 404, type: CONTENT_TYPES.textPlain, body: "" };
  }
}
