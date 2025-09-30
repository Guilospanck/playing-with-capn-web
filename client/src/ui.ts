import {
  authenticate,
  closeConnection,
  connectWS,
  getMyInfo,
  getTodaysDate,
} from "@/rpc";

const TOAST_TIMEOUT = 3000;

// These always exist because they are hardcoded in the HTML
const content = document.getElementById("content")!;
const status = document.getElementById("status")!;
const buttons = document.getElementById("buttons")!;
const errors = document.getElementById("errors")!;
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
          _showError(err as unknown as string);
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
          _showError(err as unknown as string);
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
          const myInfo = await getMyInfo(callback);
          content.innerText = JSON.stringify(myInfo);
        } catch (err) {
          _showError(err as unknown as string);
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
  status.innerText = title ?? status.innerHTML;
  status.style.color = color ?? status.style.color;
  status.style.borderColor = borderColor ?? status.style.borderColor;
};

const _setInitialConditions = () => {
  _hideError();
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

const _hideError = () => {
  errors.style.opacity = "0%";
  errors.innerText = "";
};

const _showError = (err: string) => {
  errors.innerText = err;
  errors.style.opacity = "100%";

  setTimeout(() => {
    _hideError();
  }, TOAST_TIMEOUT);
};

export { buildUI };
