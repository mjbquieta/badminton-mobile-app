import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme as useNativeColorScheme } from "react-native";

export type ThemeMode = "dark" | "light" | "system";

interface ThemeContextType {
	themeMode: ThemeMode;
	isDark: boolean;
	setThemeMode: (mode: ThemeMode) => void;
}

const STORAGE_KEY = "@theme_mode";

const ThemeContext = createContext<ThemeContextType>({
	themeMode: "dark",
	isDark: true,
	setThemeMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const systemColorScheme = useNativeColorScheme();
	const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");

	useEffect(() => {
		AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
			if (stored === "light" || stored === "dark" || stored === "system") {
				setThemeModeState(stored);
			}
		});
	}, []);

	const setThemeMode = useCallback((mode: ThemeMode) => {
		setThemeModeState(mode);
		AsyncStorage.setItem(STORAGE_KEY, mode);
	}, []);

	const isDark =
		themeMode === "dark" ||
		(themeMode === "system" && systemColorScheme !== "light");

	return (
		<ThemeContext.Provider value={{ themeMode, isDark, setThemeMode }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	return useContext(ThemeContext);
}
