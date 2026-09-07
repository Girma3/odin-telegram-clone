import dotenv from "dotenv";
dotenv.config();
import http from "http";
import attachWebSocketServer from "./sockets/server.js";
import app from "./app.js";
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
//websocket return wss so after auth we use it
app.locals.wss = attachWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
