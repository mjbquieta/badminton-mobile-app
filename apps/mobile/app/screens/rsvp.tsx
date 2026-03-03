import ConfirmationAlert from "@/components/ConfirmationAlert";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { BadmintonPalette } from "@/constants/palette";
import QRCode from "react-native-qrcode-svg";
import {
	enableConfirmation,
	disableConfirmation,
	setEventDetails,
	setPlayerConfirmations,
	useAppDispatch,
	useAppSelector,
} from "@badminton/store";
import {
	createConfirmationDoc,
	updateConfirmationEventDetails,
	updateConfirmationPlayers,
	deleteConfirmationDoc,
	subscribeToConfirmation,
} from "@badminton/firebase";
import type { EventDetails, PlayerConfirmation } from "@badminton/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	Clipboard,
	ScrollView,
	Share,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { v4 as uuidv4 } from "uuid";

function generatePin(): string {
	return String(Math.floor(1000 + Math.random() * 9000));
}

export const RSVPContent = ({
	contentContainerClassName,
}: { contentContainerClassName?: string }) => {
	const dispatch = useAppDispatch();
	const { showToast } = useToast();
	const { user, isAdmin } = useAuth();
	const players = useAppSelector((s) => s.players.items);
	const confirmation = useAppSelector((s) => s.confirmation);
	const { meta, eventDetails, playerConfirmations } = confirmation;

	const [editingEvent, setEditingEvent] = useState(false);
	const [eventForm, setEventForm] = useState<EventDetails>({
		location: "",
		courts: 1,
		date: "",
		startTime: "",
		endTime: "",
		courtCost: 0,
		additionalCosts: [],
	});

	// Subscribe to confirmation changes
	useEffect(() => {
		if (!meta.enabled || !meta.serialId) return;
		const unsub = subscribeToConfirmation(meta.serialId, (data) => {
			if (data?.playerConfirmations) {
				dispatch(setPlayerConfirmations(data.playerConfirmations));
			}
			if (data?.eventDetails) {
				dispatch(setEventDetails(data.eventDetails));
			}
		});
		return unsub;
	}, [meta.enabled, meta.serialId, dispatch]);

	// Sync player list changes to confirmation doc
	useEffect(() => {
		if (!meta.enabled || !meta.serialId) return;
		const confirmations: PlayerConfirmation[] = players.map((p) => {
			const existing = playerConfirmations.find(
				(pc) => pc.playerId === p.id,
			);
			return (
				existing ?? {
					playerId: p.id,
					playerName: p.name,
					playerLevel: p.level,
					status: "pending" as const,
				}
			);
		});
		updateConfirmationPlayers(meta.serialId, confirmations).catch(() => {});
	}, [players, meta.enabled, meta.serialId]);

	const stats = useMemo(() => {
		const confirmed = playerConfirmations.filter(
			(pc) => pc.status === "confirmed",
		).length;
		const declined = playerConfirmations.filter(
			(pc) => pc.status === "declined",
		).length;
		const pending = playerConfirmations.filter(
			(pc) => pc.status === "pending",
		).length;
		const total = playerConfirmations.length;
		return { confirmed, declined, pending, total };
	}, [playerConfirmations]);

	const handleEnable = useCallback(async () => {
		if (!user) return;
		const serialId = uuidv4();
		const pin = generatePin();
		const confirmations: PlayerConfirmation[] = players.map((p) => ({
			playerId: p.id,
			playerName: p.name,
			playerLevel: p.level,
			status: "pending" as const,
		}));
		try {
			await createConfirmationDoc(
				serialId,
				user.uid,
				pin,
				eventDetails ?? {
					location: "",
					courts: 1,
					date: "",
					startTime: "",
					endTime: "",
					courtCost: 0,
					additionalCosts: [],
				},
				confirmations,
			);
			dispatch(enableConfirmation({ serialId, pin }));
			dispatch(setPlayerConfirmations(confirmations));
			showToast({ type: "success", message: "RSVP enabled" });
		} catch {
			showToast({ type: "error", message: "Failed to enable RSVP" });
		}
	}, [user, players, eventDetails, dispatch, showToast]);

	const handleDisable = useCallback(() => {
		ConfirmationAlert({
			title: "Disable RSVP",
			message: "This will disable RSVP and remove the public link.",
			onConfirm: async () => {
				try {
					if (meta.serialId) {
						await deleteConfirmationDoc(meta.serialId);
					}
					dispatch(disableConfirmation());
					showToast({ type: "info", message: "RSVP disabled" });
				} catch {
					showToast({
						type: "error",
						message: "Failed to disable RSVP",
					});
				}
			},
		});
	}, [meta.serialId, dispatch, showToast]);

	const handleShareLink = useCallback(async () => {
		const url = `https://rallyup.app/confirm/${meta.serialId}`;
		try {
			await Share.share({
				message: `RSVP for badminton!\n\nLink: ${url}\nPIN: ${meta.pin}`,
			});
		} catch {
			// User cancelled
		}
	}, [meta.serialId, meta.pin]);

	const handleCopyPin = useCallback(() => {
		Clipboard.setString(meta.pin);
		showToast({ type: "success", message: "PIN copied" });
	}, [meta.pin, showToast]);

	const handleSaveEventDetails = useCallback(async () => {
		dispatch(setEventDetails(eventForm));
		if (meta.enabled && meta.serialId) {
			try {
				await updateConfirmationEventDetails(meta.serialId, eventForm);
			} catch {
				// Non-critical
			}
		}
		setEditingEvent(false);
		showToast({ type: "success", message: "Event details saved" });
	}, [eventForm, meta.enabled, meta.serialId, dispatch, showToast]);

	const totalCost = useMemo(() => {
		if (!eventDetails) return 0;
		return (
			eventDetails.courtCost +
			eventDetails.additionalCosts.reduce((sum, c) => sum + c.cost, 0)
		);
	}, [eventDetails]);

	const perPlayerCost = useMemo(() => {
		if (!stats.confirmed || !totalCost) return 0;
		return totalCost / stats.confirmed;
	}, [totalCost, stats.confirmed]);

	if (!isAdmin) {
		return (
			<View
				className={`flex-1 items-center justify-center ${contentContainerClassName}`}
			>
				<MaterialCommunityIcons
					name="lock-outline"
					size={48}
					color={BadmintonPalette.text.muted}
				/>
				<Text
					className="text-sm mt-3"
					style={{ color: BadmintonPalette.text.muted }}
				>
					Admin access required
				</Text>
			</View>
		);
	}

	// Event Details Editor
	if (editingEvent) {
		return (
			<ScrollView
				className={`flex-1 ${contentContainerClassName}`}
				contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 40 }}
			>
				<Text
					className="text-lg font-bold"
					style={{ color: BadmintonPalette.text.primary }}
				>
					Event Details
				</Text>

				{[
					{ label: "Location", key: "location" as const, placeholder: "e.g. Sports Hall A" },
					{ label: "Date", key: "date" as const, placeholder: "e.g. 2026-03-01" },
					{ label: "Start Time", key: "startTime" as const, placeholder: "e.g. 19:00" },
					{ label: "End Time", key: "endTime" as const, placeholder: "e.g. 21:00" },
				].map(({ label, key, placeholder }) => (
					<View key={key}>
						<Text
							className="text-xs font-bold uppercase mb-1"
							style={{ color: BadmintonPalette.text.muted }}
						>
							{label}
						</Text>
						<TextInput
							className="rounded-xl border border-dark-100 bg-dark-200 px-4 py-3"
							style={{ color: BadmintonPalette.text.primary, fontSize: 14 }}
							value={eventForm[key] as string}
							onChangeText={(v) =>
								setEventForm((f) => ({ ...f, [key]: v }))
							}
							placeholder={placeholder}
							placeholderTextColor={BadmintonPalette.text.muted}
						/>
					</View>
				))}

				<View>
					<Text
						className="text-xs font-bold uppercase mb-1"
						style={{ color: BadmintonPalette.text.muted }}
					>
						Courts
					</Text>
					<TextInput
						className="rounded-xl border border-dark-100 bg-dark-200 px-4 py-3"
						style={{ color: BadmintonPalette.text.primary, fontSize: 14 }}
						value={String(eventForm.courts)}
						onChangeText={(v) =>
							setEventForm((f) => ({
								...f,
								courts: parseInt(v, 10) || 0,
							}))
						}
						keyboardType="number-pad"
						placeholder="1"
						placeholderTextColor={BadmintonPalette.text.muted}
					/>
				</View>

				<View>
					<Text
						className="text-xs font-bold uppercase mb-1"
						style={{ color: BadmintonPalette.text.muted }}
					>
						Court Cost
					</Text>
					<TextInput
						className="rounded-xl border border-dark-100 bg-dark-200 px-4 py-3"
						style={{ color: BadmintonPalette.text.primary, fontSize: 14 }}
						value={String(eventForm.courtCost || "")}
						onChangeText={(v) =>
							setEventForm((f) => ({
								...f,
								courtCost: parseFloat(v) || 0,
							}))
						}
						keyboardType="decimal-pad"
						placeholder="0"
						placeholderTextColor={BadmintonPalette.text.muted}
					/>
				</View>

				<View className="flex-row" style={{ gap: 12 }}>
					<TouchableOpacity
						onPress={() => setEditingEvent(false)}
						className="flex-1 py-3 rounded-xl border border-dark-100 bg-dark-200 items-center"
					>
						<Text
							className="font-bold"
							style={{ color: BadmintonPalette.text.secondary }}
						>
							Cancel
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={handleSaveEventDetails}
						className="flex-1 py-3 rounded-xl items-center"
						style={{
							backgroundColor: BadmintonPalette.accent.primary,
						}}
					>
						<Text
							className="font-bold"
							style={{ color: BadmintonPalette.bg.base }}
						>
							Save
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		);
	}

	return (
		<ScrollView
			className={`flex-1 ${contentContainerClassName}`}
			contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 40 }}
		>
			{/* Toggle RSVP */}
			<View className="rounded-2xl bg-secondary border border-dark-100 overflow-hidden">
				<TouchableOpacity
					onPress={meta.enabled ? handleDisable : handleEnable}
					className="flex-row items-center p-4"
				>
					<View
						className="size-10 rounded-xl items-center justify-center mr-3"
						style={{
							backgroundColor: meta.enabled
								? `${BadmintonPalette.accent.success}20`
								: `${BadmintonPalette.text.muted}20`,
						}}
					>
						<MaterialCommunityIcons
							name={meta.enabled ? "check-circle" : "circle-outline"}
							size={22}
							color={
								meta.enabled
									? BadmintonPalette.accent.success
									: BadmintonPalette.text.muted
							}
						/>
					</View>
					<View className="flex-1">
						<Text
							className="text-base font-bold"
							style={{ color: BadmintonPalette.text.primary }}
						>
							RSVP {meta.enabled ? "Active" : "Disabled"}
						</Text>
						<Text
							className="text-xs"
							style={{ color: BadmintonPalette.text.muted }}
						>
							{meta.enabled
								? "Players can confirm attendance"
								: "Enable to create a public RSVP link"}
						</Text>
					</View>
				</TouchableOpacity>
			</View>

			{meta.enabled && (
				<>
					{/* Share Link & PIN */}
					<View className="rounded-2xl bg-secondary border border-dark-100 p-4" style={{ gap: 12 }}>
						<Text
							className="text-xs font-bold uppercase"
							style={{ color: BadmintonPalette.text.muted }}
						>
							Share
						</Text>

						<View className="flex-row" style={{ gap: 8 }}>
							<TouchableOpacity
								onPress={handleShareLink}
								className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
								style={{
									backgroundColor: BadmintonPalette.accent.primary,
								}}
							>
								<MaterialCommunityIcons
									name="share-variant"
									size={16}
									color={BadmintonPalette.bg.base}
								/>
								<Text
									className="font-bold ml-2"
									style={{ color: BadmintonPalette.bg.base }}
								>
									Share Link
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={handleCopyPin}
								className="flex-row items-center justify-center py-3 px-4 rounded-xl border border-dark-100 bg-dark-200"
							>
								<MaterialCommunityIcons
									name="content-copy"
									size={16}
									color={BadmintonPalette.text.secondary}
								/>
								<Text
									className="font-bold ml-2"
									style={{ color: BadmintonPalette.text.primary }}
								>
									PIN: {meta.pin}
								</Text>
							</TouchableOpacity>
						</View>

						{/* QR Code */}
						<View className="items-center py-3 rounded-xl bg-white">
							<QRCode
								value={`https://rallyup.app/confirm/${meta.serialId}`}
								size={160}
							/>
						</View>
					</View>

					{/* Event Details */}
					<View className="rounded-2xl bg-secondary border border-dark-100 p-4" style={{ gap: 12 }}>
						<View className="flex-row items-center justify-between">
							<Text
								className="text-xs font-bold uppercase"
								style={{ color: BadmintonPalette.text.muted }}
							>
								Event Details
							</Text>
							<TouchableOpacity
								onPress={() => {
									setEventForm(
										eventDetails ?? {
											location: "",
											courts: 1,
											date: "",
											startTime: "",
											endTime: "",
											courtCost: 0,
											additionalCosts: [],
										},
									);
									setEditingEvent(true);
								}}
							>
								<Text
									className="text-xs font-bold"
									style={{ color: BadmintonPalette.accent.info }}
								>
									Edit
								</Text>
							</TouchableOpacity>
						</View>

						{eventDetails ? (
							<View style={{ gap: 6 }}>
								{eventDetails.location && (
									<View className="flex-row items-center" style={{ gap: 6 }}>
										<MaterialCommunityIcons name="map-marker" size={14} color={BadmintonPalette.text.secondary} />
										<Text className="text-sm" style={{ color: BadmintonPalette.text.primary }}>
											{eventDetails.location}
										</Text>
									</View>
								)}
								{eventDetails.date && (
									<View className="flex-row items-center" style={{ gap: 6 }}>
										<MaterialCommunityIcons name="calendar" size={14} color={BadmintonPalette.text.secondary} />
										<Text className="text-sm" style={{ color: BadmintonPalette.text.primary }}>
											{eventDetails.date}
											{eventDetails.startTime ? ` ${eventDetails.startTime}` : ""}
											{eventDetails.endTime ? ` - ${eventDetails.endTime}` : ""}
										</Text>
									</View>
								)}
								{totalCost > 0 && (
									<View className="flex-row items-center" style={{ gap: 6 }}>
										<MaterialCommunityIcons name="cash" size={14} color={BadmintonPalette.text.secondary} />
										<Text className="text-sm" style={{ color: BadmintonPalette.text.primary }}>
											Total: ${totalCost.toFixed(2)}
											{stats.confirmed > 0 ? ` (${perPlayerCost.toFixed(2)}/player)` : ""}
										</Text>
									</View>
								)}
							</View>
						) : (
							<Text className="text-sm" style={{ color: BadmintonPalette.text.muted }}>
								No event details set
							</Text>
						)}
					</View>

					{/* Attendance Stats */}
					<View className="rounded-2xl bg-secondary border border-dark-100 p-4" style={{ gap: 12 }}>
						<Text
							className="text-xs font-bold uppercase"
							style={{ color: BadmintonPalette.text.muted }}
						>
							Attendance ({stats.total} players)
						</Text>

						{/* Progress Bar */}
						{stats.total > 0 && (
							<View className="h-3 rounded-full bg-dark-200 flex-row overflow-hidden">
								{stats.confirmed > 0 && (
									<View
										style={{
											width: `${(stats.confirmed / stats.total) * 100}%`,
											backgroundColor: BadmintonPalette.accent.success,
										}}
									/>
								)}
								{stats.declined > 0 && (
									<View
										style={{
											width: `${(stats.declined / stats.total) * 100}%`,
											backgroundColor: BadmintonPalette.accent.danger,
										}}
									/>
								)}
							</View>
						)}

						<View className="flex-row" style={{ gap: 16 }}>
							<View className="flex-row items-center" style={{ gap: 4 }}>
								<View className="size-2.5 rounded-full" style={{ backgroundColor: BadmintonPalette.accent.success }} />
								<Text className="text-xs font-semibold" style={{ color: BadmintonPalette.accent.success }}>
									{stats.confirmed} Going
								</Text>
							</View>
							<View className="flex-row items-center" style={{ gap: 4 }}>
								<View className="size-2.5 rounded-full" style={{ backgroundColor: BadmintonPalette.accent.danger }} />
								<Text className="text-xs font-semibold" style={{ color: BadmintonPalette.accent.danger }}>
									{stats.declined} Not Going
								</Text>
							</View>
							<View className="flex-row items-center" style={{ gap: 4 }}>
								<View className="size-2.5 rounded-full" style={{ backgroundColor: BadmintonPalette.text.muted }} />
								<Text className="text-xs font-semibold" style={{ color: BadmintonPalette.text.muted }}>
									{stats.pending} Pending
								</Text>
							</View>
						</View>
					</View>

					{/* Player List */}
					<View className="rounded-2xl bg-secondary border border-dark-100 overflow-hidden">
						<View className="px-4 py-3 border-b border-dark-100">
							<Text
								className="text-xs font-bold uppercase"
								style={{ color: BadmintonPalette.text.muted }}
							>
								Responses
							</Text>
						</View>
						{playerConfirmations.length === 0 ? (
							<View className="p-4">
								<Text className="text-sm" style={{ color: BadmintonPalette.text.muted }}>
									No players yet
								</Text>
							</View>
						) : (
							playerConfirmations.map((pc, idx) => (
								<View
									key={pc.playerId}
									className={`flex-row items-center px-4 py-3 ${idx < playerConfirmations.length - 1 ? "border-b border-dark-100" : ""}`}
								>
									<Text
										className="flex-1 text-sm font-medium"
										style={{ color: BadmintonPalette.text.primary }}
										numberOfLines={1}
									>
										{pc.playerName}
									</Text>
									<View
										className="px-2 py-0.5 rounded-full"
										style={{
											backgroundColor:
												pc.status === "confirmed"
													? `${BadmintonPalette.accent.success}20`
													: pc.status === "declined"
														? `${BadmintonPalette.accent.danger}20`
														: `${BadmintonPalette.text.muted}20`,
										}}
									>
										<Text
											className="text-[10px] font-bold capitalize"
											style={{
												color:
													pc.status === "confirmed"
														? BadmintonPalette.accent.success
														: pc.status === "declined"
															? BadmintonPalette.accent.danger
															: BadmintonPalette.text.muted,
											}}
										>
											{pc.status}
										</Text>
									</View>
								</View>
							))
						)}
					</View>
				</>
			)}
		</ScrollView>
	);
};

export default RSVPContent;
