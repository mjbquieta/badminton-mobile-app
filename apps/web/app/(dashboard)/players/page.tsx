"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Modal } from "@/components/Modal";
import { PlayerLevelBadge } from "@/components/PlayerLevelBadge";
import { PlayerLevelSelector } from "@/components/PlayerLevelSelector";
import { PlayerTrophyBadge } from "@/components/PlayerTrophyBadge";
import { useAuth } from "@/contexts/AuthContext";
import { generatePin, generateSerialId } from "@/utils/confirmation-helpers";
import {
  createConfirmationDoc,
  deleteConfirmationDoc,
  subscribeToConfirmation,
  updateConfirmationEventDetails,
  updateConfirmationPlayers,
} from "@badminton/firebase";
import {
  addPlayer,
  clearPlayers,
  clearPlayersError,
  disableConfirmation,
  enableConfirmation,
  removePlayer,
  setEventDetails,
  setPlayerConfirmations,
  setPlayersActive,
  togglePlayerActive,
  updatePlayerGameCount,
  updatePlayerLevel,
  useAppDispatch,
  useAppSelector,
} from "@badminton/store";
import {
  PlayerLevel,
  type CostItem,
  type EventDetails,
  type Player,
  type PlayerConfirmation,
} from "@badminton/types";
import { UNVERIFIED_LIMITS } from "@badminton/ui-shared";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCheck,
  FiClipboard,
  FiClock,
  FiDollarSign,
  FiEdit2,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiFile,
  FiMoreVertical,
  FiPlus,
  FiShare2,
  FiTrash2,
  FiUpload,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

export default function PlayersPage() {
  const { user, emailVerified } = useAuth();
  const dispatch = useAppDispatch();
  const players = useAppSelector((state) => state.players.items);
  const playersError = useAppSelector((state) => state.players.error);
  const confirmation = useAppSelector((state) => state.confirmation);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "level" | "games" | "trophies">(
    "name",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);

  // Multi-select state
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Ellipsis menu state
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

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

  // Confirmation feature state
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showPinVisible, setShowPinVisible] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);

  // Event details form fields
  const [eventLocation, setEventLocation] = useState("");
  const [eventCourts, setEventCourts] = useState(1);
  const [eventDate, setEventDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventCourtCost, setEventCourtCost] = useState(0);
  const [eventAdditionalCosts, setEventAdditionalCosts] = useState<CostItem[]>(
    [],
  );
  const [eventNotes, setEventNotes] = useState("");

  const levelOrder: Record<PlayerLevel, number> = {
    [PlayerLevel.BEGINNER]: 0,
    [PlayerLevel.INTERMEDIATE]: 1,
    [PlayerLevel.ADVANCED]: 2,
    [PlayerLevel.PRO]: 3,
  };

  const activeCounts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    for (const p of players) {
      if (p.active ?? true) active++;
      else inactive++;
    }
    return { active, inactive };
  }, [players]);

  const filtered = useMemo(() => {
    const list = players.filter((p) => {
      const isActive = p.active ?? true;
      if (activeTab === "active" && !isActive) return false;
      if (activeTab === "inactive" && isActive) return false;
      return p.name.toLowerCase().includes(search.toLowerCase());
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "level":
          return dir * (levelOrder[a.level] - levelOrder[b.level]);
        case "games":
          return dir * (a.gameCount - b.gameCount);
        case "trophies":
          return dir * ((a.trophies ?? 0) - (b.trophies ?? 0));
        default:
          return 0;
      }
    });
  }, [players, search, sortBy, sortDir, activeTab]);

  // Build a map of player confirmation statuses
  const confirmationStatusMap = useMemo(() => {
    const map = new Map<string, PlayerConfirmation>();
    for (const pc of confirmation.playerConfirmations) {
      map.set(pc.playerId, pc);
    }
    return map;
  }, [confirmation.playerConfirmations]);

  // Subscribe to real-time confirmation updates when enabled
  const subscriptionRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!confirmation.meta.enabled || !confirmation.meta.serialId) {
      subscriptionRef.current?.();
      subscriptionRef.current = null;
      return;
    }

    const unsubscribe = subscribeToConfirmation(
      confirmation.meta.serialId,
      (doc) => {
        dispatch(setPlayerConfirmations(doc.playerConfirmations));
      },
      (err) => console.error("Confirmation subscription error:", err),
    );
    subscriptionRef.current = unsubscribe;
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmation.meta.enabled, confirmation.meta.serialId, dispatch]);

  // Sync player list changes to the public confirmation doc
  const prevPlayersRef = useRef<string>("");
  useEffect(() => {
    if (!confirmation.meta.enabled || !confirmation.meta.serialId) return;

    const playersKey = JSON.stringify(players.map((p) => p.id).sort());
    if (playersKey === prevPlayersRef.current) return;
    prevPlayersRef.current = playersKey;

    const existing = new Map(
      confirmation.playerConfirmations.map((pc) => [pc.playerId, pc]),
    );
    const updated: PlayerConfirmation[] = players.map((p) => {
      const existingPc = existing.get(p.id);
      return (
        existingPc ?? {
          playerId: p.id,
          playerName: p.name,
          playerLevel: p.level,
          status: "pending" as const,
        }
      );
    });

    if (
      JSON.stringify(updated) !==
      JSON.stringify(confirmation.playerConfirmations)
    ) {
      dispatch(setPlayerConfirmations(updated));
      updateConfirmationPlayers(confirmation.meta.serialId, updated).catch(
        console.error,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    players,
    confirmation.meta.enabled,
    confirmation.meta.serialId,
    dispatch,
  ]);

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
      updatePlayerGameCount({
        id: editingPlayer.id,
        gameCount: editGameCount,
      }),
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
    const first = lines[0].toLowerCase().trim();
    const startIndex =
      first.includes("name") && first.includes("level") ? 1 : 0;
    return lines.slice(startIndex).map((line) => {
      const parts = line
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""));
      return { name: parts[0] ?? "", level: parts[1] ?? "" };
    });
  }

  function handleImport() {
    setImportError(null);
    const trimmed = importJson.trim();
    if (!trimmed) return;

    let entries: { name: string; level: string }[];

    if (trimmed.startsWith("[")) {
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
      setImportError(
        `All ${skipped} entries were invalid. Check name (3+ chars) and level (BEGINNER, INTERMEDIATE, ADVANCED, PRO).`,
      );
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

  // --- Confirmation handlers ---
  function handleToggleConfirmation() {
    if (confirmation.meta.enabled) {
      setShowDisableConfirm(true);
    } else {
      // Reset form fields
      setEventLocation("");
      setEventCourts(1);
      setEventDate("");
      setEventStartTime("");
      setEventEndTime("");
      setEventCourtCost(0);
      setEventAdditionalCosts([]);
      setEventNotes("");
      setShowEventDetailsModal(true);
    }
  }

  async function handleSubmitEventDetails() {
    const serialId = generateSerialId();
    const pin = generatePin();
    const eventDetails: EventDetails = {
      location: eventLocation,
      courts: eventCourts,
      date: eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      courtCost: eventCourtCost,
      additionalCosts: eventAdditionalCosts.filter((c) => c.item.trim()),
      ...(eventNotes ? { notes: eventNotes } : {}),
    };

    const playerConfirmations: PlayerConfirmation[] = players.map((p) => ({
      playerId: p.id,
      playerName: p.name,
      playerLevel: p.level,
      status: "pending" as const,
    }));

    dispatch(enableConfirmation({ serialId, pin }));
    dispatch(setEventDetails(eventDetails));
    dispatch(setPlayerConfirmations(playerConfirmations));

    await createConfirmationDoc(
      serialId,
      user!.uid,
      pin,
      eventDetails,
      playerConfirmations,
    );

    setShowEventDetailsModal(false);
  }

  async function handleDisableConfirmation() {
    if (confirmation.meta.serialId) {
      await deleteConfirmationDoc(confirmation.meta.serialId);
    }
    dispatch(disableConfirmation());
    setShowDisableConfirm(false);
  }

  function handleCopyLink() {
    const link = `${window.location.origin}/confirm/${confirmation.meta.serialId}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  function handleOpenLink() {
    const link = `${window.location.origin}/confirm/${confirmation.meta.serialId}`;
    window.open(link, "_blank");
  }

  function handleCopyPin() {
    navigator.clipboard.writeText(confirmation.meta.pin);
    setPinCopied(true);
    setTimeout(() => setPinCopied(false), 2000);
  }

  function openEditEventDetails() {
    if (confirmation.eventDetails) {
      setEventLocation(confirmation.eventDetails.location);
      setEventCourts(confirmation.eventDetails.courts);
      setEventDate(confirmation.eventDetails.date);
      setEventStartTime(confirmation.eventDetails.startTime);
      setEventEndTime(confirmation.eventDetails.endTime);
      setEventCourtCost(confirmation.eventDetails.courtCost);
      setEventAdditionalCosts(confirmation.eventDetails.additionalCosts);
      setEventNotes(confirmation.eventDetails.notes ?? "");
    }
    setShowEditEventModal(true);
  }

  async function handleUpdateEventDetails() {
    const eventDetails: EventDetails = {
      location: eventLocation,
      courts: eventCourts,
      date: eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      courtCost: eventCourtCost,
      additionalCosts: eventAdditionalCosts.filter((c) => c.item.trim()),
      ...(eventNotes ? { notes: eventNotes } : {}),
    };

    dispatch(setEventDetails(eventDetails));
    if (confirmation.meta.serialId) {
      await updateConfirmationEventDetails(
        confirmation.meta.serialId,
        eventDetails,
      );
    }
    setShowEditEventModal(false);
  }

  const isEventFormValid =
    eventLocation.trim() && eventDate && eventStartTime && eventEndTime;

  // Confirmation stats
  const confirmedCount = confirmation.playerConfirmations.filter(
    (p) => p.status === "confirmed",
  ).length;
  const declinedCount = confirmation.playerConfirmations.filter(
    (p) => p.status === "declined",
  ).length;
  const pendingCount = confirmation.playerConfirmations.filter(
    (p) => p.status === "pending",
  ).length;

  // Cost calculations
  const totalCost = useMemo(() => {
    if (!confirmation.eventDetails) return 0;
    const addlTotal = confirmation.eventDetails.additionalCosts.reduce(
      (sum, c) => sum + c.cost,
      0,
    );
    return confirmation.eventDetails.courtCost + addlTotal;
  }, [confirmation.eventDetails]);

  const costPerPlayer = confirmedCount > 0 ? totalCost / confirmedCount : 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Players</h1>
          <p className="text-light-300 text-sm mt-1">{players.length} total</p>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Confirmation Toggle */}
          <div className="relative">
            <div
              className="animate-rainbow-spin rounded-xl p-[1.6px]"
              style={{
                background:
                  "conic-gradient(from var(--rainbow-angle, 0deg), #ff0000, #ff8800, #ffdd00, #00ff00, #0088ff, #8800ff, #ff0000)",
              }}
            >
              <button
                onClick={handleToggleConfirmation}
                className="flex items-center gap-2.5 bg-secondary rounded-[10px] px-3 py-2 cursor-pointer"
              >
                {/* Toggle switch */}
                <span
                  role="switch"
                  aria-checked={confirmation.meta.enabled}
                  aria-label="Toggle player RSVP"
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
                    confirmation.meta.enabled ? "bg-success" : "bg-dark-100"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      confirmation.meta.enabled
                        ? "translate-x-[18px]"
                        : "translate-x-1"
                    }`}
                  />
                </span>
                <span className="text-xs font-semibold text-light-200 whitespace-nowrap">
                  Player RSVP
                </span>
              </button>
            </div>
            {/* NEW badge */}
            {!confirmation.meta.enabled && (
              <span className="absolute -top-2 -right-2 bg-danger text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full -rotate-12 shadow-md pointer-events-none">
                NEW
              </span>
            )}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm bg-accent text-primary font-semibold hover:bg-accent/80 whitespace-nowrap"
          >
            + Add
          </button>
          {/* Ellipsis Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-xl border border-dark-100 text-light-200 hover:bg-dark-200 flex items-center justify-center"
            >
              <FiMoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-secondary border border-dark-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                {players.length > 0 && (
                  <button
                    onClick={() => {
                      setSelecting(!selecting);
                      setSelectedIds(new Set());
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-light-200 hover:bg-dark-200 text-left"
                  >
                    <FiCheck
                      size={14}
                      className={selecting ? "text-accent" : ""}
                    />
                    {selecting ? "Cancel Select" : "Select"}
                  </button>
                )}
                <button
                  onClick={() => {
                    setImportJson("");
                    setImportError(null);
                    setImportFileName(null);
                    setImportMode("file");
                    setShowImportModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-light-200 hover:bg-dark-200 text-left"
                >
                  <FiUpload size={14} />
                  Import
                </button>
                {players.length > 0 && (
                  <button
                    onClick={() => {
                      setShowClearConfirm(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 text-left"
                  >
                    <FiTrash2 size={14} />
                    Clear All
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RSVP Info Panel */}
      {confirmation.meta.enabled && (
        <div className="bg-secondary rounded-2xl border border-dark-100 p-4 sm:p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-light-200 uppercase tracking-wide">
              Player RSVP
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={openEditEventDetails}
                className="p-1.5 rounded-lg text-light-300 hover:text-accent hover:bg-accent/10 transition-colors"
                title="Edit event details"
              >
                <FiEdit2 size={16} />
              </button>
              <button
                onClick={() => setShowDisableConfirm(true)}
                className="p-1.5 rounded-lg text-light-300 hover:text-danger hover:bg-danger/10 transition-colors"
                title="Disable RSVP"
              >
                <FiXCircle size={16} />
              </button>
            </div>
          </div>

          {/* Public Link & PIN */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-dark-200 rounded-lg px-3 py-2 text-xs font-mono text-light-200 truncate">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/confirm/${confirmation.meta.serialId}`
                  : `/confirm/${confirmation.meta.serialId}`}
              </div>
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-lg border border-dark-100 text-light-300 hover:text-accent hover:border-accent/30 transition-colors"
                title="Copy link"
              >
                {linkCopied ? (
                  <FiCheck size={14} className="text-success" />
                ) : (
                  <FiClipboard size={14} />
                )}
              </button>
              <button
                onClick={handleOpenLink}
                className="p-2 rounded-lg border border-dark-100 text-light-300 hover:text-accent hover:border-accent/30 transition-colors"
                title="Open in new tab"
              >
                <FiExternalLink size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-light-300">PIN:</span>
              <span className="font-mono text-sm font-semibold tracking-wider">
                {showPinVisible ? confirmation.meta.pin : "********"}
              </span>
              <button
                onClick={() => setShowPinVisible(!showPinVisible)}
                className="p-1 rounded text-light-300 hover:text-light-100 transition-colors"
                title={showPinVisible ? "Hide PIN" : "Show PIN"}
              >
                {showPinVisible ? <FiEyeOff size={12} /> : <FiEye size={12} />}
              </button>
              <button
                onClick={handleCopyPin}
                className="p-1 rounded text-light-300 hover:text-accent transition-colors"
                title="Copy PIN"
              >
                {pinCopied ? (
                  <FiCheck size={12} className="text-success" />
                ) : (
                  <FiClipboard size={12} />
                )}
              </button>
            </div>
          </div>

          {/* How to Share */}
          <div className="bg-dark-200 rounded-xl p-3 flex items-start gap-2">
            <FiShare2 size={12} className="shrink-0 mt-0.5 text-accent" />
            <p className="text-xs text-light-300 leading-relaxed">
              Copy the link and PIN above and share it with your players via
              Messenger, Viber, WhatsApp, or any messaging app.
            </p>
          </div>

          {/* Attendance Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-light-200 uppercase tracking-wide">
                <FiUsers size={12} />
                Attendance
              </div>
              <span className="text-xs text-light-300">
                {confirmation.playerConfirmations.length} players
              </span>
            </div>

            {/* Stacked Progress Bar */}
            {confirmation.playerConfirmations.length > 0 && (
              <div className="space-y-2">
                <div className="flex h-3 rounded-full overflow-hidden bg-dark-200">
                  {confirmedCount > 0 && (
                    <div
                      className="bg-success transition-all duration-500 ease-out"
                      style={{
                        width: `${(confirmedCount / confirmation.playerConfirmations.length) * 100}%`,
                      }}
                    />
                  )}
                  {declinedCount > 0 && (
                    <div
                      className="bg-danger transition-all duration-500 ease-out"
                      style={{
                        width: `${(declinedCount / confirmation.playerConfirmations.length) * 100}%`,
                      }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-light-300">Going</span>
                    <span className="font-bold text-success">
                      {confirmedCount}
                    </span>
                    <span className="text-light-300/50">
                      (
                      {confirmation.playerConfirmations.length > 0
                        ? Math.round(
                            (confirmedCount /
                              confirmation.playerConfirmations.length) *
                              100,
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-danger" />
                    <span className="text-light-300">Not Going</span>
                    <span className="font-bold text-danger">
                      {declinedCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-dark-100" />
                    <span className="text-light-300">Pending</span>
                    <span className="font-bold text-light-300">
                      {pendingCount}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cost Breakdown */}
          {totalCost > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-light-200 uppercase tracking-wide">
                <FiDollarSign size={12} />
                Cost Breakdown
              </div>
              <div className="bg-dark-200 rounded-xl p-3 space-y-2 text-sm">
                {confirmation.eventDetails &&
                  confirmation.eventDetails.courtCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-light-300">Court</span>
                      <span className="font-medium">
                        ₱{confirmation.eventDetails.courtCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                {confirmation.eventDetails?.additionalCosts.map((c, i) => (
                  <div key={i}>
                    <div className="flex justify-between">
                      <span className="text-light-300">{c.item}</span>
                      <span className="font-medium">
                        ₱{c.cost.toLocaleString()}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-xs text-light-300/60 mt-0.5">
                        {c.description}
                      </p>
                    )}
                  </div>
                ))}
                <div className="border-t border-dark-100 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-accent">
                    ₱{totalCost.toLocaleString()}
                  </span>
                </div>
              </div>
              {confirmedCount > 0 && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-sm text-light-200">
                    Per player ({confirmedCount} going)
                  </span>
                  <span className="text-lg font-bold text-accent">
                    ₱{Math.ceil(costPerPlayer).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

      {/* Status Tabs */}
      <div className="flex gap-1 mb-4 bg-dark-200 rounded-xl p-1">
        {(["all", "active", "inactive"] as const).map((tab) => {
          const count =
            tab === "all"
              ? players.length
              : tab === "active"
                ? activeCounts.active
                : activeCounts.inactive;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "bg-secondary text-light-100 shadow-sm"
                  : "text-light-300 hover:text-light-200"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Search & Sort */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-dark-200 border border-dark-100 rounded-xl px-4 py-2.5 text-sm text-light-100 placeholder:text-light-300 outline-none focus:border-accent/50"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-dark-200 border border-dark-100 rounded-xl px-3 py-2.5 text-sm text-light-100 outline-none focus:border-accent/50 cursor-pointer"
        >
          <option value="name">Name</option>
          <option value="level">Level</option>
          <option value="games">Games</option>
          <option value="trophies">Trophies</option>
        </select>
        <button
          onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
          className="w-10 h-10 rounded-xl bg-dark-200 border border-dark-100 text-light-100 hover:bg-dark-100 flex items-center justify-center text-sm shrink-0"
          title={sortDir === "asc" ? "Ascending" : "Descending"}
        >
          {sortDir === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {/* Select All / Deselect All */}
      {selecting && filtered.length > 0 && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-light-300">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedIds(new Set(filtered.map((p) => p.id)))}
              className="text-xs text-accent hover:underline"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-light-300 hover:underline"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((player) => {
          const pc = confirmationStatusMap.get(player.id);
          const isConfirmed =
            !confirmation.meta.enabled || pc?.status === "confirmed";
          const isSelected = selectedIds.has(player.id);
          return (
            <div
              key={player.id}
              onClick={
                selecting
                  ? () =>
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(player.id)) next.delete(player.id);
                        else next.add(player.id);
                        return next;
                      })
                  : undefined
              }
              className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all ${
                selecting ? "cursor-pointer" : ""
              } ${
                selecting && isSelected
                  ? "bg-accent/10 border-accent/30 ring-1 ring-accent/20"
                  : !(player.active ?? true)
                    ? "bg-secondary/40 border-dark-100/50 opacity-50"
                    : isConfirmed
                      ? "bg-secondary border-dark-100"
                      : "bg-secondary/50 border-dark-100/50 opacity-50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {selecting && (
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-accent bg-accent"
                          : "border-dark-100"
                      }`}
                    >
                      {isSelected && (
                        <FiCheck size={12} className="text-primary" />
                      )}
                    </div>
                  )}
                  <PlayerLevelBadge level={player.level} size="md" />
                  <span className="font-semibold">{player.name}</span>
                  {confirmation.meta.enabled && pc && (
                    <ConfirmationStatusBadge status={pc.status} />
                  )}
                </div>
                {!selecting && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => dispatch(togglePlayerActive(player.id))}
                      className={`p-1.5 rounded-lg text-light-300 transition-colors ${
                        (player.active ?? true)
                          ? "hover:text-warning hover:bg-warning/10"
                          : "hover:text-success hover:bg-success/10"
                      }`}
                      title={
                        (player.active ?? true)
                          ? "Disable player"
                          : "Enable player"
                      }
                    >
                      {(player.active ?? true) ? (
                        <FiEyeOff size={14} />
                      ) : (
                        <FiEye size={14} />
                      )}
                    </button>
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
                )}
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

      {/* Selection Action Bar */}
      {selecting && selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:left-60 bg-secondary border-t border-dark-100 p-4 z-50 flex items-center justify-between gap-3">
          <span className="text-sm text-light-200 font-semibold">
            {selectedIds.size} player{selectedIds.size !== 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                dispatch(
                  setPlayersActive({
                    ids: [...selectedIds],
                    active: true,
                  }),
                );
                setSelectedIds(new Set());
                setSelecting(false);
              }}
              className="px-4 py-2 rounded-xl text-sm bg-success/10 text-success border border-success/30 hover:bg-success/20 font-semibold"
            >
              Set Active
            </button>
            <button
              onClick={() => {
                dispatch(
                  setPlayersActive({
                    ids: [...selectedIds],
                    active: false,
                  }),
                );
                setSelectedIds(new Set());
                setSelecting(false);
              }}
              className="px-4 py-2 rounded-xl text-sm bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20 font-semibold"
            >
              Set Inactive
            </button>
            <button
              onClick={() => {
                setSelectedIds(new Set());
                setSelecting(false);
              }}
              className="px-4 py-2 rounded-xl text-sm text-light-300 hover:text-light-100 hover:bg-dark-200"
            >
              Cancel
            </button>
          </div>
        </div>
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

      {/* Disable Confirmation Confirm */}
      <ConfirmDialog
        open={showDisableConfirm}
        onClose={() => setShowDisableConfirm(false)}
        onConfirm={handleDisableConfirmation}
        title="Disable Confirmation"
        message="This will delete the public confirmation page and remove all confirmation data. Are you sure?"
        confirmLabel="Disable"
        danger
      />

      {/* Event Details Modal (Enable) */}
      <Modal
        open={showEventDetailsModal}
        onClose={() => setShowEventDetailsModal(false)}
        title="Event Details"
        size="xl"
      >
        <EventDetailsForm
          location={eventLocation}
          courts={eventCourts}
          date={eventDate}
          startTime={eventStartTime}
          endTime={eventEndTime}
          courtCost={eventCourtCost}
          additionalCosts={eventAdditionalCosts}
          notes={eventNotes}
          onLocationChange={setEventLocation}
          onCourtsChange={setEventCourts}
          onDateChange={setEventDate}
          onStartTimeChange={setEventStartTime}
          onEndTimeChange={setEventEndTime}
          onCourtCostChange={setEventCourtCost}
          onAdditionalCostsChange={setEventAdditionalCosts}
          onNotesChange={setEventNotes}
          isValid={!!isEventFormValid}
          onCancel={() => setShowEventDetailsModal(false)}
          onSubmit={handleSubmitEventDetails}
          submitLabel="Enable & Generate Link"
        />
      </Modal>

      {/* Event Details Modal (Edit) */}
      <Modal
        open={showEditEventModal}
        onClose={() => setShowEditEventModal(false)}
        title="Edit Event Details"
        size="xl"
      >
        <EventDetailsForm
          location={eventLocation}
          courts={eventCourts}
          date={eventDate}
          startTime={eventStartTime}
          endTime={eventEndTime}
          courtCost={eventCourtCost}
          additionalCosts={eventAdditionalCosts}
          notes={eventNotes}
          onLocationChange={setEventLocation}
          onCourtsChange={setEventCourts}
          onDateChange={setEventDate}
          onStartTimeChange={setEventStartTime}
          onEndTimeChange={setEventEndTime}
          onCourtCostChange={setEventCourtCost}
          onAdditionalCostsChange={setEventAdditionalCosts}
          onNotesChange={setEventNotes}
          isValid={!!isEventFormValid}
          onCancel={() => setShowEditEventModal(false)}
          onSubmit={handleUpdateEventDetails}
          submitLabel="Save Changes"
        />
      </Modal>

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
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
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
                      <span className="text-sm font-semibold text-light-100">
                        {importFileName}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImportFileName(null);
                          setImportJson("");
                        }}
                        className="p-0.5 rounded text-light-300 hover:text-danger"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                    <span className="text-[10px] text-accent">
                      Ready to import
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FiUpload
                      className={isDragging ? "text-accent" : "text-light-300"}
                      size={28}
                    />
                    <p className="text-sm text-light-200">
                      Drop a file here or{" "}
                      <span className="text-accent font-semibold">browse</span>
                    </p>
                    <p className="text-[10px] text-light-300/60">
                      Supports .json and .csv
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <textarea
                value={importJson}
                onChange={(e) => {
                  setImportJson(e.target.value);
                  setImportFileName(null);
                }}
                placeholder={
                  '[\n  { "name": "Juan", "level": "BEGINNER" }\n]\n\nor\n\nname,level\nJuan,BEGINNER'
                }
                rows={7}
                autoFocus
                className="w-full bg-dark-200 border border-dark-100 rounded-xl px-4 py-3 text-sm text-light-100 placeholder:text-light-300/30 outline-none focus:border-accent/50 font-mono resize-none"
              />
            </>
          )}

          <div className="flex gap-4 text-[10px] text-light-300/50">
            <span>
              <span className="text-light-300">JSON:</span> {"[{name, level}]"}
            </span>
            <span>
              <span className="text-light-300">CSV:</span> name,level
            </span>
            <span>
              <span className="text-light-300">Levels:</span> BEGINNER,
              INTERMEDIATE, ADVANCED, PRO
            </span>
          </div>

          {importError && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 flex items-start gap-2">
              <span className="text-danger text-xs flex-1">{importError}</span>
              <button
                onClick={() => setImportError(null)}
                className="text-danger/50 hover:text-danger shrink-0"
              >
                <FiX size={12} />
              </button>
            </div>
          )}

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

function ConfirmationStatusBadge({
  status,
}: {
  status: "pending" | "confirmed" | "declined";
}) {
  if (status === "confirmed") {
    return (
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-success/20"
        title="Confirmed"
      >
        <FiCheck size={10} className="text-success" />
      </span>
    );
  }
  if (status === "declined") {
    return (
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-danger/20"
        title="Declined"
      >
        <FiX size={10} className="text-danger" />
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-light-300/20"
      title="Pending"
    >
      <FiClock size={10} className="text-light-300" />
    </span>
  );
}

function EventDetailsForm({
  location,
  courts,
  date,
  startTime,
  endTime,
  courtCost,
  additionalCosts,
  notes,
  onLocationChange,
  onCourtsChange,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onCourtCostChange,
  onAdditionalCostsChange,
  onNotesChange,
  isValid,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  location: string;
  courts: number;
  date: string;
  startTime: string;
  endTime: string;
  courtCost: number;
  additionalCosts: CostItem[];
  notes: string;
  onLocationChange: (v: string) => void;
  onCourtsChange: (v: number) => void;
  onDateChange: (v: string) => void;
  onStartTimeChange: (v: string) => void;
  onEndTimeChange: (v: string) => void;
  onCourtCostChange: (v: number) => void;
  onAdditionalCostsChange: (v: CostItem[]) => void;
  onNotesChange: (v: string) => void;
  isValid: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
}) {
  const inputClass =
    "w-full bg-dark-200 border border-dark-100 rounded-xl px-4 py-2.5 text-sm text-light-100 placeholder:text-light-300 outline-none focus:border-accent/50";

  function addCostItem() {
    onAdditionalCostsChange([
      ...additionalCosts,
      { item: "", description: "", cost: 0 },
    ]);
  }

  function updateCostItem(
    index: number,
    field: "item" | "description" | "cost",
    value: string | number,
  ) {
    const updated = [...additionalCosts];
    updated[index] = { ...updated[index], [field]: value };
    onAdditionalCostsChange(updated);
  }

  function removeCostItem(index: number) {
    onAdditionalCostsChange(additionalCosts.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-xs text-light-200 leading-relaxed">
        This will generate a public link you can share with players so they can
        confirm or decline attendance before you start drafting. Fill in the
        event details below they will be shown on the RSVP page.
      </div>

      {/* Two-column layout: Event Details | Costs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Left: Event Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-light-300 uppercase tracking-wide">
            Event Details
          </h3>
          <div>
            <label className="text-sm text-light-200 mb-1.5 block">
              Location <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. City Sports Center"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className={inputClass}
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm text-light-200 mb-1.5 block">
              Courts Reserved
            </label>
            <input
              type="number"
              min={1}
              value={courts}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1) onCourtsChange(val);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-light-200 mb-1.5 block">
              Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-light-200 mb-1.5 block">
                Start Time <span className="text-danger">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => onStartTimeChange(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm text-light-200 mb-1.5 block">
                End Time <span className="text-danger">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => onEndTimeChange(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Right: Costs */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-light-300 uppercase tracking-wide">
            Costs
          </h3>
          <div>
            <label className="text-sm text-light-200 mb-1.5 block">
              Court Cost
            </label>
            <input
              type="number"
              min={0}
              value={courtCost || ""}
              placeholder="0"
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onCourtCostChange(isNaN(val) ? 0 : val);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-light-200 mb-1.5 block">
              Additional Costs
            </label>
            <div className="space-y-3">
              {additionalCosts.map((costItem, i) => (
                <div
                  key={i}
                  className="bg-dark-200 rounded-xl p-3 space-y-2 relative"
                >
                  <button
                    onClick={() => removeCostItem(i)}
                    className="absolute top-2 right-2 p-1 rounded-lg text-light-300 hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                  <div className="flex items-center gap-2 pr-8">
                    <input
                      type="text"
                      placeholder="e.g. Shuttlecocks"
                      value={costItem.item}
                      onChange={(e) =>
                        updateCostItem(i, "item", e.target.value)
                      }
                      className="flex-1 bg-dark-300 border border-dark-100 rounded-lg px-3 py-2 text-sm text-light-100 placeholder:text-light-300 outline-none focus:border-accent/50"
                    />
                    <input
                      type="number"
                      min={0}
                      placeholder="Cost"
                      value={costItem.cost || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        updateCostItem(i, "cost", isNaN(val) ? 0 : val);
                      }}
                      className="w-24 bg-dark-300 border border-dark-100 rounded-lg px-3 py-2 text-sm text-light-100 placeholder:text-light-300 outline-none focus:border-accent/50"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={costItem.description ?? ""}
                    onChange={(e) =>
                      updateCostItem(i, "description", e.target.value)
                    }
                    className="w-full bg-dark-300 border border-dark-100 rounded-lg px-3 py-2 text-xs text-light-200 placeholder:text-light-300/40 outline-none focus:border-accent/50"
                  />
                </div>
              ))}
              <button
                onClick={addCostItem}
                className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors py-1"
              >
                <FiPlus size={12} />
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dark-100" />

      {/* Notes */}
      <div>
        <label className="text-sm text-light-200 mb-1.5 block">
          Notes (optional)
        </label>
        <textarea
          placeholder="Any extra info for players..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm text-light-200 hover:bg-dark-200"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={!isValid}
          className="px-4 py-2 rounded-xl text-sm bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
