import { newWebSocketRpcSession } from "capnweb";
import { Elysia, t } from "elysia";

import { WsAdapter } from "@/adapters/ws-adapter";
import { db } from "@/db";

import { PublicAPIImpl } from "./protocols/rpc";

const shims = new Map<string, WsAdapter>();

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  // Normal WS without RPC
  .ws("/ws", {
    body: t.Object({
      message: t.String(),
    }),
    message(ws, { message }) {
      const { id } = ws.data.query;
      ws.send({
        id,
        message,
        time: Date.now(),
      });
    },
    // On new WS connection
    open(ws) {
      console.info("New connection at /ws: ", ws.id);
    },
    query: t.Object({
      id: t.String(),
    }),
  })
  // WS with RPC
  .ws("/rpc", {
    close(ws, code, reason) {
      console.info("Closing connection ", code, reason);
      shims.get(ws.id)?.dispatch("close", { code, reason });
      shims.delete(ws.id);
    },
    message(ws, message) {
      // capnweb expects { data } on message events
      shims.get(ws.id)?.dispatch("message", { data: JSON.stringify(message) });
    },
    // On new WS connection
    open(ws) {
      console.info("New connection at /rpc: ", ws.id);

      const shim = new WsAdapter(ws);
      shims.set(ws.id, shim);

      // let capnweb attach its listeners on the shim
      newWebSocketRpcSession(shim as unknown as WebSocket, new PublicAPIImpl());

      // notify “open” to any capnweb listeners
      shim.dispatch("open", {});
    },
  })
  .onStop(() => {
    console.info("Server shutting down...closing DB connections");
    db.close();
  })
  .listen(3000);

console.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
