"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Modal } from "@/components/Modal";
import { PlayerLevelBadge } from "@/components/PlayerLevelBadge";
import { PlayerLevelSelector } from "@/components/PlayerLevelSelector";
import { PlayerTrophyBadge } from "@/components/PlayerTrophyBadge";
import { useAuth } from "@/contexts/AuthContext";
import {
  addPlayer,
  clearPlayers,
  clearPlayersError,
  removePlayer,
  updatePlayerGameCount,
  updatePlayerLevel,
  useAppDispatch,
  useAppSelector,
} from "@badminton/store";
import { PlayerLevel, type Player } from "@badminton/types";
import { UNVERIFIED_LIMITS } from "@badminton/ui-shared";
import { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

export default function PlayersPage() {
  const { emailVerified } = useAuth();
  const dispatch = useAppDispatch();
  const players = useAppSelector((state) => state.players.items);
  const playersError = useAppSelector((state) => state.players.error);
  const courts = useAppSelector((state) => state.courts.items);
  const queue = useAppSelector((state) => state.queue.ids);

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);

  // Add player form state
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState<PlayerLevel>(PlayerLevel.BEGINNER);

  // Edit player form state
  const [editLevel, setEditLevel] = useState<PlayerLevel>(PlayerLevel.BEGINNER);
  const [editGameCount, setEditGameCount] = useState(0);

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  function getPlayerStatus(player: Player) {
    const court = courts.find((c) =>
      c.players.some((cp) => cp.id === player.id),
    );
    if (court) return { status: "in_game" as const, courtName: court.name };
    if (queue.includes(player.id)) return { status: "in_queue" as const };
    return { status: "bench" as const };
  }

  function handleAdd() {
    dispatch(
      addPlayer({
        id: uuidv4(),
        name: newName,
        level: newLevel,
        maxPlayers: emailVerified ? undefined : UNVERIFIED_LIMITS.MAX_PLAYERS,
      }),
    );
    setNewName("");
    setNewLevel(PlayerLevel.BEGINNER);
    setShowAddModal(false);
  }

  function handleEdit() {
    if (!editingPlayer) return;
    dispatch(updatePlayerLevel({ id: editingPlayer.id, level: editLevel }));
    dispatch(
      updatePlayerGameCount({ id: editingPlayer.id, gameCount: editGameCount }),
    );
    setEditingPlayer(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    dispatch(removePlayer(deleteTarget.id));
    setDeleteTarget(null);
  }

  function openEdit(player: Player) {
    setEditLevel(player.level);
    setEditGameCount(player.gameCount);
    setEditingPlayer(player);
  }

  const statusColors = {
    in_game: "text-danger",
    in_queue: "text-success",
    bench: "text-light-300",
  };
  const statusLabels = {
    in_game: "In Game",
    in_queue: "In Queue",
    bench: "Bench",
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Players</h1>
          <p className="text-light-300 text-sm mt-1">{players.length} total</p>
        </div>
        <div className="flex gap-2 sm:gap-3 shrink-0">
          {players.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm text-danger border border-danger/30 hover:bg-danger/10"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm bg-accent text-primary font-semibold hover:bg-accent/80"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Error */}
      {playersError && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 mb-4 flex justify-between items-center">
          <span>{playersError}</span>
          <button
            onClick={() => dispatch(clearPlayersError())}
            className="text-danger/60 hover:text-danger"
          >
            &times;
          </button>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search players..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-dark-200 border border-dark-100 rounded-xl px-4 py-2.5 text-sm text-light-100 placeholder:text-light-300 mb-6 outline-none focus:border-accent/50"
      />

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((player) => {
          const { status, courtName } = getPlayerStatus(player) as {
            status: "in_game" | "in_queue" | "bench";
            courtName?: string;
          };
          return (
            <div
              key={player.id}
              className="bg-secondary rounded-2xl border border-dark-100 p-4 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <PlayerLevelBadge level={player.level} size="md" />
                  <span className="font-semibold">{player.name}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(player)}
                    className="p-1.5 rounded-lg text-light-300 hover:text-accent hover:bg-accent/10 transition-colors"
                    title="Edit player"
                  >
                    <FiEdit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(player)}
                    className="p-1.5 rounded-lg text-light-300 hover:text-danger hover:bg-danger/10 transition-colors"
                    title="Delete player"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-light-300">
                    {player.gameCount}{" "}
                    {player.gameCount === 1 ? "game" : "games"}
                  </span>
                  <PlayerTrophyBadge trophies={player.trophies ?? 0} />
                </div>
                <span className={`text-xs font-medium ${statusColors[status]}`}>
                  {statusLabels[status]}
                  {courtName ? ` · ${courtName}` : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-light-300 py-12">
          {search
            ? "No players match your search"
            : "No players yet. Add some!"}
        </p>
      )}

      {/* Add Player Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Player"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Player name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-dark-200 border border-dark-100 rounded-xl px-4 py-2.5 text-sm text-light-100 placeholder:text-light-300 outline-none focus:border-accent/50"
            autoFocus
            onKeyDown={(e) =>
              e.key === "Enter" && newName.trim().length >= 3 && handleAdd()
            }
          />
          <div>
            <label className="text-sm text-light-200 mb-2 block">
              Skill Level
            </label>
            <PlayerLevelSelector value={newLevel} onChange={setNewLevel} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl text-light-200 hover:bg-dark-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={newName.trim().length < 3}
              className="px-4 py-2 rounded-xl bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Player Modal */}
      <Modal
        open={!!editingPlayer}
        onClose={() => setEditingPlayer(null)}
        title={`Edit ${editingPlayer?.name ?? ""}`}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-light-200 mb-2 block">
              Skill Level
            </label>
            <PlayerLevelSelector value={editLevel} onChange={setEditLevel} />
          </div>
          <div>
            <label className="text-sm text-light-200 mb-2 block">
              Game Count
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setEditGameCount(Math.max(0, editGameCount - 1))}
                className="w-10 h-10 rounded-xl bg-dark-200 text-light-100 text-xl hover:bg-dark-100"
              >
                -
              </button>
              <span className="text-2xl font-bold w-12 text-center">
                {editGameCount}
              </span>
              <button
                onClick={() => setEditGameCount(editGameCount + 1)}
                className="w-10 h-10 rounded-xl bg-dark-200 text-light-100 text-xl hover:bg-dark-100"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setEditingPlayer(null)}
              className="px-4 py-2 rounded-xl text-light-200 hover:bg-dark-200"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 rounded-xl bg-accent text-primary font-semibold hover:bg-accent/80"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Player"
        message={`Are you sure you want to delete ${deleteTarget?.name}?`}
        confirmLabel="Delete"
        danger
      />

      {/* Clear All Confirm */}
      <ConfirmDialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => dispatch(clearPlayers())}
        title="Clear All Players"
        message="This will remove all players. Are you sure?"
        confirmLabel="Clear All"
        danger
      />
    </div>
  );
}
