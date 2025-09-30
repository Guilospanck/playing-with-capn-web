import {
  authenticate,
  authenticateAndGetMyInfo,
  closeConnection,
  connectWS,
  getMyInfo,
  getOrCreateUser,
  getTodaysDate,
} from "@/rpc";

const TOAST_TIMEOUT = 3000;

// These always exist because they are hardcoded in the HTML
const content = document.getElementById("content")!;
const status = document.getElementById("status")!;
const buttons = document.getElementById("buttons")!;
const notifications = document.getElementById("notifications")!;
const serverMessages = document.getElementById("serverMessages")!;

const buildButtons = () => {
  // Connection button
  const connectionButton = _buildButton({
    title: "Connect",
    id: "connect",
    eventListener: {
      type: "click",
      listener: async function (this: HTMLButtonElement) {
        await connectWS();

        this.disabled = true;
        disconnectButton.disabled = false;
        _updateStatus({
          title: "Connected!",
          color: "blue",
          borderColor: "blue",
        });
      },
    },
  });

  // Disconnect button
  const disconnectButton = _buildButton({
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
        _updateStatus({
          title: "Disconnected.",
          color: "red",
          borderColor: "red",
        });
      },
    },
  });

  // Authenticate button
  const authenticateButton = _buildButton({
    title: "Authenticate",
    id: "authenticate",
    eventListener: {
      type: "click",
      listener: async function (this: HTMLButtonElement) {
        try {
          await authenticate();

          this.disabled = true;
          _updateStatus({
            title: "Connected and authenticated!",
            color: "green",
            borderColor: "green",
          });
        } catch (err) {
          _showNotification({ title: err as unknown as string });
        }
      },
    },
  });

  // Get or create user button
  const getOrCreateUserButton = _buildButton({
    title: "Create user",
    id: "createUser",
    eventListener: {
      type: "click",
      listener: async function (this: HTMLButtonElement) {
        try {
          await getOrCreateUser();
          this.disabled = true;
          _showNotification({
            title: "User created!",
            color: "blue",
            borderColor: "blue",
          });
        } catch (err) {
          _showNotification({ title: err as unknown as string });
        }
      },
    },
  });

  // Get today's date button
  _buildButton({
    title: "Today's Date",
    id: "todaysDate",
    eventListener: {
      type: "click",
      listener: async function (this: HTMLButtonElement) {
        try {
          const date = await getTodaysDate();
          content.innerText = date;
        } catch (err) {
          _showNotification({ title: err as unknown as string });
        }
      },
    },
  });

  // Get my info button
  _buildButton({
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
          _showNotification({ title: err as unknown as string });
        }
      },
    },
  });

  _buildButton({
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
          _showNotification({ title: err as unknown as string });
        }
      },
    },
  });
};

const buildUI = () => {
  buildButtons();
  _setInitialConditions();
};

type ButtonListener<K extends keyof HTMLElementEventMap> = {
  type: K;
  listener: (
    this: HTMLButtonElement,
    ev: HTMLElementEventMap[K],
  ) => void | Promise<void>;
};

const _buildButton = ({
  title,
  id,
  eventListener,
}: {
  title: string;
  id: string;
  eventListener?: ButtonListener<keyof HTMLElementEventMap>;
}): HTMLButtonElement => {
  const button = document.createElement("button");
  button.innerText = title;
  button.id = id;
  if (eventListener) {
    button.addEventListener(eventListener.type, eventListener.listener);
  }
  buttons.appendChild(button);

  return button;
};

const _updateStatus = ({
  title,
  color,
  borderColor,
}: {
  title: string;
  color?: string;
  borderColor?: string;
}) => {
  status.innerText = title;
  if (color !== undefined) {
    status.style.color = color;
  }
  if (borderColor !== undefined) {
    status.style.borderColor = borderColor;
  }
};

const _setInitialConditions = () => {
  _hideNotification();
  _updateStatus({
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

const _hideNotification = () => {
  notifications.style.opacity = "0%";
  notifications.innerText = "";
};

const _showNotification = ({
  title,
  color = "red",
  borderColor = "red",
}: {
  title: string;
  color?: string;
  borderColor?: string;
}) => {
  notifications.innerText = title;
  notifications.style.opacity = "100%";

  if (color !== undefined) {
    notifications.style.color = color;
  }
  if (borderColor !== undefined) {
    notifications.style.borderColor = borderColor;
  }

  setTimeout(() => {
    _hideNotification();
  }, TOAST_TIMEOUT);
};

export { buildUI };
