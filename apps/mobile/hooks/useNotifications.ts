import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

export function useNotifications() {
	const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
	const [permission, setPermission] = useState<boolean>(false);

	useEffect(() => {
		registerForPushNotifications().then((token) => {
			if (token) {
				setExpoPushToken(token);
				setPermission(true);
			}
		});

		const receivedSub = Notifications.addNotificationReceivedListener(
			(_notification) => {
				// Handle notification received while app is foregrounded
			},
		);

		const responseSub =
			Notifications.addNotificationResponseReceivedListener(
				(_response) => {
					// Handle notification tap
				},
			);

		return () => {
			receivedSub.remove();
			responseSub.remove();
		};
	}, []);

	return { expoPushToken, permission };
}

async function registerForPushNotifications(): Promise<string | null> {
	if (!Device.isDevice) {
		return null;
	}

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX,
		});
	}

	const { status: existingStatus } =
		await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== "granted") {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== "granted") {
		return null;
	}

	try {
		const tokenData = await Notifications.getExpoPushTokenAsync({
			projectId: "your-project-id",
		});
		return tokenData.data;
	} catch {
		return null;
	}
}

export async function scheduleLocalNotification(
	title: string,
	body: string,
	delaySeconds = 1,
) {
	await Notifications.scheduleNotificationAsync({
		content: { title, body },
		trigger: {
			seconds: delaySeconds,
			type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
		},
	});
}
