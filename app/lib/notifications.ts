export function requestNotificationPermission() {
  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function sendBrowserNotification(title: string, body: string) {
  if (
    typeof Notification !== "undefined" &&
    Notification.permission === "granted" &&
    document.hidden
  ) {
    new Notification(title, { body, icon: "/favicon.svg" });
  }
}
