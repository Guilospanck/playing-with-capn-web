import type { ElysiaWS } from "elysia/ws";

type Listener = (ev: any) => void;

// Minimal “WebSocket-like” interface capnweb can work with
export class WsAdapter {
  private listeners = new Map<string, Set<Listener>>();
  constructor(private ws: ElysiaWS<any>) {}

  send(data: string | ArrayBuffer | Uint8Array) {
    console.info("Calling send from the WS adapter: ", data);
    this.ws.send(data);
  }
  close(code?: number, reason?: string) {
    this.ws.close(code, reason);
  }

  addEventListener(type: string, cb: Listener) {
    console.info("Adding listener to type: ", type);
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(cb);
  }
  removeEventListener(type: string, cb: Listener) {
    console.info("Removing listener to type: ", type);
    this.listeners.get(type)?.delete(cb);
  }

  // helper for Bun hooks to notify capnweb
  dispatch(type: string, ev: any) {
    console.info("Dispatching type: ", type);
    this.listeners.get(type)?.forEach((cb) => cb(ev));
  }
}
