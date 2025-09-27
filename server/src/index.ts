import { Elysia, t } from "elysia";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .ws("/rpc", {
    body: t.Object({
      message: t.String(),
    }),
    query: t.Object({
      id: t.String(),
    }),
    message(ws, { message }) {
      const { id } = ws.data.query;
      ws.send({
        id,
        message,
        time: Date.now(),
      });
    },
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
