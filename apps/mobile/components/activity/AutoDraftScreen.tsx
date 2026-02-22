import ScreenHeader from "@/components/activity/ScreenHeader";
import { BadmintonPalette } from "@/constants/palette";
import { PlayerLevel } from "@badminton/types";
import { playerLevelConfig } from "@badminton/ui-shared";
import React from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

type AutoDraftScreenProps = {
	draftCount: number;
	setDraftCount: (n: number) => void;
	shuffleMode: "balanced" | "random" | "skill-match";
	setShuffleMode: (mode: "balanced" | "random" | "skill-match") => void;
	selectedLevels: Set<PlayerLevel>;
	setSelectedLevels: React.Dispatch<React.SetStateAction<Set<PlayerLevel>>>;
	onGenerate: (
		mode: "balanced" | "random" | "skill-match",
		levels: Set<PlayerLevel>,
	) => void;
	onBack: () => void;
};

const AutoDraftScreen = ({
	draftCount,
	setDraftCount,
	shuffleMode,
	setShuffleMode,
	selectedLevels,
	setSelectedLevels,
	onGenerate,
	onBack,
}: AutoDraftScreenProps) => {
	return (
		<>
			<ScreenHeader title="Auto Draft" onBack={onBack} />

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 24, gap: 24 }}
			>
				<Text
					className="text-sm"
					style={{ color: BadmintonPalette.text.muted }}
				>
					Unique matchups are prioritized, duplicates allowed when
					exhausted.
				</Text>

				{/* Number of Drafts */}
				<View>
					<Text
						className="text-xs font-semibold uppercase tracking-wider mb-2"
						style={{ color: BadmintonPalette.text.secondary }}
					>
						Number of Drafts
					</Text>
					<View className="flex-row items-center justify-center gap-3">
						<TouchableOpacity
							onPress={() =>
								setDraftCount(Math.max(1, draftCount - 5))
							}
							className="size-10 rounded-xl bg-dark-200 border border-dark-100 items-center justify-center"
						>
							<Text className="text-light-100 text-lg font-bold">
								−
							</Text>
						</TouchableOpacity>
						<TextInput
							className="w-16 text-center text-xl font-bold rounded-xl bg-dark-200 border border-dark-100 py-2"
							style={{ color: BadmintonPalette.accent.primary }}
							keyboardType="numeric"
							value={String(draftCount)}
							onChangeText={(val) => {
								const n = parseInt(val, 10);
								if (!isNaN(n) && n >= 1) setDraftCount(n);
							}}
						/>
						<TouchableOpacity
							onPress={() => setDraftCount(draftCount + 5)}
							className="size-10 rounded-xl bg-dark-200 border border-dark-100 items-center justify-center"
						>
							<Text className="text-light-100 text-lg font-bold">
								+
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Shuffle Mode */}
				<View>
					<Text
						className="text-xs font-semibold uppercase tracking-wider mb-2"
						style={{ color: BadmintonPalette.text.secondary }}
					>
						Shuffle Mode
					</Text>
					<View style={{ gap: 8 }}>
						{(
							[
								{
									key: "balanced",
									label: "Balanced",
									desc: "Equal game distribution",
								},
								{
									key: "random",
									label: "Random",
									desc: "Fully randomized",
								},
								{
									key: "skill-match",
									label: "Skill Match",
									desc: "Filter by skill level",
								},
							] as const
						).map((opt) => (
							<TouchableOpacity
								key={opt.key}
								onPress={() => setShuffleMode(opt.key)}
								className={`flex-row items-center p-3 rounded-xl border ${
									shuffleMode === opt.key
										? "border-accent/50 bg-accent/10"
										: "border-dark-100 bg-dark-200"
								}`}
							>
								<View
									className={`size-5 rounded-full border-2 items-center justify-center mr-3 ${
										shuffleMode === opt.key
											? "border-accent"
											: "border-dark-100"
									}`}
								>
									{shuffleMode === opt.key && (
										<View className="size-2.5 rounded-full bg-accent" />
									)}
								</View>
								<View className="flex-1">
									<Text
										className="text-sm font-semibold"
										style={{
											color: BadmintonPalette.text.primary,
										}}
									>
										{opt.label}
									</Text>
									<Text
										className="text-xs"
										style={{
											color: BadmintonPalette.text.muted,
										}}
									>
										{opt.desc}
									</Text>
								</View>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* Level Filter (skill-match only) */}
				{shuffleMode === "skill-match" && (
					<View>
						<Text
							className="text-xs font-semibold uppercase tracking-wider mb-2"
							style={{ color: BadmintonPalette.text.secondary }}
						>
							Include Levels
						</Text>
						<View
							className="flex-row flex-wrap"
							style={{ gap: 8 }}
						>
							{Object.values(PlayerLevel).map((level) => {
								const config = playerLevelConfig[level];
								const checked = selectedLevels.has(level);
								return (
									<TouchableOpacity
										key={level}
										onPress={() => {
											setSelectedLevels((prev) => {
												const next = new Set(prev);
												if (next.has(level))
													next.delete(level);
												else next.add(level);
												return next;
											});
										}}
										className={`flex-row items-center px-3 py-2 rounded-xl border ${
											checked
												? "border-accent/50 bg-accent/10"
												: "border-dark-100 bg-dark-200 opacity-50"
										}`}
									>
										<View
											className="size-5 rounded items-center justify-center mr-1.5"
											style={{
												backgroundColor: `${config.color}15`,
											}}
										>
											<Text
												className="text-[10px] font-bold"
												style={{ color: config.color }}
											>
												{config.shortLabel}
											</Text>
										</View>
										<Text
											className="text-sm"
											style={{
												color: BadmintonPalette.text
													.primary,
											}}
										>
											{config.label}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>
						{selectedLevels.size === 0 && (
							<Text className="text-xs text-danger mt-1">
								Select at least one level
							</Text>
						)}
					</View>
				)}

				{/* Actions */}
				<View className="flex-row gap-3 pt-2">
					<TouchableOpacity
						onPress={onBack}
						className="flex-1 py-3 rounded-xl border border-dark-100 bg-dark-200 items-center"
					>
						<Text
							className="font-bold"
							style={{
								color: BadmintonPalette.text.secondary,
							}}
						>
							Cancel
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() =>
							onGenerate(shuffleMode, selectedLevels)
						}
						disabled={
							shuffleMode === "skill-match" &&
							selectedLevels.size === 0
						}
						className="flex-1 py-3 rounded-xl items-center"
						style={{
							backgroundColor: BadmintonPalette.accent.primary,
							opacity:
								shuffleMode === "skill-match" &&
								selectedLevels.size === 0
									? 0.4
									: 1,
						}}
					>
						<Text
							className="font-bold"
							style={{ color: BadmintonPalette.bg.base }}
						>
							Generate
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</>
	);
};

export default AutoDraftScreen;
