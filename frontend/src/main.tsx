
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { hideEntryLoading } from "./utils/loadingManager.ts";
  import "./styles/index.css";
  import "./styles/animations.css";

  // Hide entry loading screen once React app is ready
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);

  // Hide the loading screen after a brief delay to show animations
  hideEntryLoading(200).catch(() => {
    // Silently handle if already hidden
  });

  // (Debug banner removed) client bootstrap and error listeners intentionally omitted.
  