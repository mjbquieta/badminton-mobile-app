import PlayerTag from "@/components/PlayerTag";
import ScreenHeader from "@/components/activity/ScreenHeader";
import { BadmintonPalette } from "@/constants/palette";
import type { Court, Draft, Player } from "@badminton/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

type MatchHistoryScreenProps = {
	drafts: Draft[];
	courts: Court[];
	playerMap: Map<string, Player>;
	onBack: () => void;
};

const MatchHistoryScreen = ({
	drafts,
	courts,
	playerMap,
	onBack,
}: MatchHistoryScreenProps) => {
	const [search, setSearch] = useState("");
	const [courtFilter, setCourtFilter] = useState<string | null>(null);
	const [winnerFilter, setWinnerFilter] = useState<"A" | "B" | null>(null);

	const finishedDrafts = useMemo(
		() => drafts.filter((d) => d.finished),
		[drafts],
	);

	const filtered = useMemo(() => {
		let result = finishedDrafts;
		if (search.trim()) {
			const q = search.toLowerCase();
			result = result.filter((d) =>
				d.playerIds.some((id) => {
					const p = playerMap.get(id);
					return p?.name.toLowerCase().includes(q);
				}),
			);
		}
		if (courtFilter) {
			result = result.filter((d) => d.courtId === courtFilter);
		}
		if (winnerFilter) {
			result = result.filter((d) => d.winner === winnerFilter);
		}
		return result;
	}, [finishedDrafts, search, courtFilter, winnerFilter, playerMap]);

	const courtCount = Math.max(courts.length, 1);
	const rounds: Draft[][] = useMemo(() => {
		const r: Draft[][] = [];
		for (let i = 0; i < filtered.length; i += courtCount) {
			r.push(filtered.slice(i, i + courtCount));
		}
		return r;
	}, [filtered, courtCount]);

	return (
		<>
			<ScreenHeader title="Match History" onBack={onBack} />

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 40 }}
			>
				{/* Search */}
				<TextInput
					className="rounded-xl border border-dark-100 bg-dark-200 px-4 py-3"
					style={{ color: BadmintonPalette.text.primary, fontSize: 14 }}
					value={search}
					onChangeText={setSearch}
					placeholder="Search by player name..."
					placeholderTextColor={BadmintonPalette.text.muted}
				/>

				{/* Filters */}
				<View className="flex-row flex-wrap" style={{ gap: 8 }}>
					{/* Court filter */}
					{courts.map((c) => (
						<TouchableOpacity
							key={c.id}
							onPress={() => setCourtFilter(courtFilter === c.id ? null : c.id)}
							className={`px-3 py-1.5 rounded-lg border ${
								courtFilter === c.id
									? "bg-accent/15 border-accent/30"
									: "bg-dark-200 border-dark-100"
							}`}
						>
							<Text
								className="text-xs font-semibold"
								style={{
									color:
										courtFilter === c.id
											? BadmintonPalette.accent.primary
											: BadmintonPalette.text.secondary,
								}}
							>
								{c.name}
							</Text>
						</TouchableOpacity>
					))}
					{/* Winner filter */}
					{(["A", "B"] as const).map((team) => (
						<TouchableOpacity
							key={team}
							onPress={() => setWinnerFilter(winnerFilter === team ? null : team)}
							className={`px-3 py-1.5 rounded-lg border ${
								winnerFilter === team
									? "bg-court-lime/15 border-court-lime/30"
									: "bg-dark-200 border-dark-100"
							}`}
						>
							<Text
								className="text-xs font-semibold"
								style={{
									color:
										winnerFilter === team
											? BadmintonPalette.court.lime
											: BadmintonPalette.text.secondary,
								}}
							>
								Team {team} wins
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Stats */}
				<View className="flex-row bg-secondary border border-dark-100 rounded-xl overflow-hidden">
					<View className="flex-1 p-3 items-center border-r border-dark-100">
						<Text
							className="text-xl font-bold"
							style={{ color: BadmintonPalette.accent.primary }}
						>
							{finishedDrafts.length}
						</Text>
						<Text className="text-xs" style={{ color: BadmintonPalette.text.muted }}>
							Total
						</Text>
					</View>
					<View className="flex-1 p-3 items-center">
						<Text
							className="text-xl font-bold"
							style={{ color: BadmintonPalette.court.lime }}
						>
							{filtered.length}
						</Text>
						<Text className="text-xs" style={{ color: BadmintonPalette.text.muted }}>
							Shown
						</Text>
					</View>
				</View>

				{/* Match List */}
				{filtered.length === 0 ? (
					<View className="py-8 items-center">
						<MaterialCommunityIcons
							name="history"
							size={48}
							color={BadmintonPalette.text.muted}
						/>
						<Text
							className="text-sm mt-3 text-center"
							style={{ color: BadmintonPalette.text.muted }}
						>
							{finishedDrafts.length === 0
								? "No finished matches yet"
								: "No matches match your filters"}
						</Text>
					</View>
				) : (
					<View style={{ gap: 12 }}>
						{rounds.map((round, roundIndex) => (
							<View key={roundIndex} style={{ gap: 8 }}>
								{roundIndex > 0 && (
									<View className="flex-row items-center gap-3 py-1">
										<View className="flex-1 h-px bg-accent/20" />
										<Text className="text-xs font-semibold text-accent/50 uppercase tracking-widest">
											Set {roundIndex + 1}
										</Text>
										<View className="flex-1 h-px bg-accent/20" />
									</View>
								)}
								{round.map((draft) => {
									const half = Math.ceil(draft.playerIds.length / 2);
									const teamA = draft.playerIds
										.slice(0, half)
										.map((id) => playerMap.get(id))
										.filter((p): p is Player => !!p);
									const teamB = draft.playerIds
										.slice(half)
										.map((id) => playerMap.get(id))
										.filter((p): p is Player => !!p);
									const court = courts.find((c) => c.id === draft.courtId);

									return (
										<View
											key={draft.id}
											className="rounded-xl bg-secondary border border-dark-100 overflow-hidden"
										>
											{/* Header */}
											<View className="flex-row items-center justify-between px-3 py-2 border-b border-dark-100">
												{court && (
													<Text
														className="text-xs"
														style={{ color: BadmintonPalette.text.secondary }}
													>
														{court.name}
													</Text>
												)}
												<View className="px-2 py-0.5 rounded-full bg-accent/15 ml-auto">
													<Text
														className="text-[10px] font-bold"
														style={{ color: BadmintonPalette.accent.primary }}
													>
														Team {draft.winner} won
													</Text>
												</View>
											</View>

											{/* Teams */}
											<View className="p-3">
												<View className="flex-row items-center">
													<View className="flex-1 gap-1">
														<Text
															className="text-[10px] font-bold uppercase tracking-wide mb-0.5"
															style={{
																color:
																	draft.winner === "A"
																		? BadmintonPalette.accent.primary
																		: BadmintonPalette.text.muted,
															}}
														>
															Team A {draft.winner === "A" ? "★" : ""}
														</Text>
														{teamA.map((p) => (
															<PlayerTag
																key={p.id}
																player={p}
																name={p.name}
																level={p.level}
															/>
														))}
													</View>

													<View className="px-3 items-center">
														{draft.scoreA != null && draft.scoreB != null ? (
															<>
																<Text
																	className="text-sm font-bold"
																	style={{
																		color:
																			draft.winner === "A"
																				? BadmintonPalette.accent.primary
																				: BadmintonPalette.text.muted,
																	}}
																>
																	{draft.scoreA}
																</Text>
																<Text className="text-[10px] font-bold text-danger uppercase my-0.5">
																	vs
																</Text>
																<Text
																	className="text-sm font-bold"
																	style={{
																		color:
																			draft.winner === "B"
																				? BadmintonPalette.accent.primary
																				: BadmintonPalette.text.muted,
																	}}
																>
																	{draft.scoreB}
																</Text>
															</>
														) : (
															<Text className="text-xs font-bold text-danger uppercase">
																vs
															</Text>
														)}
													</View>

													<View className="flex-1 gap-1">
														<Text
															className="text-[10px] font-bold uppercase tracking-wide mb-0.5"
															style={{
																color:
																	draft.winner === "B"
																		? BadmintonPalette.accent.primary
																		: BadmintonPalette.text.muted,
															}}
														>
															Team B {draft.winner === "B" ? "★" : ""}
														</Text>
														{teamB.map((p) => (
															<PlayerTag
																key={p.id}
																player={p}
																name={p.name}
																level={p.level}
															/>
														))}
													</View>
												</View>
											</View>
										</View>
									);
								})}
							</View>
						))}
					</View>
				)}
			</ScrollView>
		</>
	);
};

export default MatchHistoryScreen;
