import { newWebSocketRpcSession, RpcTarget } from "capnweb";
import { Elysia, t } from "elysia";

import { WsAdapter } from "@/adapters/ws-adapter";
import { db } from "@/db";
import { randomUUIDv7 } from "bun";
import { User, type UserInfo } from "./db/models";

export interface AuthenticatedAPI {
  getMyInfo(): UserInfo;
}

export interface PublicAPI {
  createNewUser(name: string, email: string): AuthenticatedAPI;
  authenticate(token: string): AuthenticatedAPI;
  getTodaysDate(): string;
}

class AuthenticatedAPIImpl extends RpcTarget implements AuthenticatedAPI {
  constructor(private user: User) {
    super();
  }

  getMyInfo(): UserInfo {
    return this.user.toJSON();
  }
}

class PublicAPIImpl extends RpcTarget implements PublicAPI {
  createNewUser(name: string, email: string): AuthenticatedAPI {
    // Check if user exists
    const user = db
      .query(`SELECT * FROM User WHERE email = $email;`)
      .as(User)
      .get({ email });

    if (user !== null) {
      return new AuthenticatedAPIImpl(user);
    }

    // User does not exist. Create it
    const createdUser = db
      .query(
        `
          INSERT into User (id, name, email, token)
          VALUES ($id, $name, $email, $token)
          RETURNING *
        `,
      )
      .as(User)
      .get({
        id: randomUUIDv7(),
        name,
        email,
        token: randomUUIDv7(),
      });

    return new AuthenticatedAPIImpl(createdUser!); // Returned user can't be null. We just created it
  }
  authenticate(token: string): AuthenticatedAPI {
    const user = db
      .query(`SELECT * FROM User WHERE token = $token;`)
      .as(User)
      .get({ token });

    if (user === null) {
      throw new Error("404 NOT FOUND");
    }

    return new AuthenticatedAPIImpl(user);
  }
  getTodaysDate(): string {
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
    console.log("Server shutting down...closing DB connections");
    db.close();
  })
  .listen(3000);
console.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
