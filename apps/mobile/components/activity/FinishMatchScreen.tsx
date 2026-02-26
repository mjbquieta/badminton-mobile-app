import PlayerTag from "@/components/PlayerTag";
import ScreenHeader from "@/components/activity/ScreenHeader";
import { BadmintonPalette } from "@/constants/palette";
import { type Draft, type Player } from "@badminton/types";
import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

type FinishMatchScreenProps = {
	draft: Draft;
	playerMap: Map<string, Player>;
	onFinish: (winner: "A" | "B", scoreA?: number, scoreB?: number) => void;
	onBack: () => void;
};

const FinishMatchScreen = ({
	draft,
	playerMap,
	onFinish,
	onBack,
}: FinishMatchScreenProps) => {
	const half = Math.ceil(draft.playerIds.length / 2);
	const [scoreA, setScoreA] = useState("");
	const [scoreB, setScoreB] = useState("");

	const parsedA = scoreA ? parseInt(scoreA, 10) : undefined;
	const parsedB = scoreB ? parseInt(scoreB, 10) : undefined;
	const bothScoresValid =
		parsedA !== undefined && parsedB !== undefined && !isNaN(parsedA) && !isNaN(parsedB);
	const autoWinner =
		bothScoresValid && parsedA !== parsedB
			? parsedA! > parsedB!
				? "A"
				: "B"
			: null;

	function handleSubmitScores() {
		if (!autoWinner) return;
		onFinish(
			autoWinner,
			parsedA !== undefined && !isNaN(parsedA) ? parsedA : undefined,
			parsedB !== undefined && !isNaN(parsedB) ? parsedB : undefined,
		);
	}

	function handleTeamPress(team: "A" | "B") {
		onFinish(
			team,
			parsedA !== undefined && !isNaN(parsedA) ? parsedA : undefined,
			parsedB !== undefined && !isNaN(parsedB) ? parsedB : undefined,
		);
	}

	return (
		<>
			<ScreenHeader title="Select Winner" onBack={onBack} />

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 24, gap: 16 }}
			>
				{/* Score Inputs */}
				<View className="rounded-xl border border-dark-100 bg-dark-200 p-4" style={{ gap: 12 }}>
					<Text
						className="text-xs font-bold uppercase tracking-wide"
						style={{ color: BadmintonPalette.text.muted }}
					>
						Score (optional)
					</Text>
					<View className="flex-row items-center" style={{ gap: 12 }}>
						<View className="flex-1">
							<Text
								className="text-xs mb-1"
								style={{ color: BadmintonPalette.text.secondary }}
							>
								Team A
							</Text>
							<TextInput
								className="rounded-lg border border-dark-100 bg-primary px-3 py-2 text-center"
								style={{ color: BadmintonPalette.text.primary, fontSize: 18, fontWeight: "700" }}
								value={scoreA}
								onChangeText={setScoreA}
								keyboardType="number-pad"
								placeholder="0"
								placeholderTextColor={BadmintonPalette.text.muted}
								maxLength={3}
							/>
						</View>
						<Text
							className="text-sm font-bold mt-4"
							style={{ color: BadmintonPalette.text.muted }}
						>
							—
						</Text>
						<View className="flex-1">
							<Text
								className="text-xs mb-1"
								style={{ color: BadmintonPalette.text.secondary }}
							>
								Team B
							</Text>
							<TextInput
								className="rounded-lg border border-dark-100 bg-primary px-3 py-2 text-center"
								style={{ color: BadmintonPalette.text.primary, fontSize: 18, fontWeight: "700" }}
								value={scoreB}
								onChangeText={setScoreB}
								keyboardType="number-pad"
								placeholder="0"
								placeholderTextColor={BadmintonPalette.text.muted}
								maxLength={3}
							/>
						</View>
					</View>
					{autoWinner && (
						<TouchableOpacity
							onPress={handleSubmitScores}
							className="py-3 rounded-xl items-center"
							style={{ backgroundColor: BadmintonPalette.accent.success }}
							accessibilityRole="button"
							accessibilityLabel={`Submit scores, Team ${autoWinner} wins`}
						>
							<Text className="font-bold" style={{ color: BadmintonPalette.bg.base }}>
								Submit — Team {autoWinner} wins
							</Text>
						</TouchableOpacity>
					)}
				</View>

				<Text
					className="text-sm"
					style={{ color: BadmintonPalette.text.muted }}
				>
					Or tap a team to declare the winner:
				</Text>

				{(["A", "B"] as const).map((team) => {
					const teamIds =
						team === "A"
							? draft.playerIds.slice(0, half)
							: draft.playerIds.slice(half);
					const teamPlayers = teamIds
						.map((id) => playerMap.get(id))
						.filter((p): p is Player => p !== undefined);

					return (
						<TouchableOpacity
							key={team}
							onPress={() => handleTeamPress(team)}
							className="p-4 rounded-xl border border-dark-100 bg-dark-200"
							style={{ gap: 8 }}
							accessibilityRole="button"
							accessibilityLabel={`Team ${team} wins`}
						>
							<Text
								className="text-xs font-bold uppercase tracking-wide"
								style={{ color: BadmintonPalette.court.lime }}
							>
								Team {team}
							</Text>
							<View style={{ gap: 6 }}>
								{teamPlayers.map((p) => (
									<PlayerTag
										key={p.id}
										player={p}
										name={p.name}
										level={p.level}
									/>
								))}
							</View>
						</TouchableOpacity>
					);
				})}

				<TouchableOpacity
					onPress={onBack}
					className="py-3 rounded-xl border border-dark-100 bg-dark-200 items-center"
				>
					<Text
						className="font-bold"
						style={{ color: BadmintonPalette.text.secondary }}
					>
						Cancel
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</>
	);
};

export default FinishMatchScreen;
