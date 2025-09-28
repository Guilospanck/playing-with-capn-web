import { newWebSocketRpcSession, RpcTarget } from "capnweb";
import { Elysia, t } from "elysia";

import { WsAdapter } from "@/adapters/ws-adapter";

export interface AuthenticatedAPI {
  getMyInfo(): UserInfo;
}

export interface PublicAPI {
  authenticate(token: string): AuthenticatedAPI;
  getTodaysDate(): string;
}

// RPC common shared interfaces/types
export type UserInfo = {
  id: string;
  name: string;
};

class AuthenticatedAPIImpl extends RpcTarget implements AuthenticatedAPI {
  getMyInfo(): UserInfo {
    console.info("Calling `getMyInfo`");
    return {
      id: "adfjkafj",
      name: "Larry",
    };
  }
}

class PublicAPIImpl extends RpcTarget implements PublicAPI {
  authenticate(token: string): AuthenticatedAPI {
    console.info("Calling `authenticate` with ", token);
    if (token === "Tolkien") {
      return new AuthenticatedAPIImpl();
    }

    throw new Error();
  }
  getTodaysDate(): string {
    console.info("Calling `getTodaysDate`");
    return new Date().toISOString();
  }
}

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
      console.info("Received message ", message);
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
  .listen(3000);

console.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
