import { Elysia, t } from "elysia";
import { RpcTarget, newWebSocketRpcSession } from "capnweb";
import { WsAdapter } from "./ws-adapter";

// RPC common shared interfaces/types
export type UserInfo = {
  id: string;
  name: string;
};

export interface AuthenticatedAPI {
  getMyInfo(): UserInfo;
}

export interface PublicAPI {
  authenticate(token: string): AuthenticatedAPI;
  getTodaysDate(): string;
}

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

const shims = new Map<String, WsAdapter>();

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  // Normal WS without RPC
  .ws("/ws", {
    body: t.Object({
      message: t.String(),
    }),
    query: t.Object({
      id: t.String(),
    }),
    // On new WS connection
    open(ws) {
      console.info("New connection at /ws: ", ws.id);
    },
    message(ws, { message }) {
      const { id } = ws.data.query;
      ws.send({
        id,
        message,
        time: Date.now(),
      });
    },
  })
  // WS with RPC
  .ws("/rpc", {
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
    message(ws, message) {
      console.info("Received message ", message);
      // capnweb expects { data } on message events
      shims.get(ws.id)?.dispatch("message", { data: JSON.stringify(message) });
    },
    close(ws, code, reason) {
      console.info("Closing connection ", code, reason);
      shims.get(ws.id)?.dispatch("close", { code, reason });
      shims.delete(ws.id);
    },
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
