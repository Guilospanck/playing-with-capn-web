import type { ElysiaWS } from "elysia/ws";

type Listener = (ev: unknown) => void;

// Minimal “WebSocket-like” interface capnweb can work with
export class WsAdapter {
  private listeners = new Map<string, Set<Listener>>();
  constructor(private ws: ElysiaWS) {}

  addEventListener(type: string, cb: Listener) {
    console.info("Adding listener to type: ", type);
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(cb);
  }
  close(code?: number, reason?: string) {
    this.ws.close(code, reason);
  }

  // helper for Bun hooks to notify capnweb
  dispatch(type: string, ev: unknown) {
    console.info("Dispatching type: ", type);
    this.listeners.get(type)?.forEach((cb) => cb(ev));
  }
  removeEventListener(type: string, cb: Listener) {
    console.info("Removing listener to type: ", type);
    this.listeners.get(type)?.delete(cb);
  }

  send(data: string | ArrayBuffer | Uint8Array) {
    console.info("Calling send from the WS adapter: ", data);
    this.ws.send(data);
  }
}
