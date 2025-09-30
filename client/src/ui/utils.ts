// These always exist because they are hardcoded in the HTML
const status = document.getElementById("status")!;
const buttons = document.getElementById("buttons")!;
const notifications = document.getElementById("notifications")!;

const TOAST_TIMEOUT = 3000;

type ButtonListener<K extends keyof HTMLElementEventMap> = {
  listener: (
    this: HTMLButtonElement,
    ev: HTMLElementEventMap[K],
  ) => Promise<void> | void;
  type: K;
};

const buttonBuilder = ({
  eventListener,
  id,
  title,
}: {
  eventListener?: ButtonListener<keyof HTMLElementEventMap>;
  id: string;
  title: string;
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
  borderColor,
  color,
  title,
}: {
  borderColor?: string;
  color?: string;
  title: string;
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
  borderColor = "red",
  color = "red",
  title,
}: {
  borderColor?: string;
  color?: string;
  title: string;
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

export { buttonBuilder, hideNotification, showNotification, updateStatus };
