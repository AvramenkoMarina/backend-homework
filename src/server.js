import net from "node:net";
import { parseRequest, routeHandler, serialize } from "./http-core.js";

const PORT = 3000;

const server = net.createServer((socket) => {
  let buf = "";
  socket.on("data", (chunk) => {
    buf += chunk.toString("latin1");
    const req = parseRequest(buf);
    if (!req) return;

    socket.write(serialize(routeHandler(req)));
    socket.end();
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
