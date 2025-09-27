import { Elysia, t } from "elysia";
import { RpcTarget, newWebSocketRpcSession } from "capnweb";
import type { ServerWebSocket } from "bun";

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
  });

type Listener = (ev: any) => void;

// Minimal “WebSocket-like” interface capnweb can work with
class WsAdapter {
  private listeners = new Map<string, Set<Listener>>();
  constructor(private ws: ServerWebSocket<any>) {}

  send(data: string | ArrayBuffer | Uint8Array) {
    this.ws.send(data);
  }
  close(code?: number, reason?: string) {
    this.ws.close(code, reason);
  }

  addEventListener(type: string, cb: Listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(cb);
  }
  removeEventListener(type: string, cb: Listener) {
    this.listeners.get(type)?.delete(cb);
  }

  // helper for Bun hooks to notify capnweb
  dispatch(type: string, ev: any) {
    this.listeners.get(type)?.forEach((cb) => cb(ev));
  }
}

const shims = new WeakMap<ServerWebSocket<any>, WsAdapter>();

const server = Bun.serve({
  port: 3000,
  fetch(req, srv) {
    const url = new URL(req.url);

    // Upgrade `/rpc` to WS; everything else goes to Elysia
    if (url.pathname === "/rpc" && req.headers.get("upgrade") === "websocket") {
      if (srv.upgrade(req)) return;
      return new Response("WS upgrade failed", { status: 500 });
    }
    return app.fetch(req);
  },
  websocket: {
    open(ws) {
      const shim = new WsAdapter(ws);
      shims.set(ws, shim);

      // let capnweb attach its listeners on the shim
      newWebSocketRpcSession(shim as unknown as WebSocket, new PublicAPIImpl());

      // notify “open” to any capnweb listeners
      shim.dispatch("open", {});
    },
    message(ws, message) {
      // capnweb expects { data } on message events
      shims.get(ws)?.dispatch("message", { data: message });
    },
    close(ws, code, reason) {
      shims.get(ws)?.dispatch("close", { code, reason });
      shims.delete(ws);
    },
  },
});

console.log("Listening on", server.url);
