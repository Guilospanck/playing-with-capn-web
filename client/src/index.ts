import { RpcStub, newWebSocketRpcSession } from "capnweb";

import type { PublicAPI, AuthenticatedAPI } from "../../server/src";

console.info("Starting WS RPC connection...");
using publicAPI: RpcStub<PublicAPI> = newWebSocketRpcSession<PublicAPI>(
  "ws://localhost:3000/rpc",
);

console.log("Calling getTodaysDate...");
let todaysDate = await publicAPI.getTodaysDate();
console.log("Got todaysDate:", todaysDate);

console.log("Calling authenticate...");
using authenticatedAPI: RpcStub<AuthenticatedAPI> =
  publicAPI.authenticate("Tolkien");

console.log("Calling getMyInfo...");
let myInfo = await authenticatedAPI.getMyInfo();
console.log("Got myInfo:", myInfo);
