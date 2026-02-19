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
import { FiEdit2, FiFile, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

export default function PlayersPage() {
  const { emailVerified } = useAuth();
  const dispatch = useAppDispatch();
  const players = useAppSelector((state) => state.players.items);
  const playersError = useAppSelector((state) => state.players.error);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);

  // Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<"file" | "paste">("file");
  const [isDragging, setIsDragging] = useState(false);
  const [importFileName, setImportFileName] = useState<string | null>(null);

  // Add player form state
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState<PlayerLevel>(PlayerLevel.BEGINNER);

  // Edit player form state
  const [editLevel, setEditLevel] = useState<PlayerLevel>(PlayerLevel.BEGINNER);
  const [editGameCount, setEditGameCount] = useState(0);

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

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

  const validLevels = new Set(Object.values(PlayerLevel));

  function parseCsv(text: string): { name: string; level: string }[] {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length === 0) return [];
    // Check if first line is a header
    const first = lines[0].toLowerCase().trim();
    const startIndex = first.includes("name") && first.includes("level") ? 1 : 0;
    return lines.slice(startIndex).map((line) => {
      const parts = line.split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
      return { name: parts[0] ?? "", level: parts[1] ?? "" };
    });
  }

  function handleImport() {
    setImportError(null);
    const trimmed = importJson.trim();
    if (!trimmed) return;

    let entries: { name: string; level: string }[];

    if (trimmed.startsWith("[")) {
      // JSON
      try {
        const data = JSON.parse(trimmed);
        if (!Array.isArray(data)) {
          setImportError("JSON must be an array of players.");
          return;
        }
        entries = data.map((e: Record<string, unknown>) => ({
          name: typeof e.name === "string" ? e.name : "",
          level: typeof e.level === "string" ? e.level : "",
        }));
      } catch {
        setImportError("Invalid JSON format.");
        return;
      }
    } else {
      // CSV
      entries = parseCsv(trimmed);
    }

    let imported = 0;
    let skipped = 0;
    for (const entry of entries) {
      const name = entry.name.trim();
      const level = entry.level.trim().toUpperCase();
      if (name.length < 3 || !validLevels.has(level as PlayerLevel)) {
        skipped++;
        continue;
      }
      dispatch(
        addPlayer({
          id: uuidv4(),
          name,
          level: level as PlayerLevel,
          maxPlayers: emailVerified ? undefined : UNVERIFIED_LIMITS.MAX_PLAYERS,
        }),
      );
      imported++;
    }
    if (imported === 0 && skipped > 0) {
      setImportError(`All ${skipped} entries were invalid. Check name (3+ chars) and level (BEGINNER, INTERMEDIATE, ADVANCED, PRO).`);
      return;
    }
    setImportJson("");
    setShowImportModal(false);
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setImportJson(text);
      setImportFileName(file.name);
      setImportError(null);
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".json") || file.name.endsWith(".csv"))) {
      handleImportFile(file);
    } else {
      setImportError("Please drop a .json or .csv file.");
    }
  }

  function openEdit(player: Player) {
    setEditLevel(player.level);
    setEditGameCount(player.gameCount);
    setEditingPlayer(player);
  }

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
            onClick={() => { setImportJson(""); setImportError(null); setImportFileName(null); setImportMode("file"); setShowImportModal(true); }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm border border-dark-100 text-light-200 hover:bg-dark-200"
          >
            <FiUpload size={14} />
            <span className="hidden sm:inline">Import</span>
          </button>
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

      {/* Import Players Modal */}
      <Modal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Players"
      >
        <div className="space-y-4">
          {/* Tab toggle */}
          <div className="flex bg-dark-200 rounded-lg p-0.5">
            <button
              onClick={() => setImportMode("file")}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${importMode === "file" ? "bg-dark-100 text-light-100" : "text-light-300 hover:text-light-200"}`}
            >
              File Upload
            </button>
            <button
              onClick={() => setImportMode("paste")}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${importMode === "paste" ? "bg-dark-100 text-light-100" : "text-light-300 hover:text-light-200"}`}
            >
              Paste Text
            </button>
          </div>

          {importMode === "file" ? (
            <>
              {/* Drag & drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? "border-accent bg-accent/5" : "border-dark-100 hover:border-light-300/30"}`}
              >
                <input
                  type="file"
                  accept=".json,.csv,application/json,text/csv"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportFile(file);
                  }}
                />
                {importFileName ? (
                  <div className="flex flex-col items-center gap-2">
                    <FiFile className="text-accent" size={28} />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-light-100">{importFileName}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setImportFileName(null); setImportJson(""); }}
                        className="p-0.5 rounded text-light-300 hover:text-danger"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                    <span className="text-[10px] text-accent">Ready to import</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FiUpload className={isDragging ? "text-accent" : "text-light-300"} size={28} />
                    <p className="text-sm text-light-200">
                      Drop a file here or <span className="text-accent font-semibold">browse</span>
                    </p>
                    <p className="text-[10px] text-light-300/60">Supports .json and .csv</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Paste textarea */}
              <textarea
                value={importJson}
                onChange={(e) => { setImportJson(e.target.value); setImportFileName(null); }}
                placeholder={'[\n  { "name": "Juan", "level": "BEGINNER" }\n]\n\nor\n\nname,level\nJuan,BEGINNER'}
                rows={7}
                autoFocus
                className="w-full bg-dark-200 border border-dark-100 rounded-xl px-4 py-3 text-sm text-light-100 placeholder:text-light-300/30 outline-none focus:border-accent/50 font-mono resize-none"
              />
            </>
          )}

          {/* Format hint */}
          <div className="flex gap-4 text-[10px] text-light-300/50">
            <span><span className="text-light-300">JSON:</span> {"[{name, level}]"}</span>
            <span><span className="text-light-300">CSV:</span> name,level</span>
            <span><span className="text-light-300">Levels:</span> BEGINNER, INTERMEDIATE, ADVANCED, PRO</span>
          </div>

          {/* Error */}
          {importError && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 flex items-start gap-2">
              <span className="text-danger text-xs flex-1">{importError}</span>
              <button onClick={() => setImportError(null)} className="text-danger/50 hover:text-danger shrink-0">
                <FiX size={12} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-1">
            <button
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 rounded-xl text-sm text-light-200 hover:bg-dark-200"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!importJson.trim()}
              className="px-4 py-2 rounded-xl text-sm bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Import Players
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
