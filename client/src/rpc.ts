import type { AuthenticatedAPI, PublicAPI, UserInfo } from "@api/protocols/rpc";

import { newWebSocketRpcSession, RpcStub } from "capnweb";

let publicAPI: RpcStub<PublicAPI> | undefined = undefined;
let authenticatedAPI: RpcStub<AuthenticatedAPI> | undefined = undefined;

const connectWS = async () => {
  publicAPI = newWebSocketRpcSession<PublicAPI>("ws://localhost:4444/rpc");
};

const getTodaysDate = async (): Promise<string> => {
  if (!publicAPI) throw new Error("No connection to WS.");

  return await publicAPI.getTodaysDate();
};

const authenticate = async (): Promise<void> => {
  if (!publicAPI) throw new Error("No connection to WS.");

  authenticatedAPI = publicAPI?.createNewUser(
    "Guilherme",
    "guilherme@email.com",
  );
  authenticatedAPI?.onRpcBroken((error: any) => {
    console.error("Authentication unsuccessful: ", error);
  });
};

const getMyInfo = async (
  cb: (serverMsg: unknown) => void,
): Promise<UserInfo> => {
  if (!publicAPI) throw new Error("No connection to WS.");
  if (!authenticatedAPI) throw new Error("You're not authenticated!");

  using myInfo = await authenticatedAPI?.getMyInfo(cb);

  return myInfo;
};

const closeConnection = () => {
  if (authenticatedAPI) {
    authenticatedAPI[Symbol.dispose]?.();
  }
  // Disposing the main stub closes the connection
  publicAPI![Symbol.dispose]?.();

  authenticatedAPI = undefined;
  publicAPI = undefined;
};

export { connectWS, authenticate, getMyInfo, getTodaysDate, closeConnection };
