import PlayerTag from "@/components/PlayerTag";
import ScreenHeader from "@/components/activity/ScreenHeader";
import { BadmintonPalette } from "@/constants/palette";
import { type Draft, type Player } from "@badminton/types";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type FinishMatchScreenProps = {
	draft: Draft;
	playerMap: Map<string, Player>;
	onFinish: (winner: "A" | "B") => void;
	onBack: () => void;
};

const FinishMatchScreen = ({
	draft,
	playerMap,
	onFinish,
	onBack,
}: FinishMatchScreenProps) => {
	const half = Math.ceil(draft.playerIds.length / 2);

	return (
		<>
			<ScreenHeader title="Select Winner" onBack={onBack} />

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 24, gap: 16 }}
			>
				<Text
					className="text-sm"
					style={{ color: BadmintonPalette.text.muted }}
				>
					Which team won this match?
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
							onPress={() => onFinish(team)}
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
