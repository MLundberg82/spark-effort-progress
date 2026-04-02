import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Purchases, LOG_LEVEL } from "@revenuecat/purchases-capacitor";
import { Capacitor } from "@capacitor/core";

const savedTheme = localStorage.getItem("gymrat-theme");
if (savedTheme === "light") {
  document.documentElement.classList.add("light");
}

const isNativePlatform = () => {
  const platform = Capacitor.getPlatform();
  return platform === "ios" || platform === "android";
};

async function initRevenueCat() {
  if (!isNativePlatform()) {
    console.log("RevenueCat skipped on web");
    return;
  }

  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({
      apiKey: "test_UtykRjcsdCxStqQwiOvnRqsARKF",
    });
  } catch (error) {
    console.error("RevenueCat init failed:", error);
  }
}

initRevenueCat().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});