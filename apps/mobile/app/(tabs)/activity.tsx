import AutoDraftScreen from "@/components/activity/AutoDraftScreen";
import EditDraftScreen from "@/components/activity/EditDraftScreen";
import FinishMatchScreen from "@/components/activity/FinishMatchScreen";
import MatchHistoryScreen from "@/components/activity/MatchHistoryScreen";
import PlayerSelectionScreen from "@/components/activity/PlayerSelectionScreen";
import ConfirmationAlert from "@/components/ConfirmationAlert";
import PlayerTag from "@/components/PlayerTag";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { BadmintonPalette } from "@/constants/palette";
import {
  addDraft,
  addDraftsBatch,
  clearDrafts,
  clearDraftsError,
  finishDraft,
  incrementPlayersGameCount,
  incrementPlayersTrophies,
  removeDraft,
  resetAllGameCounts,
  updateDraftCourt,
  updateDraftPlayers,
  useAppDispatch,
  useAppSelector,
} from "@badminton/store";
import { type Player, PlayerLevel, type Draft, type Court } from "@badminton/types";
import { generateAutoDrafts, type ShuffleMode, computeBalanceScore, MatchupTracker } from "@badminton/core";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { v4 as uuidv4 } from "uuid";

type DraftCardProps = {
	draft: Draft;
	matchNumber: number;
	playerMap: Map<string, Player>;
	courts: Court[];
	balanceScore?: number;
	isRepeated?: boolean;
	isAdmin?: boolean;
	onEdit: (draft: Draft) => void;
	onFinish: (draft: Draft) => void;
	onDelete: (draft: Draft, matchNumber: number) => void;
};

const DraftCard = React.memo(function DraftCard({
	draft,
	matchNumber,
	playerMap,
	courts,
	balanceScore,
	isRepeated,
	isAdmin = true,
	onEdit,
	onFinish,
	onDelete,
}: DraftCardProps) {
	const half = Math.ceil(draft.playerIds.length / 2);
	const teamA = draft.playerIds
		.slice(0, half)
		.map((id) => playerMap.get(id))
		.filter((p): p is Player => p !== undefined);
	const teamB = draft.playerIds
		.slice(half)
		.map((id) => playerMap.get(id))
		.filter((p): p is Player => p !== undefined);
	const court = courts.find((c) => c.id === draft.courtId);

	return (
		<View
			className={`rounded-2xl bg-secondary border overflow-hidden ${
				draft.finished
					? "border-dark-100 opacity-50"
					: "border-dark-100"
			}`}
		>
			{/* Draft Header */}
			<View className="flex-row items-center justify-between p-4 border-b border-dark-100">
				<View className="flex-row items-center gap-2">
					<Text
						className="text-sm font-bold"
						style={{ color: BadmintonPalette.accent.primary }}
					>
						#{matchNumber}
					</Text>
					{court && (
						<View className="px-2 py-0.5 rounded-md bg-dark-200 border border-dark-100">
							<Text
								className="text-xs"
								style={{ color: BadmintonPalette.text.secondary }}
							>
								{court.name}
							</Text>
						</View>
					)}
					{!draft.finished && balanceScore != null && (
						<View
							className="px-2 py-0.5 rounded-md"
							style={{
								backgroundColor:
									balanceScore >= 80
										? `${BadmintonPalette.accent.success}20`
										: balanceScore >= 50
											? `${BadmintonPalette.accent.warning}20`
											: `${BadmintonPalette.accent.danger}20`,
							}}
						>
							<Text
								className="text-[10px] font-bold"
								style={{
									color:
										balanceScore >= 80
											? BadmintonPalette.accent.success
											: balanceScore >= 50
												? BadmintonPalette.accent.warning
												: BadmintonPalette.accent.danger,
								}}
							>
								{Math.round(balanceScore)}%
							</Text>
						</View>
					)}
					{isRepeated && (
						<MaterialCommunityIcons
							name="alert-circle-outline"
							size={14}
							color={BadmintonPalette.accent.warning}
						/>
					)}
				</View>
				{draft.finished ? (
					<View className="px-2 py-1 rounded-full bg-accent/15">
						<Text className="text-xs font-bold" style={{ color: BadmintonPalette.accent.primary }}>
							FINISHED
						</Text>
					</View>
				) : isAdmin ? (
					<View className="flex-row gap-2">
						<TouchableOpacity
							onPress={() => onEdit(draft)}
							className="px-3 py-1.5 rounded-lg"
							style={{ backgroundColor: `${BadmintonPalette.accent.info}15`, borderWidth: 1, borderColor: `${BadmintonPalette.accent.info}30` }}
							accessibilityRole="button"
							accessibilityLabel={`Edit draft ${matchNumber}`}
						>
							<Text className="text-xs font-bold" style={{ color: BadmintonPalette.accent.info }}>
								Edit
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => onFinish(draft)}
							className="px-3 py-1.5 rounded-lg bg-success/10 border border-success/30"
							accessibilityRole="button"
							accessibilityLabel={`Finish match ${matchNumber}`}
						>
							<Text className="text-xs font-bold text-success">
								Finish
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => onDelete(draft, matchNumber)}
							className="px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/30"
							accessibilityRole="button"
							accessibilityLabel={`Delete draft ${matchNumber}`}
						>
							<Text className="text-xs font-bold text-danger">
								Delete
							</Text>
						</TouchableOpacity>
					</View>
				) : null}
			</View>

			{/* Teams */}
			<View className="p-4">
				<View className="flex-row items-center">
					{/* Team A */}
					<View className="flex-1 gap-1.5">
						<Text
							className="text-[10px] font-bold uppercase tracking-wide mb-1"
							style={{
								color:
									draft.finished && draft.winner === "A"
										? BadmintonPalette.accent.primary
										: BadmintonPalette.text.muted,
							}}
						>
							Team A{" "}
							{draft.finished && draft.winner === "A"
								? "★"
								: ""}
						</Text>
						{teamA.map((p) => (
							<PlayerTag
								key={p.id}
								player={p}
								name={p.name}
								level={p.level}
								gameCount={p.gameCount}
							/>
						))}
					</View>

					{/* VS / Score */}
					<View className="px-3 items-center">
						{draft.finished && draft.scoreA != null && draft.scoreB != null ? (
							<>
								<Text
									className="text-sm font-bold"
									style={{ color: draft.winner === "A" ? BadmintonPalette.accent.primary : BadmintonPalette.text.muted }}
								>
									{draft.scoreA}
								</Text>
								<Text className="text-[10px] font-bold text-danger uppercase my-0.5">
									vs
								</Text>
								<Text
									className="text-sm font-bold"
									style={{ color: draft.winner === "B" ? BadmintonPalette.accent.primary : BadmintonPalette.text.muted }}
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

					{/* Team B */}
					<View className="flex-1 gap-1.5">
						<Text
							className="text-[10px] font-bold uppercase tracking-wide mb-1"
							style={{
								color:
									draft.finished && draft.winner === "B"
										? BadmintonPalette.accent.primary
										: BadmintonPalette.text.muted,
							}}
						>
							Team B{" "}
							{draft.finished && draft.winner === "B"
								? "★"
								: ""}
						</Text>
						{teamB.map((p) => (
							<PlayerTag
								key={p.id}
								player={p}
								name={p.name}
								level={p.level}
								gameCount={p.gameCount}
							/>
						))}
					</View>
				</View>
			</View>
		</View>
	);
});

const activity = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const allPlayers = useAppSelector((s) => s.players.items);
  const players = useMemo(() => allPlayers.filter((p) => p.active ?? true), [allPlayers]);
  const courts = useAppSelector((s) => s.courts.items);
  const drafts = useAppSelector((s) => s.drafts.items);
  const draftsError = useAppSelector((s) => s.drafts.error);
  const confirmation = useAppSelector((s) => s.confirmation);
  const isConfirmationActive = confirmation.meta.enabled;

  const draftablePlayers = useMemo(() => {
    if (!isConfirmationActive) return players;
    const confirmedIds = new Set(
      confirmation.playerConfirmations
        .filter((pc) => pc.status === "confirmed")
        .map((pc) => pc.playerId),
    );
    return players.filter((p) => confirmedIds.has(p.id));
  }, [players, isConfirmationActive, confirmation.playerConfirmations]);

  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showAutoDraftModal, setShowAutoDraftModal] = useState(false);
  const [draftCount, setDraftCount] = useState(30);
  const [shuffleMode, setShuffleMode] = useState<"balanced" | "random" | "skill-match">("balanced");
  const [selectedLevels, setSelectedLevels] = useState<Set<PlayerLevel>>(
    new Set([PlayerLevel.BEGINNER, PlayerLevel.INTERMEDIATE, PlayerLevel.ADVANCED, PlayerLevel.PRO]),
  );
  const [finishTarget, setFinishTarget] = useState<Draft | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Edit draft state (Replace / Exchange)
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [changeTarget, setChangeTarget] = useState<{
    draft: Draft;
    playerIndex: number;
  } | null>(null);

  const playerMap = useMemo(
    () => new Map(allPlayers.map((p) => [p.id, p])),
    [allPlayers],
  );

  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const handleEditDraft = useCallback((draft: Draft) => {
    setEditingDraft(draft);
  }, []);

  const handleFinishTarget = useCallback((draft: Draft) => {
    setFinishTarget(draft);
  }, []);

  const handleDeleteDraft = useCallback((draft: Draft, matchNumber: number) => {
    ConfirmationAlert({
      title: "Delete Draft",
      message: `Delete draft #${matchNumber}?`,
      onConfirm: () => {
        pushUndo();
        dispatch(removeDraft(draft.id));
        showToastRef.current({ type: "info", message: "Draft deleted" });
      },
    });
  }, [dispatch]);

  const activeDrafts = useMemo(
    () => drafts.filter((d) => !d.finished),
    [drafts],
  );

  const completedDrafts = useMemo(
    () => drafts.filter((d) => d.finished),
    [drafts],
  );

  // Group drafts into rounds based on court count
  const courtCount = Math.max(courts.length, 1);
  const rounds: Draft[][] = useMemo(() => {
    const r: Draft[][] = [];
    for (let i = 0; i < drafts.length; i += courtCount) {
      r.push(drafts.slice(i, i + courtCount));
    }
    return r;
  }, [drafts, courtCount]);

  // Balance scores per draft
  const balanceScores = useMemo(() => {
    const scores = new Map<string, number>();
    for (const d of drafts) {
      if (d.finished) continue;
      const half = Math.ceil(d.playerIds.length / 2);
      const teamAPlayers = d.playerIds.slice(0, half).map((id) => playerMap.get(id)).filter((p): p is Player => !!p);
      const teamBPlayers = d.playerIds.slice(half).map((id) => playerMap.get(id)).filter((p): p is Player => !!p);
      if (teamAPlayers.length > 0 && teamBPlayers.length > 0) {
        scores.set(d.id, computeBalanceScore(teamAPlayers, teamBPlayers));
      }
    }
    return scores;
  }, [drafts, playerMap]);

  // Combo frequency for repetition warnings
  const repeatedDraftIds = useMemo(() => {
    const freq = new Map<string, number>();
    for (const d of drafts) {
      const key = MatchupTracker.toKey(d.playerIds);
      freq.set(key, (freq.get(key) ?? 0) + 1);
    }
    const repeated = new Set<string>();
    for (const d of drafts) {
      const key = MatchupTracker.toKey(d.playerIds);
      if ((freq.get(key) ?? 0) > 1) repeated.add(d.id);
    }
    return repeated;
  }, [drafts]);

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState<Draft[][]>([]);
  const [redoStack, setRedoStack] = useState<Draft[][]>([]);
  const draftsRef = useRef(drafts);
  draftsRef.current = drafts;

  function pushUndo() {
    setUndoStack((prev) => [...prev.slice(-19), draftsRef.current]);
    setRedoStack([]);
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setRedoStack((s) => [...s, draftsRef.current]);
    dispatch(clearDrafts());
    if (prev.length > 0) dispatch(addDraftsBatch(prev));
    showToast({ type: "info", message: "Undone" });
  }

  function handleRedo() {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((s) => s.slice(0, -1));
    setUndoStack((s) => [...s, draftsRef.current]);
    dispatch(clearDrafts());
    if (next.length > 0) dispatch(addDraftsBatch(next));
    showToast({ type: "info", message: "Redone" });
  }

  function handleCreateDraft(selectedIds: string[]) {
    if (selectedIds.length !== 4) return;
    pushUndo();
    const draftId = uuidv4();
    dispatch(addDraft({ id: draftId, playerIds: selectedIds }));
    if (courts.length > 0) {
      const courtIndex = drafts.length % courts.length;
      dispatch(updateDraftCourt({ id: draftId, courtId: courts[courtIndex].id }));
    }
    showToast({ type: "success", message: "Draft created" });
    setShowSelectModal(false);
  }

  function handleFinish(winner: "A" | "B", scoreA?: number, scoreB?: number) {
    if (!finishTarget || finishTarget.finished) return;
    pushUndo();
    const half = Math.ceil(finishTarget.playerIds.length / 2);
    const winnerIds =
      winner === "A"
        ? finishTarget.playerIds.slice(0, half)
        : finishTarget.playerIds.slice(half);
    dispatch(incrementPlayersGameCount(finishTarget.playerIds));
    dispatch(incrementPlayersTrophies(winnerIds));
    dispatch(finishDraft({ id: finishTarget.id, winner, scoreA, scoreB }));
    showToast({ type: "success", message: "Match finished" });
    setFinishTarget(null);
  }

  function handleAutoDraft(mode: "balanced" | "random" | "skill-match", levels: Set<PlayerLevel>) {
    const playerIds = mode === "skill-match"
      ? draftablePlayers.filter((p) => levels.has(p.level)).map((p) => p.id)
      : draftablePlayers.map((p) => p.id);

    if (playerIds.length < 2) {
      showToast({
        type: "info",
        message: mode === "skill-match"
          ? "Not enough players with selected levels"
          : "Not enough players",
      });
      setShowAutoDraftModal(false);
      return;
    }

    const playerLevels = new Map(draftablePlayers.map((p) => [p.id, p.level]));
    const result = generateAutoDrafts({
      mode: mode as ShuffleMode,
      draftCount,
      playerIds,
      playerLevels,
      courts: courts.map((c) => ({ id: c.id, isSingle: c.isSingle })),
      existingDrafts: drafts,
      existingDraftCount: drafts.length,
      selectedLevels: levels,
      idGenerator: uuidv4,
    });

    if (result.drafts.length > 0) {
      pushUndo();
      dispatch(addDraftsBatch(result.drafts));
    }

    const created = result.drafts.length;
    showToast({
      type: created > 0 ? "success" : "info",
      message: created > 0 ? `${created} draft${created > 1 ? "s" : ""} created` : "No new drafts could be generated",
    });
    setShowAutoDraftModal(false);
  }

  function handleReset() {
    ConfirmationAlert({
      title: "Reset All",
      message:
        "This will clear all drafts and reset all players' game counts and trophies to zero. Are you sure?",
      onConfirm: () => {
        dispatch(clearDrafts());
        dispatch(resetAllGameCounts());
        showToast({ type: "info", message: "All drafts reset" });
      },
    });
  }

  async function handleShareSchedule() {
    if (drafts.length === 0) return;
    const lines: string[] = ["Match Schedule", ""];
    let setNum = 0;
    for (let i = 0; i < drafts.length; i++) {
      if (i % courtCount === 0) {
        setNum++;
        if (setNum > 1) lines.push("");
        lines.push(`--- Set ${setNum} ---`);
      }
      const d = drafts[i];
      const half = Math.ceil(d.playerIds.length / 2);
      const teamA = d.playerIds.slice(0, half).map((id) => playerMap.get(id)?.name ?? "?").join(", ");
      const teamB = d.playerIds.slice(half).map((id) => playerMap.get(id)?.name ?? "?").join(", ");
      const court = courts.find((c) => c.id === d.courtId);
      const courtLabel = court ? ` (${court.name})` : "";
      const score = d.scoreA != null && d.scoreB != null ? ` [${d.scoreA}-${d.scoreB}]` : "";
      const winner = d.finished ? ` → Team ${d.winner} wins${score}` : "";
      lines.push(`#${i + 1}${courtLabel}: ${teamA} vs ${teamB}${winner}`);
    }
    try {
      await Share.share({ message: lines.join("\n") });
    } catch {
      // User cancelled
    }
  }

  function handleChangePlayer(selectedIds: string[]) {
    if (!changeTarget || selectedIds.length !== 1) return;
    const newPlayerIds = [...changeTarget.draft.playerIds];
    newPlayerIds[changeTarget.playerIndex] = selectedIds[0];
    dispatch(updateDraftPlayers({ id: changeTarget.draft.id, playerIds: newPlayerIds }));
    if (editingDraft && editingDraft.id === changeTarget.draft.id) {
      setEditingDraft({ ...editingDraft, playerIds: newPlayerIds });
    }
    showToast({ type: "success", message: "Player replaced" });
    setChangeTarget(null);
  }

  // ── Sub-screen early returns (highest priority first) ──

  // Screen: Change Player (replace flow from Edit Draft)
  if (changeTarget) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <PlayerSelectionScreen
          title="Select Replacement Player"
          players={allPlayers.filter(
            (p) => !changeTarget.draft.playerIds.includes(p.id) && (p.active ?? true),
          )}
          maxSelect={1}
          onConfirm={handleChangePlayer}
          onBack={() => setChangeTarget(null)}
        />
      </SafeAreaView>
    );
  }

  // Screen: Edit Draft
  if (editingDraft) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <EditDraftScreen
          draft={editingDraft}
          courts={courts}
          playerMap={playerMap}
          onCourtChange={(courtId) => {
            dispatch(updateDraftCourt({ id: editingDraft.id, courtId }));
            setEditingDraft({ ...editingDraft, courtId });
          }}
          onExchange={(playerIdA, playerIdB) => {
            const idxA = editingDraft.playerIds.indexOf(playerIdA);
            const idxB = editingDraft.playerIds.indexOf(playerIdB);
            if (idxA === -1 || idxB === -1) return;
            const newPlayerIds = [...editingDraft.playerIds];
            newPlayerIds[idxA] = playerIdB;
            newPlayerIds[idxB] = playerIdA;
            dispatch(updateDraftPlayers({ id: editingDraft.id, playerIds: newPlayerIds }));
            setEditingDraft({ ...editingDraft, playerIds: newPlayerIds });
            showToast({ type: "success", message: "Players exchanged" });
          }}
          onReplace={(playerIndex) => {
            setChangeTarget({ draft: editingDraft, playerIndex });
          }}
          onBack={() => setEditingDraft(null)}
        />
      </SafeAreaView>
    );
  }

  // Screen: Finish Match
  if (finishTarget) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <FinishMatchScreen
          draft={finishTarget}
          playerMap={playerMap}
          onFinish={handleFinish}
          onBack={() => setFinishTarget(null)}
        />
      </SafeAreaView>
    );
  }

  // Screen: Auto Draft
  if (showAutoDraftModal) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <AutoDraftScreen
          draftCount={draftCount}
          setDraftCount={setDraftCount}
          shuffleMode={shuffleMode}
          setShuffleMode={setShuffleMode}
          selectedLevels={selectedLevels}
          setSelectedLevels={setSelectedLevels}
          onGenerate={handleAutoDraft}
          onBack={() => setShowAutoDraftModal(false)}
        />
      </SafeAreaView>
    );
  }

  // Screen: Select Players for New Draft
  if (showSelectModal) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <PlayerSelectionScreen
          title="Select 4 Players for Draft"
          players={draftablePlayers}
          maxSelect={4}
          onConfirm={handleCreateDraft}
          onBack={() => setShowSelectModal(false)}
        />
      </SafeAreaView>
    );
  }

  // Screen: Match History
  if (showHistory) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <MatchHistoryScreen
          drafts={drafts}
          courts={courts}
          playerMap={playerMap}
          onBack={() => setShowHistory(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center gap-3">
          <View className="size-12 rounded-2xl bg-court-deep/30 items-center justify-center">
            <MaterialCommunityIcons
              name="file-document-edit-outline"
              size={24}
              color={BadmintonPalette.court.lime}
            />
          </View>
          <View className="flex-1">
            <Text className="text-light-100 text-2xl font-bold">Draft</Text>
            <Text className="text-light-300 text-sm">
              Manage matches and drafts
            </Text>
          </View>
          {/* Share / Undo / Redo */}
          <View className="flex-row" style={{ gap: 4 }}>
            {drafts.length > 0 && (
              <TouchableOpacity
                onPress={handleShareSchedule}
                className="size-10 rounded-xl items-center justify-center bg-dark-200 border border-dark-100"
                accessibilityRole="button"
                accessibilityLabel="Share schedule"
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={18}
                  color={BadmintonPalette.text.secondary}
                />
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-row" style={{ gap: 4 }}>
            <TouchableOpacity
              onPress={handleUndo}
              disabled={undoStack.length === 0}
              className="size-10 rounded-xl items-center justify-center bg-dark-200 border border-dark-100"
              style={{ opacity: undoStack.length === 0 ? 0.3 : 1 }}
              accessibilityRole="button"
              accessibilityLabel="Undo"
            >
              <MaterialCommunityIcons
                name="undo"
                size={18}
                color={BadmintonPalette.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRedo}
              disabled={redoStack.length === 0}
              className="size-10 rounded-xl items-center justify-center bg-dark-200 border border-dark-100"
              style={{ opacity: redoStack.length === 0 ? 0.3 : 1 }}
              accessibilityRole="button"
              accessibilityLabel="Redo"
            >
              <MaterialCommunityIcons
                name="redo"
                size={18}
                color={BadmintonPalette.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 140 }}
      >
        {/* Stats Row */}
        <View className="bg-secondary border border-dark-100 rounded-2xl overflow-hidden">
          <View className="flex-row border-b border-dark-100">
            <View className="flex-1 p-3 items-center border-r border-dark-100">
              <Text
                className="text-2xl font-bold"
                style={{ color: BadmintonPalette.court.lime }}
              >
                {players.length}
              </Text>
              <Text
                className="text-xs"
                style={{ color: BadmintonPalette.text.muted }}
              >
                Players
              </Text>
            </View>
            <View className="flex-1 p-3 items-center border-r border-dark-100">
              <Text
                className="text-2xl font-bold"
                style={{ color: BadmintonPalette.status.waiting }}
              >
                {activeDrafts.length}
              </Text>
              <Text
                className="text-xs"
                style={{ color: BadmintonPalette.text.muted }}
              >
                Active
              </Text>
            </View>
            <View className="flex-1 p-3 items-center">
              <Text
                className="text-2xl font-bold"
                style={{ color: BadmintonPalette.accent.primary }}
              >
                {completedDrafts.length}
              </Text>
              <Text
                className="text-xs"
                style={{ color: BadmintonPalette.text.muted }}
              >
                Completed
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="p-4 gap-3">
            {/* Error */}
            {draftsError && (
              <View className="flex-row items-center p-3 rounded-xl bg-danger/10 border border-danger/30">
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={18}
                  color={BadmintonPalette.accent.danger}
                />
                <Text className="text-xs font-medium ml-2 flex-1 text-danger">
                  {draftsError}
                </Text>
                <TouchableOpacity onPress={() => dispatch(clearDraftsError())}>
                  <MaterialCommunityIcons
                    name="close"
                    size={18}
                    color={BadmintonPalette.accent.danger}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* RSVP Active Banner */}
            {isConfirmationActive && (
              <View className="flex-row items-center p-3 rounded-xl bg-success/10 border border-success/30" style={{ gap: 8 }}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={18}
                  color={BadmintonPalette.accent.success}
                />
                <Text className="text-xs font-medium flex-1" style={{ color: BadmintonPalette.accent.success }}>
                  RSVP active — {draftablePlayers.length} confirmed {draftablePlayers.length === 1 ? "player" : "players"} available
                </Text>
              </View>
            )}

            {/* Auto Draft */}
            {isAdmin && <TouchableOpacity
              onPress={() => {
                if (courts.length === 0) {
                  Alert.alert("No Courts Available", "Please add at least one court before creating drafts.");
                  return;
                }
                if (draftablePlayers.length < 4) {
                  Alert.alert("Not Enough Players", isConfirmationActive
                    ? "You need at least 4 confirmed players to auto-draft."
                    : "You need at least 4 players to auto-draft.");
                  return;
                }
                setShowAutoDraftModal(true);
              }}
              disabled={draftablePlayers.length < 4}
              className="flex-row items-center p-4 rounded-xl"
              style={{
                backgroundColor: BadmintonPalette.accent.primary,
                opacity: draftablePlayers.length < 4 ? 0.4 : 1,
              }}
              accessibilityRole="button"
              accessibilityLabel="Auto draft players"
            >
              <View
                className="size-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
              >
                <MaterialCommunityIcons
                  name="shuffle-variant"
                  size={22}
                  color={BadmintonPalette.bg.base}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: BadmintonPalette.bg.base }}
                >
                  Auto Draft
                </Text>
                <Text className="text-xs" style={{ color: "rgba(0,0,0,0.6)" }}>
                  Randomly generate match drafts
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={BadmintonPalette.bg.base}
              />
            </TouchableOpacity>}

            {/* New Draft */}
            {isAdmin && <TouchableOpacity
              onPress={() => {
                if (courts.length === 0) {
                  Alert.alert(
                    "No Courts Available",
                    "Please add at least one court before creating drafts.",
                  );
                  return;
                }
                setShowSelectModal(true);
              }}
              disabled={draftablePlayers.length < 4}
              className="flex-row items-center p-4 rounded-xl border border-dark-100"
              style={{
                backgroundColor: BadmintonPalette.bg.elevated,
                opacity: draftablePlayers.length < 4 ? 0.4 : 1,
              }}
              accessibilityRole="button"
              accessibilityLabel="Create new draft manually"
            >
              <View
                className="size-10 rounded-xl items-center justify-center mr-3"
                style={{
                  backgroundColor: `${BadmintonPalette.court.lime}20`,
                }}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={22}
                  color={BadmintonPalette.court.lime}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: BadmintonPalette.text.primary }}
                >
                  New Draft
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: BadmintonPalette.text.muted }}
                >
                  Select 4 players manually
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={BadmintonPalette.text.muted}
              />
            </TouchableOpacity>}

            {/* Match History */}
            {completedDrafts.length > 0 && (
              <TouchableOpacity
                onPress={() => setShowHistory(true)}
                className="flex-row items-center justify-center p-3 rounded-xl border border-accent/30"
                style={{ backgroundColor: `${BadmintonPalette.accent.primary}10` }}
                accessibilityRole="button"
                accessibilityLabel="View match history"
              >
                <MaterialCommunityIcons
                  name="history"
                  size={18}
                  color={BadmintonPalette.accent.primary}
                />
                <Text
                  className="text-sm font-bold ml-2"
                  style={{ color: BadmintonPalette.accent.primary }}
                >
                  Match History ({completedDrafts.length})
                </Text>
              </TouchableOpacity>
            )}

            {/* Reset */}
            {isAdmin && drafts.length > 0 && (
              <TouchableOpacity
                onPress={handleReset}
                className="flex-row items-center justify-center p-3 rounded-xl border border-danger/30"
                style={{ backgroundColor: `${BadmintonPalette.accent.danger}10` }}
                accessibilityRole="button"
                accessibilityLabel="Reset all drafts"
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={18}
                  color={BadmintonPalette.accent.danger}
                />
                <Text className="text-sm font-bold text-danger ml-2">
                  Reset All
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Draft List */}
        {drafts.length > 0 ? (
          <View style={{ gap: 12 }}>
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="file-document-outline"
                size={18}
                color={BadmintonPalette.court.lime}
              />
              <Text className="text-light-100 text-lg font-bold">
                Matches
              </Text>
              <Text className="text-light-300 text-sm ml-auto">
                {drafts.length} draft{drafts.length !== 1 ? "s" : ""}
              </Text>
            </View>

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
                {round.map((draft, indexInRound) => (
                  <DraftCard
                    key={draft.id}
                    draft={draft}
                    matchNumber={roundIndex * courtCount + indexInRound + 1}
                    playerMap={playerMap}
                    courts={courts}
                    balanceScore={balanceScores.get(draft.id)}
                    isRepeated={repeatedDraftIds.has(draft.id)}
                    isAdmin={isAdmin}
                    onEdit={handleEditDraft}
                    onFinish={handleFinishTarget}
                    onDelete={handleDeleteDraft}
                  />
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-secondary border border-dark-100 rounded-2xl p-8 items-center">
            <MaterialCommunityIcons
              name="file-document-outline"
              size={48}
              color={BadmintonPalette.text.muted}
            />
            <Text className="text-light-300 text-sm mt-3 text-center">
              No drafts yet{"\n"}Tap Auto Draft or New Draft to start
            </Text>
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
};

export default activity;
