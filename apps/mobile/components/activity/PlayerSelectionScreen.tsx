import AddInput from "@/components/AddInput";
import PlayerLevelBadge from "@/components/PlayerLevelBadge";
import ScreenHeader from "@/components/activity/ScreenHeader";
import { BadmintonPalette } from "@/constants/palette";
import { type Player } from "@badminton/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TouchableOpacity, View } from "react-native";

type PlayerSelectionScreenProps = {
	title: string;
	players: Player[];
	maxSelect: number;
	onConfirm: (selectedPlayerIds: string[]) => void;
	onBack: () => void;
};

const PlayerSelectionScreen = ({
	title,
	players,
	maxSelect,
	onConfirm,
	onBack,
}: PlayerSelectionScreenProps) => {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [query, setQuery] = useState("");

	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

	const filteredPlayers = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return players;
		return players.filter((p) => p.name.toLowerCase().includes(q));
	}, [players, query]);

	const toggle = (id: string) => {
		setSelectedIds((prev) => {
			if (prev.includes(id)) return prev.filter((x) => x !== id);
			if (prev.length >= maxSelect) return prev;
			return [...prev, id];
		});
	};

	return (
		<>
			<ScreenHeader title={title} onBack={onBack} />

			{/* Selection counter */}
			<View className="px-6 pb-2">
				<View className="flex-row items-center">
					<View className="flex-row items-center px-2 py-0.5 rounded-md bg-accent/15 mr-2">
						<Text
							className="text-xs font-semibold"
							style={{ color: BadmintonPalette.accent.primary }}
						>
							{selectedIds.length}/{maxSelect}
						</Text>
					</View>
					<Text
						className="text-sm"
						style={{ color: BadmintonPalette.text.muted }}
					>
						player{maxSelect === 1 ? "" : "s"} selected
					</Text>
				</View>
			</View>

			{/* Search */}
			<View className="px-6 pb-3">
				<AddInput
					type="search"
					placeholder="Search players..."
					value={query}
					onChangeText={setQuery}
				/>
			</View>

			{/* Player List */}
			{players.length === 0 ? (
				<View className="flex-1 items-center justify-center">
					<Text
						className="text-sm text-center"
						style={{ color: BadmintonPalette.text.muted }}
					>
						No available players{"\n"}
						(everyone is in a game or queue)
					</Text>
				</View>
			) : filteredPlayers.length === 0 ? (
				<View className="flex-1 items-center justify-center">
					<Text
						className="text-sm text-center"
						style={{ color: BadmintonPalette.text.muted }}
					>
						No players match "{query.trim()}"
					</Text>
				</View>
			) : (
				<FlatList
					data={filteredPlayers}
					keyExtractor={(item) => item.id}
					keyboardShouldPersistTaps="handled"
					className="flex-1"
					contentContainerStyle={{ gap: 8, paddingHorizontal: 24, paddingBottom: 16 }}
					renderItem={({ item }) => {
						const isSelected = selectedSet.has(item.id);
						const isDisabled = !isSelected && selectedIds.length >= maxSelect;
						return (
							<Pressable
								onPress={() => (isDisabled ? null : toggle(item.id))}
								className={[
									"flex-row items-center rounded-xl border p-3",
									isSelected
										? "bg-court-deep/20 border-court-lime/40"
										: "bg-dark-200 border-dark-100",
									isDisabled ? "opacity-40" : "",
								].join(" ")}
								accessibilityRole="button"
								accessibilityLabel={`Select player ${item.name}`}
							>
								<View className="size-10 rounded-lg bg-court-deep/20 items-center justify-center mr-3">
									<AntDesign
										name="user"
										size={16}
										color={BadmintonPalette.court.lime}
									/>
								</View>
								<View className="flex-1">
									<Text
										className="font-semibold"
										style={{ color: BadmintonPalette.text.primary }}
										numberOfLines={1}
									>
										{item.name}
									</Text>
									<View className="flex-row items-center mt-1">
										<Text
											className="text-xs mr-2"
											style={{ color: BadmintonPalette.text.muted }}
										>
											{item.gameCount} games
										</Text>
										<PlayerLevelBadge level={item.level} size="xs" />
									</View>
								</View>
								<View
									className={[
										"size-6 rounded-lg items-center justify-center",
										isSelected
											? "bg-court-lime"
											: "bg-dark-100 border border-dark-100",
									].join(" ")}
								>
									{isSelected && (
										<MaterialCommunityIcons
											name="check"
											size={16}
											color={BadmintonPalette.bg.base}
										/>
									)}
								</View>
							</Pressable>
						);
					}}
				/>
			)}

			{/* Footer */}
			<View
				className="flex-row items-center px-6 py-4 border-t border-dark-100"
				style={{ gap: 12 }}
			>
				<TouchableOpacity
					className="flex-1 py-3 rounded-xl border border-dark-100 bg-dark-200 items-center"
					onPress={onBack}
					accessibilityRole="button"
					accessibilityLabel="Cancel"
				>
					<Text
						className="font-bold"
						style={{ color: BadmintonPalette.text.secondary }}
					>
						Cancel
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					className={[
						"flex-1 py-3 rounded-xl items-center",
						selectedIds.length > 0
							? "bg-accent active:opacity-80"
							: "bg-dark-100",
					].join(" ")}
					onPress={() => onConfirm(selectedIds)}
					disabled={selectedIds.length === 0}
					accessibilityRole="button"
					accessibilityLabel="Confirm selection"
				>
					<Text
						className="font-bold"
						style={{
							color:
								selectedIds.length > 0
									? BadmintonPalette.bg.base
									: BadmintonPalette.text.muted,
						}}
					>
						Confirm{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
					</Text>
				</TouchableOpacity>
			</View>
		</>
	);
};

export default PlayerSelectionScreen;
