import type { AuthenticatedAPI, PublicAPI } from "@api/index";

import { newWebSocketRpcSession, RpcStub } from "capnweb";

console.info("Starting WS RPC connection...");
using publicAPI: RpcStub<PublicAPI> = newWebSocketRpcSession<PublicAPI>(
  "ws://localhost:3000/rpc",
);

console.info("Calling getTodaysDate...");
const todaysDate = await publicAPI.getTodaysDate();
console.info("Got todaysDate:", todaysDate);

console.info("Calling authenticate...");
using authenticatedAPI: RpcStub<AuthenticatedAPI> =
  publicAPI.authenticate("Tolkien");

console.info("Calling getMyInfo...");
const myInfo = await authenticatedAPI.getMyInfo();
console.info("Got myInfo:", myInfo);
