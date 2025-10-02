import type { AuthenticatedAPI, PublicAPI, UserInfo } from "@api/protocols/rpc";

import { newWebSocketRpcSession, RpcStub } from "capnweb";

const NO_CONNECTION = "No connection to WS";

let publicAPI: RpcStub<PublicAPI> | undefined = undefined;
let authenticatedAPI: RpcStub<AuthenticatedAPI> | undefined = undefined;

const connectWS = async () => {
  publicAPI = newWebSocketRpcSession<PublicAPI>("ws://localhost:4444/rpc");
};

const getTodaysDate = async (): Promise<string> => {
  if (!publicAPI) throw new Error(NO_CONNECTION);

  return await publicAPI.getTodaysDate();
};

const authenticate = async (): Promise<void> => {
  if (!publicAPI) throw new Error(NO_CONNECTION);

  const token = localStorage.getItem("token") ?? "";

  // TODO: check why this is happening
  // @ts-expect-error Not sure why TS is saying: "Type instantiation is excessively deep and possibly infinite."
  authenticatedAPI = await publicAPI.authenticate(token);

  authenticatedAPI?.onRpcBroken((error: unknown) => {
    console.error("Authentication unsuccessful: ", error);
  });
};

const getOrCreateUser = async (
  name: string,
  email: string,
): Promise<UserInfo> => {
  if (!publicAPI) throw new Error(NO_CONNECTION);

  const user: RpcStub<UserInfo> = await publicAPI.getOrCreateUser(name, email);
  localStorage.setItem("token", user.token);

  return user;
};

const getMyInfo = async (
  cb: (serverMsg: unknown) => void,
): Promise<UserInfo> => {
  if (!publicAPI) throw new Error(NO_CONNECTION);
  if (!authenticatedAPI)
    throw new Error(
      `You're not authenticated. Please first create a user, if you haven't, and then click "Authenticate".`,
    );

  using myInfo = await authenticatedAPI?.getMyInfo(cb);

  return myInfo;
};

// Example of the "promise pipelining":
// we can `authenticate` and call the `getMyInfo`
// in just one call to the server.
//
// From the docs;
//
// "When you start an RPC, you get back a promise. Instead of awaiting it,
// you can immediately use the promise in dependent RPCs,
// thus performing a chain of calls in a single network round trip."
//
const authenticateAndGetMyInfo = async (
  cb: (serverMsg: unknown) => void,
): Promise<UserInfo> => {
  if (!publicAPI) throw new Error(NO_CONNECTION);

  const token = localStorage.getItem("token") ?? "";

  // Do not await
  using auth: RpcStub<AuthenticatedAPI> = publicAPI.authenticate(token);

  // Only here to actually get the info, but still we can use the methods (`getMyInfo`)
  // from a non-awaited promise (`auth`)
  using myInfo = await auth.getMyInfo(cb);

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

export {
  authenticate,
  authenticateAndGetMyInfo,
  closeConnection,
  connectWS,
  getMyInfo,
  getOrCreateUser,
  getTodaysDate,
};
