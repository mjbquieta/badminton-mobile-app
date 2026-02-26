import AddInput from "@/components/AddInput";
import ScreenHeader from "@/components/activity/ScreenHeader";
import { BadmintonPalette } from "@/constants/palette";
import { PlayerLevel } from "@badminton/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";
import {
	Keyboard,
	Pressable,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const levelOptions: { value: PlayerLevel; label: string; color: string }[] = [
	{
		value: PlayerLevel.BEGINNER,
		label: "B",
		color: BadmintonPalette.levels.beginner,
	},
	{
		value: PlayerLevel.INTERMEDIATE,
		label: "I",
		color: BadmintonPalette.levels.intermediate,
	},
	{
		value: PlayerLevel.ADVANCED,
		label: "A",
		color: BadmintonPalette.levels.advanced,
	},
	{ value: PlayerLevel.PRO, label: "P", color: BadmintonPalette.levels.pro },
];

const levelLabels: Record<PlayerLevel, string> = {
	[PlayerLevel.BEGINNER]: "Beginner",
	[PlayerLevel.INTERMEDIATE]: "Intermediate",
	[PlayerLevel.ADVANCED]: "Advanced",
	[PlayerLevel.PRO]: "Pro",
};

type AddPlayerScreenProps = {
	onAdd: (name: string, level: PlayerLevel) => void;
	onBack: () => void;
};

const AddPlayerScreen = ({ onAdd, onBack }: AddPlayerScreenProps) => {
	const [playerName, setPlayerName] = useState("");
	const [selectedLevel, setSelectedLevel] = useState<PlayerLevel>(
		PlayerLevel.BEGINNER,
	);

	const canAdd = playerName.trim().length > 0;
	const selectedLevelColor =
		levelOptions.find((l) => l.value === selectedLevel)?.color ||
		BadmintonPalette.court.lime;

	const handleAdd = () => {
		if (!canAdd) return;
		Keyboard.dismiss();
		onAdd(playerName.trim(), selectedLevel);
		onBack();
	};

	return (
		<>
			<ScreenHeader title="Add New Player" onBack={onBack} />

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 24, gap: 24 }}
				keyboardShouldPersistTaps="handled"
			>
				<Text
					className="text-sm"
					style={{ color: BadmintonPalette.text.muted }}
				>
					Enter player name and select skill level
				</Text>

				{/* Player Name */}
				<View>
					<Text
						className="text-xs font-medium mb-2"
						style={{ color: BadmintonPalette.text.secondary }}
					>
						Player Name
					</Text>
					<AddInput
						type="player"
						placeholder="Enter player name..."
						value={playerName}
						onChangeText={setPlayerName}
						onSubmitEditing={handleAdd}
					/>
				</View>

				{/* Level Selection */}
				<View>
					<Text
						className="text-xs font-medium mb-2"
						style={{ color: BadmintonPalette.text.secondary }}
					>
						Skill Level
					</Text>
					<View className="flex-row" style={{ gap: 8 }}>
						{levelOptions.map((option) => {
							const isSelected = selectedLevel === option.value;
							return (
								<Pressable
									key={option.value}
									onPress={() =>
										setSelectedLevel(option.value)
									}
									className="items-center justify-center rounded-lg"
									style={{
										width: 44,
										height: 44,
										backgroundColor: isSelected
											? option.color
											: `${option.color}15`,
										borderWidth: isSelected ? 0 : 1,
										borderColor: `${option.color}40`,
									}}
									accessibilityRole="button"
									accessibilityLabel={`Select ${levelLabels[option.value]} level`}
									accessibilityState={{
										selected: isSelected,
									}}
								>
									<Text
										className="text-sm font-bold"
										style={{
											color: isSelected
												? BadmintonPalette.bg.base
												: option.color,
										}}
									>
										{option.label}
									</Text>
								</Pressable>
							);
						})}
					</View>
					<Text
						className="text-xs font-medium mt-2"
						style={{ color: selectedLevelColor }}
					>
						{levelLabels[selectedLevel]}
					</Text>
				</View>
			</ScrollView>

			{/* Footer */}
			<View
				className="flex-row items-center px-6 py-4 border-t border-dark-100"
				style={{ gap: 12 }}
			>
				<TouchableOpacity
					className="flex-1 py-3 rounded-xl border border-dark-100 bg-dark-200 items-center"
					onPress={() => {
						Keyboard.dismiss();
						onBack();
					}}
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
						"flex-1 py-3 rounded-xl items-center flex-row justify-center",
						canAdd ? "bg-accent active:opacity-80" : "bg-dark-100",
					].join(" ")}
					onPress={handleAdd}
					disabled={!canAdd}
					accessibilityRole="button"
					accessibilityLabel="Add player"
				>
					<AntDesign
						name="plus"
						size={16}
						color={
							canAdd
								? BadmintonPalette.bg.base
								: BadmintonPalette.text.muted
						}
					/>
					<Text
						className="font-bold ml-1"
						style={{
							color: canAdd
								? BadmintonPalette.bg.base
								: BadmintonPalette.text.muted,
						}}
					>
						Add Player
					</Text>
				</TouchableOpacity>
			</View>
		</>
	);
};

export default AddPlayerScreen;
