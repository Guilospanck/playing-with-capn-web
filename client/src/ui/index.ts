import {
  authenticateAndGetMyInfo,
  closeConnection,
  connectWS,
  getMyInfo,
  getOrCreateUser,
  getTodaysDate,
  loginUser,
} from "@/rpc";
import {
  buttonBuilder,
  disableAndHideButtonBasedOnId,
  enableAndDisplayButtonBasedOnId,
  hideNotification,
  showNotification,
  updateStatus,
} from "@/ui/utils";

// These always exist because they are hardcoded in the HTML
const content = document.getElementById("content")!;
const serverMessages = document.getElementById("serverMessages")!;

// Create new user
const newUserContainer = document.getElementById("newUser")!;
const nameInput = document.getElementById("name")! as HTMLInputElement;
const emailInput = document.getElementById("email")! as HTMLInputElement;
const submitCreateNewUserBtn = document.getElementById(
  "submitCreateUserBtn",
)! as HTMLButtonElement;

// Login
const loginContainer = document.getElementById("login")!;
const emailLoginInput = document.getElementById(
  "emailLogin",
)! as HTMLInputElement;
const submitLoginBtn = document.getElementById(
  "submitLoginBtn",
)! as HTMLButtonElement;

const onConnectSuccess = () => {
  const connectBtn = document.getElementById("connect")! as HTMLButtonElement;
  connectBtn.disabled = true;
  connectBtn.style.display = "none";

  const buttonIdsToBeDisplayed = [
    "disconnect",
    "todaysDate",
    "authenticateAndGetMyInfo",
  ];
  enableAndDisplayButtonBasedOnId(buttonIdsToBeDisplayed);

  updateStatus({
    borderColor: "blue",
    color: "blue",
    title: "Connected!",
  });

  newUserContainer.style.display = "flex";
  loginContainer.style.display = "flex";
};

const onLoginSuccess = () => {
  const buttonIdsToBeDisplayed = ["myInfo"];
  enableAndDisplayButtonBasedOnId(buttonIdsToBeDisplayed);

  updateStatus({
    borderColor: "green",
    color: "green",
    title: "Connected and authenticated!",
  });

  loginContainer.style.display = "none";
};

const onDisconnectSuccess = () => {
  const disconnectBtn = document.getElementById(
    "disconnect",
  )! as HTMLButtonElement;
  disconnectBtn.disabled = true;
  disconnectBtn.style.display = "none";

  const buttonIdsToBeDisplayed = ["connect"];
  enableAndDisplayButtonBasedOnId(buttonIdsToBeDisplayed);

  const buttonIdsToBeHidden = [
    "disconnect",
    "todaysDate",
    "authenticateAndGetMyInfo",
    "myInfo",
    "submitCreateUserBtn",
  ];
  disableAndHideButtonBasedOnId(buttonIdsToBeHidden);

  updateStatus({
    borderColor: "red",
    color: "red",
    title: "Disconnected.",
  });

  newUserContainer.style.display = "none";
  loginContainer.style.display = "none";
};

const createNewButtons = () => {
  // Connection button
  buttonBuilder({
    eventListener: {
      listener: () => {
        connectWS();
        onConnectSuccess();
      },
      type: "click",
    },
    id: "connect",
    title: "Connect",
  });

  // Disconnect button
  buttonBuilder({
    eventListener: {
      listener: () => {
        closeConnection();
        onDisconnectSuccess();
      },
      type: "click",
    },
    id: "disconnect",
    title: "Disconnect",
    style: { display: "none" },
  });

  // Get today's date button
  buttonBuilder({
    eventListener: {
      listener: async () => {
        try {
          const date = await getTodaysDate();
          content.innerText = date;
        } catch (err) {
          showNotification({ title: err as unknown as string });
        }
      },
      type: "click",
    },
    id: "todaysDate",
    title: "Today's Date",
    style: { display: "none" },
  });

  // Get my info button
  buttonBuilder({
    eventListener: {
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
      type: "click",
    },
    id: "myInfo",
    title: "My info",
    style: { display: "none" },
  });

  buttonBuilder({
    eventListener: {
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
      type: "click",
    },
    id: "authenticateAndGetMyInfo",
    title: "Authenticate & get my info",
    style: { display: "none" },
  });
};

// Buttons already in the HTML
const addListenerToExistingButtons = () => {
  // Submit create new user button
  submitCreateNewUserBtn.addEventListener(
    "click",
    async function (this: HTMLButtonElement) {
      try {
        const name = nameInput.value;
        const email = emailInput.value;
        if (name.length === 0 || email.length === 0) {
          showNotification({
            borderColor: "red",
            color: "red",
            title: "Please input email and email",
          });
          return;
        }

        await getOrCreateUser(name, email);
        this.disabled = true;
        showNotification({
          borderColor: "blue",
          color: "blue",
          title: "User created!",
        });
      } catch (err) {
        showNotification({ title: err as unknown as string });
      }
    },
  );

  // Submit login user button
  submitLoginBtn.addEventListener(
    "click",
    async function (this: HTMLButtonElement) {
      try {
        const email = emailLoginInput.value;
        await loginUser(email);

        onLoginSuccess();

        this.disabled = true;
        updateStatus({
          borderColor: "green",
          color: "green",
          title: "Connected and authenticated!",
        });
      } catch (err) {
        showNotification({ title: err as unknown as string });
      }
    },
  );
};

const buildButtons = () => {
  createNewButtons();
  addListenerToExistingButtons();
};

const setInitialConditions = () => {
  hideNotification();
  updateStatus({
    borderColor: "red",
    color: "red",
    title: "Disconnected.",
  });

  serverMessages.style.opacity = "0%";
  const disconnectButton = document.getElementById("disconnect");
  if (disconnectButton) {
    (disconnectButton as HTMLButtonElement).disabled = true;
  }

  newUserContainer.style.display = "none";
  loginContainer.style.display = "none";
};

const buildUI = () => {
  buildButtons();
  setInitialConditions();
};
export { buildUI };
