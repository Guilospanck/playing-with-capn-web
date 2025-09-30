import {
  authenticate,
  authenticateAndGetMyInfo,
  closeConnection,
  connectWS,
  getMyInfo,
  getOrCreateUser,
  getTodaysDate,
} from "@/rpc";
import {
  buttonBuilder,
  hideNotification,
  showNotification,
  updateStatus,
} from "@/ui/utils";

// These always exist because they are hardcoded in the HTML
const content = document.getElementById("content")!;
const serverMessages = document.getElementById("serverMessages")!;

const buildButtons = () => {
  // Connection button
  const connectionButton = buttonBuilder({
    title: "Connect",
    id: "connect",
    eventListener: {
      type: "click",
      listener: async function (this: HTMLButtonElement) {
        await connectWS();

        this.disabled = true;
        disconnectButton.disabled = false;
        updateStatus({
          title: "Connected!",
          color: "blue",
          borderColor: "blue",
        });
      },
    },
  });

  // Disconnect button
  const disconnectButton = buttonBuilder({
    title: "Disconnect",
    id: "disconnect",
    eventListener: {
      type: "click",
      listener: async function (this: HTMLButtonElement) {
        closeConnection();

        this.disabled = true;
        connectionButton.disabled = false;
        authenticateButton.disabled = false;
        getOrCreateUserButton.disabled = false;
        updateStatus({
          title: "Disconnected.",
          color: "red",
          borderColor: "red",
        });
      },
    },
  });

  // Authenticate button
  const authenticateButton = buttonBuilder({
    title: "Authenticate",
    id: "authenticate",
    eventListener: {
      type: "click",
      listener: async function (this: HTMLButtonElement) {
        try {
          await authenticate();

          this.disabled = true;
          updateStatus({
            title: "Connected and authenticated!",
            color: "green",
            borderColor: "green",
          });
        } catch (err) {
          showNotification({ title: err as unknown as string });
        }
      },
    },
  });

  // Get or create user button
  const getOrCreateUserButton = buttonBuilder({
    title: "Create user",
    id: "createUser",
    eventListener: {
      type: "click",
      listener: async function (this: HTMLButtonElement) {
        try {
          await getOrCreateUser();
          this.disabled = true;
          showNotification({
            title: "User created!",
            color: "blue",
            borderColor: "blue",
          });
        } catch (err) {
          showNotification({ title: err as unknown as string });
        }
      },
    },
  });

  // Get today's date button
  buttonBuilder({
    title: "Today's Date",
    id: "todaysDate",
    eventListener: {
      type: "click",
      listener: async function (this: HTMLButtonElement) {
        try {
          const date = await getTodaysDate();
          content.innerText = date;
        } catch (err) {
          showNotification({ title: err as unknown as string });
        }
      },
    },
  });

  // Get my info button
  buttonBuilder({
    title: "My info",
    id: "myInfo",
    eventListener: {
      type: "click",
      listener: async function (this: HTMLButtonElement) {
        const callback = (serverMsg: unknown) => {
          const li = document.createElement("li");
          li.innerText = JSON.stringify(serverMsg);
          serverMessages.firstElementChild?.appendChild(li);
          serverMessages.style.opacity = "100%";
        };

        try {
          // Bidirectional calling.
          //
          // From the docs:
          //
          // 'Supports passing functions by reference: If you pass a function over RPC,
          // the recipient receives a "stub". When they call the stub,
          // they actually make an RPC back to you, invoking the function where it was created.
          // This is how bidirectional calling happens:
          // the client passes a callback to the server,
          // and then the server can call it later.'
          //
          const myInfo = await getMyInfo(callback);
          content.innerText = JSON.stringify(myInfo);
        } catch (err) {
          showNotification({ title: err as unknown as string });
        }
      },
    },
  });

  buttonBuilder({
    title: "Authenticate & get my info",
    id: "authenticateAndGetMyInfo",
    eventListener: {
      type: "click",
      listener: async function (this: HTMLButtonElement) {
        const callback = (serverMsg: unknown) => {
          const li = document.createElement("li");
          li.innerText = `PromisePipelining: ${JSON.stringify(serverMsg)}`;
          serverMessages.firstElementChild?.appendChild(li);
          serverMessages.style.opacity = "100%";
        };

        try {
          const myInfo = await authenticateAndGetMyInfo(callback);
          content.innerText = JSON.stringify(myInfo);
        } catch (err) {
          showNotification({ title: err as unknown as string });
        }
      },
    },
  });
};

const setInitialConditions = () => {
  hideNotification();
  updateStatus({
    title: "Disconnected.",
    color: "red",
    borderColor: "red",
  });

  serverMessages.style.opacity = "0%";
  const disconnectButton = document.getElementById("disconnect");
  if (disconnectButton) {
    (disconnectButton as HTMLButtonElement).disabled = true;
  }
};

const buildUI = () => {
  buildButtons();
  setInitialConditions();
};
export { buildUI };
