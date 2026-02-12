import { ToastProvider } from "@/components/Toast";
import { configureAppStore } from "@badminton/store";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import "./globals.css";

const store = configureAppStore();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ToastProvider>
    </Provider>
  );
}
