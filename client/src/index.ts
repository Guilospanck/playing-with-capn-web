import type { AuthenticatedAPI, PublicAPI } from "@api/protocols/rpc";

import { newWebSocketRpcSession, RpcStub } from "capnweb";

console.info("Starting WS RPC connection...");
using publicAPI: RpcStub<PublicAPI> = newWebSocketRpcSession<PublicAPI>(
  "ws://localhost:3000/rpc",
);

const todaysDatePromise = publicAPI.getTodaysDate();

using authenticatedAPI: RpcStub<AuthenticatedAPI> = publicAPI.createNewUser(
  "Guilherme",
  "guilherme@email.com",
);
authenticatedAPI.onRpcBroken((_error: any) => {
  // console.error("Authentication unsuccessful: ", error);
});

const myInfoPromise = authenticatedAPI.getMyInfo((potato: unknown) => {
  console.info("Bidirectional: ", potato);
});

const [todaysDate, myInfo] = await Promise.all([
  todaysDatePromise,
  myInfoPromise,
]);

console.info({
  todaysDate,
  myInfo,
});

myInfo[Symbol.dispose]();
