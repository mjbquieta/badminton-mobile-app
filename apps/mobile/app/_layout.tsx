import { ToastProvider } from "@/components/Toast";
import { useFirebaseSync } from "@/hooks/useFirebaseSync";
import { configureAppStore } from "@badminton/store";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import "./globals.css";

const store = configureAppStore();

function FirebaseSyncProvider({ children }: { children: React.ReactNode }) {
  useFirebaseSync(store);
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <FirebaseSyncProvider>
        <ToastProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ToastProvider>
      </FirebaseSyncProvider>
    </Provider>
  );
}
