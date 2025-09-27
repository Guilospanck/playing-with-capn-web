import { Elysia, t } from "elysia";
import { RpcTarget, newWebSocketRpcSession } from "capnweb";

// RPC common shared interfaces/types
type UserInfo = {
  id: string;
  name: string;
};

interface AuthenticatedAPI {
  getMyInfo(): UserInfo;
}

interface PublicAPI {
  authenticate(token: string): AuthenticatedAPI;
  getTodaysDate(): string;
}

class AuthenticatedAPIImpl extends RpcTarget implements AuthenticatedAPI {
  getMyInfo(): UserInfo {
    return {
      id: "adfjkafj",
      name: "Larry",
    };
  }
}

class PublicAPIImpl extends RpcTarget implements PublicAPI {
  authenticate(token: string): AuthenticatedAPI {
    if (token === "Tolkien") {
      return new AuthenticatedAPIImpl();
    }

    throw new Error();
  }
  getTodaysDate(): string {
    return Date.now().toLocaleString();
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
  })
  // WS with RPC
  .ws("/rpc", {
    // On new WS connection
    open(ws) {
      console.info("New connection at /rpc: ", ws.id);
      newWebSocketRpcSession(ws as any, new PublicAPIImpl());
    },
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
