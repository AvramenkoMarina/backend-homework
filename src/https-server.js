import tls from "node:tls";
import { readFileSync } from "node:fs";
import { parseRequest, routeHandler, serialize } from "./http-core.js";

const server = tls.createServer(
  {
    key: readFileSync("key.pem"),
    cert: readFileSync("cert.pem"),
  },
  (socket) => {
    let buf = "";
    socket.on("data", (data) => {
      buf += data.toString("latin1");
      const req = parseRequest(buf);
      if (!req) return;

      socket.write(serialize(routeHandler(req)));
      socket.end();
    });
  },
);

server.listen(3443, () => {
  console.log("Server is running on port 3443");
});
