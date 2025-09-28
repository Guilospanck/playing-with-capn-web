import type { ElysiaWS } from "elysia/ws";

type Listener = (ev: unknown) => void;

// Minimal “WebSocket-like” interface capnweb can work with
export class WsAdapter {
  private listeners = new Map<string, Set<Listener>>();
  constructor(private ws: ElysiaWS) {}

  addEventListener(type: string, cb: Listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(cb);
  }
  close(code?: number, reason?: string) {
    this.ws.close(code, reason);
  }

  // helper for Bun hooks to notify capnweb
  dispatch(type: string, ev: unknown) {
    this.listeners.get(type)?.forEach((cb) => cb(ev));
  }
  removeEventListener(type: string, cb: Listener) {
    this.listeners.get(type)?.delete(cb);
  }

  send(data: string | ArrayBuffer | Uint8Array) {
    this.ws.send(data);
  }
}
