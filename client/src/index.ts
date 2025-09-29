import type { AuthenticatedAPI, PublicAPI, UserInfo } from "@api/protocols/rpc";

import { newWebSocketRpcSession, RpcStub } from "capnweb";

let publicAPI: RpcStub<PublicAPI> | undefined = undefined;
let authenticatedAPI: RpcStub<AuthenticatedAPI> | undefined = undefined;

const TOAST_TIMEOUT = 3000;

const content = document.getElementById("content")!;
const status = document.getElementById("status")!;
const buttons = document.getElementById("buttons")!;
const errors = document.getElementById("errors")!;
const serverMessages = document.getElementById("serverMessages")!;

const _showError = (err: string) => {
  errors.innerText = err;
  errors.style.opacity = "100%";

  setTimeout(() => {
    errors.innerText = "";
    errors.style.opacity = "0%";
  }, TOAST_TIMEOUT);
};

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

const getMyInfo = async (): Promise<UserInfo> => {
  if (!publicAPI) throw new Error("No connection to WS.");
  if (!authenticatedAPI) throw new Error("You're not authenticated!");

  using myInfo = await authenticatedAPI?.getMyInfo((serverMsg: unknown) => {
    const li = document.createElement("li");
    li.innerText = JSON.stringify(serverMsg);
    serverMessages.firstElementChild?.appendChild(li);
    serverMessages.style.opacity = "100%";
  });

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

const buildButtons = () => {
  errors.style.opacity = "0%";
  errors.innerText = "";

  status.innerText = "Disconnected.";
  status.style.color = "red";
  status.style.borderColor = "red";

  serverMessages.style.opacity = "0%";

  const connectionButton = document.createElement("button");
  connectionButton.innerText = "Connect";
  connectionButton.id = "connect";
  connectionButton.addEventListener("click", async () => {
    await connectWS();
    disconnectButton.disabled = false;
    connectionButton.disabled = true;
    status.innerText = "Connected!";
    status.style.color = "blue";
    status.style.borderColor = "blue";
  });
  buttons.appendChild(connectionButton);

  const disconnectButton = document.createElement("button");
  disconnectButton.innerText = "Disconnect";
  disconnectButton.id = "disconnect";
  disconnectButton.disabled = true;
  disconnectButton.addEventListener("click", async () => {
    closeConnection();
    connectionButton.disabled = false;
    authenticateButton.disabled = false;
    disconnectButton.disabled = true;
    status.innerText = "Disconnected.";
    status.style.color = "red";
    status.style.borderColor = "red";
  });
  buttons.appendChild(disconnectButton);

  const authenticateButton = document.createElement("button");
  authenticateButton.id = "authenticate";
  authenticateButton.innerText = "Authenticate";
  authenticateButton.addEventListener("click", async () => {
    try {
      await authenticate();
      authenticateButton.disabled = true;
      status.innerText = "Connected and authenticated!";
      status.style.color = "green";
      status.style.borderColor = "green";
    } catch (err) {
      _showError(err as unknown as string);
    }
  });
  buttons.appendChild(authenticateButton);

  const getTodaysDateButton = document.createElement("button");
  getTodaysDateButton.innerText = "Today's Date";
  getTodaysDateButton.addEventListener("click", async () => {
    try {
      const date = await getTodaysDate();
      content.innerText = date;
    } catch (err) {
      _showError(err as unknown as string);
    }
  });
  buttons.appendChild(getTodaysDateButton);

  const getMyInfoButton = document.createElement("button");
  getMyInfoButton.innerText = "My info";
  getMyInfoButton.addEventListener("click", async () => {
    try {
      const myInfo = await getMyInfo();
      content.innerText = JSON.stringify(myInfo);
    } catch (err) {
      _showError(err as unknown as string);
    }
  });
  buttons.appendChild(getMyInfoButton);
};

const main = () => {
  buildButtons();
};

main();
