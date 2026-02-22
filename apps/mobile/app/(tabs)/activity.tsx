import AutoDraftScreen from "@/components/activity/AutoDraftScreen";
import EditDraftScreen from "@/components/activity/EditDraftScreen";
import FinishMatchScreen from "@/components/activity/FinishMatchScreen";
import PlayerSelectionScreen from "@/components/activity/PlayerSelectionScreen";
import ConfirmationAlert from "@/components/ConfirmationAlert";
import PlayerTag from "@/components/PlayerTag";
import { useToast } from "@/components/Toast";
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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
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
	onEdit: (draft: Draft) => void;
	onFinish: (draft: Draft) => void;
	onDelete: (draft: Draft, matchNumber: number) => void;
};

const DraftCard = React.memo(function DraftCard({
	draft,
	matchNumber,
	playerMap,
	courts,
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
				</View>
				{draft.finished ? (
					<View className="px-2 py-1 rounded-full bg-accent/15">
						<Text className="text-xs font-bold" style={{ color: BadmintonPalette.accent.primary }}>
							FINISHED
						</Text>
					</View>
				) : (
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
				)}
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
								name={p.name}
								level={p.level}
								gameCount={p.gameCount}
							/>
						))}
					</View>

					{/* VS */}
					<View className="px-3">
						<Text className="text-xs font-bold text-danger uppercase">
							vs
						</Text>
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

  function handleCreateDraft(selectedIds: string[]) {
    if (selectedIds.length !== 4) return;
    const draftId = uuidv4();
    dispatch(addDraft({ id: draftId, playerIds: selectedIds }));
    if (courts.length > 0) {
      const courtIndex = drafts.length % courts.length;
      dispatch(updateDraftCourt({ id: draftId, courtId: courts[courtIndex].id }));
    }
    showToast({ type: "success", message: "Draft created" });
    setShowSelectModal(false);
  }

  function handleFinish(winner: "A" | "B") {
    if (!finishTarget || finishTarget.finished) return;
    const half = Math.ceil(finishTarget.playerIds.length / 2);
    const winnerIds =
      winner === "A"
        ? finishTarget.playerIds.slice(0, half)
        : finishTarget.playerIds.slice(half);
    dispatch(incrementPlayersGameCount(finishTarget.playerIds));
    dispatch(incrementPlayersTrophies(winnerIds));
    dispatch(finishDraft({ id: finishTarget.id, winner }));
    showToast({ type: "success", message: "Match finished" });
    setFinishTarget(null);
  }

  // Compute C(n, k)
  function comb(n: number, k: number): number {
    if (k > n) return 0;
    let result = 1;
    for (let i = 0; i < k; i++) result = (result * (n - i)) / (i + 1);
    return Math.round(result);
  }

  function handleAutoDraft(mode: "balanced" | "random" | "skill-match", levels: Set<PlayerLevel>) {
    const usedCombos = new Set(
      drafts.map((d) => [...d.playerIds].sort().join(",")),
    );

    function shuffle<T>(arr: T[]): T[] {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function generateCombos(pool: string[], size: number): string[][] {
      const combos: string[][] = [];
      function build(start: number, current: string[]) {
        if (current.length === size) {
          combos.push([...current]);
          return;
        }
        for (let i = start; i < pool.length; i++) {
          current.push(pool[i]);
          build(i + 1, current);
          current.pop();
        }
      }
      build(0, []);
      return shuffle(combos);
    }

    function getComboSize(draftIndex: number): number {
      if (courts.length === 0) return 4;
      const courtIndex = (drafts.length + draftIndex) % courts.length;
      return courts[courtIndex].isSingle ? 2 : 4;
    }

    const pendingDrafts: { id: string; playerIds: string[]; courtId?: string }[] = [];

    function commitDraft(combo: string[], draftIndex: number) {
      shuffle(combo);
      const key = [...combo].sort().join(",");
      usedCombos.add(key);
      const draftId = uuidv4();
      const courtId = courts.length > 0
        ? courts[(drafts.length + draftIndex) % courts.length].id
        : undefined;
      pendingDrafts.push({ id: draftId, playerIds: combo, courtId });
    }

    const roundSize = courts.length > 0 ? courts.length : Infinity;
    const usedInRound = new Set<string>();
    let created = 0;

    if (mode === "skill-match") {
      const filteredIds = draftablePlayers
        .filter((p) => levels.has(p.level))
        .map((p) => p.id);

      if (filteredIds.length < 2) {
        showToast({ type: "info", message: "Not enough players with selected levels" });
        setShowAutoDraftModal(false);
        return;
      }

      const maxCombos = Math.min(draftCount, comb(filteredIds.length, 2) + comb(filteredIds.length, 4));
      const counts = new Map(filteredIds.map((id) => [id, 0]));

      for (let i = 0; i < maxCombos; i++) {
        if (i % roundSize === 0) usedInRound.clear();
        const comboSize = getComboSize(i);

        const sorted = [...filteredIds].sort(
          (a, b) => counts.get(a)! - counts.get(b)!,
        );
        let idx = 0;
        while (idx < sorted.length) {
          const count = counts.get(sorted[idx])!;
          let end = idx;
          while (end < sorted.length && counts.get(sorted[end])! === count) end++;
          const tier = sorted.slice(idx, end);
          shuffle(tier);
          for (let t = 0; t < tier.length; t++) sorted[idx + t] = tier[t];
          idx = end;
        }

        let found = false;
        for (let poolSize = comboSize; poolSize <= sorted.length && !found; poolSize++) {
          const pool = sorted.slice(0, poolSize);
          const combos = generateCombos(pool, comboSize);
          for (const combo of combos) {
            if (combo.some((id) => usedInRound.has(id))) continue;
            const key = [...combo].sort().join(",");
            if (usedCombos.has(key)) continue;
            for (const id of combo) usedInRound.add(id);
            commitDraft(combo, i);
            for (const id of combo) counts.set(id, counts.get(id)! + 1);
            found = true;
            created++;
            break;
          }
        }
        if (!found) {
          usedCombos.clear();
          for (let poolSize = comboSize; poolSize <= sorted.length && !found; poolSize++) {
            const pool = sorted.slice(0, poolSize);
            const combos = generateCombos(pool, comboSize);
            for (const combo of combos) {
              if (combo.some((id) => usedInRound.has(id))) continue;
              for (const id of combo) usedInRound.add(id);
              commitDraft(combo, i);
              for (const id of combo) counts.set(id, counts.get(id)! + 1);
              found = true;
              created++;
              break;
            }
          }
        }
        if (!found) {
          if (i % roundSize === 0) break;
          const nextRound = (Math.floor(i / roundSize) + 1) * roundSize;
          i = nextRound - 1;
        }
      }
    } else {
      const ids = draftablePlayers.map((p) => p.id);
      if (ids.length < 2) {
        showToast({ type: "info", message: "Not enough players" });
        setShowAutoDraftModal(false);
        return;
      }

      const maxCombos = Math.min(draftCount, comb(ids.length, 2) + comb(ids.length, 4));
      const counts = new Map(ids.map((id) => [id, 0]));

      for (let i = 0; i < maxCombos; i++) {
        if (i % roundSize === 0) usedInRound.clear();
        const comboSize = getComboSize(i);

        let sorted: string[];
        if (mode === "random") {
          sorted = shuffle([...ids]);
        } else {
          sorted = [...ids].sort(
            (a, b) => counts.get(a)! - counts.get(b)!,
          );
          let idx = 0;
          while (idx < sorted.length) {
            const count = counts.get(sorted[idx])!;
            let end = idx;
            while (end < sorted.length && counts.get(sorted[end])! === count) end++;
            const tier = sorted.slice(idx, end);
            shuffle(tier);
            for (let t = 0; t < tier.length; t++) sorted[idx + t] = tier[t];
            idx = end;
          }
        }

        let found = false;
        for (let poolSize = comboSize; poolSize <= sorted.length && !found; poolSize++) {
          const pool = sorted.slice(0, poolSize);
          const combos = generateCombos(pool, comboSize);
          for (const combo of combos) {
            if (combo.some((id) => usedInRound.has(id))) continue;
            const key = [...combo].sort().join(",");
            if (usedCombos.has(key)) continue;
            for (const id of combo) usedInRound.add(id);
            commitDraft(combo, i);
            for (const id of combo) counts.set(id, counts.get(id)! + 1);
            found = true;
            created++;
            break;
          }
        }
        if (!found) {
          usedCombos.clear();
          for (let poolSize = comboSize; poolSize <= sorted.length && !found; poolSize++) {
            const pool = sorted.slice(0, poolSize);
            const combos = generateCombos(pool, comboSize);
            for (const combo of combos) {
              if (combo.some((id) => usedInRound.has(id))) continue;
              for (const id of combo) usedInRound.add(id);
              commitDraft(combo, i);
              for (const id of combo) counts.set(id, counts.get(id)! + 1);
              found = true;
              created++;
              break;
            }
          }
        }
        if (!found) {
          if (i % roundSize === 0) break;
          const nextRound = (Math.floor(i / roundSize) + 1) * roundSize;
          i = nextRound - 1;
        }
      }
    }

    if (pendingDrafts.length > 0) {
      dispatch(addDraftsBatch(pendingDrafts));
    }

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
            <TouchableOpacity
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
            </TouchableOpacity>

            {/* New Draft */}
            <TouchableOpacity
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
            </TouchableOpacity>

            {/* Reset */}
            {drafts.length > 0 && (
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
