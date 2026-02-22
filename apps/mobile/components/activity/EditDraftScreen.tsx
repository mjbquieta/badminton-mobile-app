import PlayerTag from "@/components/PlayerTag";
import ScreenHeader from "@/components/activity/ScreenHeader";
import { BadmintonPalette } from "@/constants/palette";
import { type Court, type Draft, type Player } from "@badminton/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type EditDraftScreenProps = {
	draft: Draft;
	courts: Court[];
	playerMap: Map<string, Player>;
	onCourtChange: (courtId: string) => void;
	onExchange: (playerIdA: string, playerIdB: string) => void;
	onReplace: (playerIndex: number) => void;
	onBack: () => void;
};

const EditDraftScreen = ({
	draft,
	courts,
	playerMap,
	onCourtChange,
	onExchange,
	onReplace,
	onBack,
}: EditDraftScreenProps) => {
	const half = Math.ceil(draft.playerIds.length / 2);
	const eTeamA = draft.playerIds
		.slice(0, half)
		.map((id, i) => ({ id, index: i, player: playerMap.get(id) }))
		.filter(
			(o): o is { id: string; index: number; player: Player } =>
				!!o.player,
		);
	const eTeamB = draft.playerIds
		.slice(half)
		.map((id, i) => ({ id, index: half + i, player: playerMap.get(id) }))
		.filter(
			(o): o is { id: string; index: number; player: Player } =>
				!!o.player,
		);

	return (
		<>
			<ScreenHeader title={`Edit - ${draft.name}`} onBack={onBack} />

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 24, gap: 16 }}
			>
				{/* Court Selection */}
				{courts.length > 0 && (
					<View style={{ gap: 8 }}>
						<Text
							className="text-[10px] font-bold uppercase tracking-wide"
							style={{ color: BadmintonPalette.text.muted }}
						>
							Court
						</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
						>
							<View className="flex-row" style={{ gap: 6 }}>
								{courts.map((c) => {
									const isSelected = draft.courtId === c.id;
									return (
										<TouchableOpacity
											key={c.id}
											onPress={() =>
												onCourtChange(c.id)
											}
											className="px-3 py-2 rounded-xl border"
											style={{
												backgroundColor: isSelected
													? `${BadmintonPalette.accent.primary}15`
													: BadmintonPalette.bg
															.elevated,
												borderColor: isSelected
													? `${BadmintonPalette.accent.primary}50`
													: BadmintonPalette.bg
															.border,
											}}
											accessibilityRole="button"
										>
											<Text
												className="text-xs font-semibold"
												style={{
													color: isSelected
														? BadmintonPalette
																.accent.primary
														: BadmintonPalette.text
																.secondary,
												}}
											>
												{c.name}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</ScrollView>
					</View>
				)}

				{/* Team A */}
				<View style={{ gap: 8 }}>
					<Text
						className="text-[10px] font-bold uppercase tracking-wide"
						style={{ color: BadmintonPalette.text.muted }}
					>
						Team A
					</Text>
					{eTeamA.map(({ id, index, player: p }) => (
						<View
							key={id}
							className="flex-row items-center rounded-xl bg-dark-200 border border-dark-100 p-2"
							style={{ gap: 8 }}
						>
							<View className="flex-1 flex-shrink">
								<PlayerTag name={p.name} level={p.level} />
							</View>
							<TouchableOpacity
								onPress={() => onReplace(index)}
								className="px-2.5 py-1.5 rounded-lg"
								style={{
									backgroundColor: `${BadmintonPalette.accent.info}15`,
								}}
								accessibilityRole="button"
								accessibilityLabel={`Replace ${p.name}`}
							>
								<Text
									className="text-[10px] font-bold"
									style={{
										color: BadmintonPalette.accent.info,
									}}
								>
									Replace
								</Text>
							</TouchableOpacity>
						</View>
					))}
				</View>

				{/* Team B */}
				<View style={{ gap: 8 }}>
					<Text
						className="text-[10px] font-bold uppercase tracking-wide"
						style={{ color: BadmintonPalette.text.muted }}
					>
						Team B
					</Text>
					{eTeamB.map(({ id, index, player: p }) => (
						<View
							key={id}
							className="flex-row items-center rounded-xl bg-dark-200 border border-dark-100 p-2"
							style={{ gap: 8 }}
						>
							<View className="flex-1 flex-shrink">
								<PlayerTag name={p.name} level={p.level} />
							</View>
							<TouchableOpacity
								onPress={() => onReplace(index)}
								className="px-2.5 py-1.5 rounded-lg"
								style={{
									backgroundColor: `${BadmintonPalette.accent.info}15`,
								}}
								accessibilityRole="button"
								accessibilityLabel={`Replace ${p.name}`}
							>
								<Text
									className="text-[10px] font-bold"
									style={{
										color: BadmintonPalette.accent.info,
									}}
								>
									Replace
								</Text>
							</TouchableOpacity>
						</View>
					))}
				</View>

				{/* Exchange Section */}
				<View
					className="border-t border-dark-100 pt-4"
					style={{ gap: 8 }}
				>
					<Text
						className="text-[10px] font-bold uppercase tracking-wide"
						style={{ color: BadmintonPalette.text.muted }}
					>
						Exchange Players
					</Text>
					{draft.playerIds.length === 2 ? (
						<TouchableOpacity
							onPress={() => {
								const [a, b] = draft.playerIds;
								onExchange(a, b);
							}}
							className="flex-row items-center justify-center rounded-xl bg-dark-200 border border-dark-100 p-3"
							style={{ gap: 8 }}
							accessibilityRole="button"
						>
							<Text
								className="text-sm"
								style={{
									color: BadmintonPalette.text.primary,
								}}
							>
								{eTeamA[0]?.player.name}
							</Text>
							<MaterialCommunityIcons
								name="swap-horizontal"
								size={16}
								color={BadmintonPalette.accent.primary}
							/>
							<Text
								className="text-sm"
								style={{
									color: BadmintonPalette.text.primary,
								}}
							>
								{eTeamB[0]?.player.name}
							</Text>
						</TouchableOpacity>
					) : (
						<View style={{ gap: 6 }}>
							{eTeamA.map((a, i) => {
								const b = eTeamB[i];
								if (!b) return null;
								return (
									<TouchableOpacity
										key={`${a.id}-${b.id}`}
										onPress={() =>
											onExchange(a.id, b.id)
										}
										className="flex-row items-center justify-between rounded-xl bg-dark-200 border border-dark-100 px-3 py-2.5"
										accessibilityRole="button"
									>
										<Text
											className="text-sm flex-1"
											style={{
												color: BadmintonPalette.text
													.primary,
											}}
											numberOfLines={1}
										>
											{a.player.name}
										</Text>
										<MaterialCommunityIcons
											name="swap-horizontal"
											size={16}
											color={
												BadmintonPalette.text.muted
											}
											style={{ marginHorizontal: 8 }}
										/>
										<Text
											className="text-sm flex-1 text-right"
											style={{
												color: BadmintonPalette.text
													.primary,
											}}
											numberOfLines={1}
										>
											{b.player.name}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>
					)}
				</View>

				{/* Close */}
				<TouchableOpacity
					onPress={onBack}
					className="py-3 rounded-xl border border-dark-100 bg-dark-200 items-center"
				>
					<Text
						className="font-bold"
						style={{ color: BadmintonPalette.text.secondary }}
					>
						Close
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</>
	);
};

export default EditDraftScreen;
