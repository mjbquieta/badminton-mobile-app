import { store } from "@/store";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import "./globals.css";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* <Stack.Screen name="movies/[id]" options={{ headerShown: false }} /> */}
      </Stack>
    </Provider>
  );
}
