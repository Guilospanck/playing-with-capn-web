// These always exist because they are hardcoded in the HTML
const status = document.getElementById("status")!;
const buttons = document.getElementById("buttons")!;
const notifications = document.getElementById("notifications")!;

const TOAST_TIMEOUT = 3000;

type ButtonListener<K extends keyof HTMLElementEventMap> = {
  type: K;
  listener: (
    this: HTMLButtonElement,
    ev: HTMLElementEventMap[K],
  ) => void | Promise<void>;
};

const buttonBuilder = ({
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

const updateStatus = ({
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

const hideNotification = () => {
  notifications.style.opacity = "0%";
  notifications.innerText = "";
};

const showNotification = ({
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
    hideNotification();
  }, TOAST_TIMEOUT);
};

export { showNotification, updateStatus, buttonBuilder, hideNotification };
