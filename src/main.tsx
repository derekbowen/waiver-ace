import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/register-sw";

registerServiceWorker();

// The "ResizeObserver loop completed with undelivered notifications" error is a
// known-benign browser notification (fired when an observer callback triggers a
// layout change in the same frame). It is harmless but gets picked up as an
// uncaught error and blanks the app, so swallow it before it reaches React.
const isResizeObserverLoopError = (message: unknown) =>
  typeof message === "string" &&
  (message.includes("ResizeObserver loop completed with undelivered notifications") ||
    message.includes("ResizeObserver loop limit exceeded"));

window.addEventListener("error", (event) => {
  if (isResizeObserverLoopError(event.message)) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});
window.addEventListener("unhandledrejection", (event) => {
  if (isResizeObserverLoopError(event.reason?.message ?? event.reason)) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
