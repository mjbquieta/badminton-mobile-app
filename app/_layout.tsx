import { ToastProvider } from "@/components/Toast";
import { store } from "@/store";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import "./globals.css";

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
