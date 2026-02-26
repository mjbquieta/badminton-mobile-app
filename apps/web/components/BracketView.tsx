"use client";

import type { TournamentMatch, Player } from "@badminton/types";
import { PlayerAvatar } from "./PlayerAvatar";

type BracketViewProps = {
  matches: TournamentMatch[];
  playerMap: Map<string, Player>;
  /** For doubles: maps team IDs to player ID pairs */
  teams?: Record<string, string[]>;
  onMatchClick?: (match: TournamentMatch) => void;
  /** Setup mode: allow clicking participants to swap them */
  editable?: boolean;
  /** Currently selected participant for swapping */
  selectedParticipant?: string | null;
  /** Called when a participant is clicked in editable mode */
  onParticipantClick?: (participantId: string) => void;
};

export function BracketView({
  matches,
  playerMap,
  teams,
  onMatchClick,
  editable,
  selectedParticipant,
  onParticipantClick,
}: BracketViewProps) {
  const maxRound = Math.max(0, ...matches.map((m) => m.round));
  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1);

  const roundLabels = rounds.map((r) => {
    if (r === maxRound) return "Final";
    if (r === maxRound - 1) return "Semifinals";
    if (r === maxRound - 2) return "Quarterfinals";
    return `Round ${r}`;
  });

  // Filter out empty padding matches (both slots empty) from Round 1
  const visibleMatches = matches.filter(
    (m) => m.round !== 1 || m.playerA || m.playerB,
  );

  // Use visible first round match count for consistent height across all round columns
  const firstRoundCount = visibleMatches.filter((m) => m.round === 1).length;
  const bracketHeight = Math.max(firstRoundCount * 88, 120);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max px-2">
        {rounds.map((round, roundIdx) => {
          const roundMatches = visibleMatches
            .filter((m) => m.round === round)
            .sort((a, b) => a.position - b.position);

          return (
            <div key={round} className="flex flex-col items-center min-w-[200px]">
              <h3 className="text-xs font-semibold text-light-300 mb-3 uppercase tracking-wider">
                {roundLabels[roundIdx]}
              </h3>
              <div
                className="flex flex-col justify-around flex-1 gap-2"
                style={{ minHeight: bracketHeight }}
              >
                {roundMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    playerMap={playerMap}
                    teams={teams}
                    onClick={!editable && onMatchClick ? () => onMatchClick(match) : undefined}
                    editable={editable}
                    selectedParticipant={selectedParticipant}
                    onParticipantClick={onParticipantClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchCard({
  match,
  playerMap,
  teams,
  onClick,
  editable,
  selectedParticipant,
  onParticipantClick,
}: {
  match: TournamentMatch;
  playerMap: Map<string, Player>;
  teams?: Record<string, string[]>;
  onClick?: () => void;
  editable?: boolean;
  selectedParticipant?: string | null;
  onParticipantClick?: (participantId: string) => void;
}) {
  const isReady = match.status === "ready";
  const isCompleted = match.status === "completed";
  const isByeRound = match.round === 1;

  // In editable mode, only Round 1 participants are clickable (those are the seed positions)
  const canEditA = editable && match.round === 1 && !!match.playerA;
  const canEditB = editable && match.round === 1 && !!match.playerB;

  return (
    <div
      className={`rounded-xl border p-2 min-w-[190px] text-left transition-all ${
        editable
          ? "bg-secondary border-dashed border-dark-100"
          : isCompleted
            ? "bg-success/5 border-success/20"
            : isReady
              ? "bg-secondary border-accent/30 hover:border-accent cursor-pointer"
              : "bg-secondary border-dark-100 opacity-60"
      }`}
      onClick={!editable ? onClick : undefined}
      role={!editable && isReady ? "button" : undefined}
    >
      <ParticipantSlot
        participantId={match.playerA}
        playerMap={playerMap}
        teams={teams}
        score={match.scoreA}
        isWinner={isCompleted && match.winner === match.playerA}
        emptyLabel={isByeRound && !match.playerA ? "BYE" : "TBD"}
        clickable={canEditA}
        selected={selectedParticipant === match.playerA}
        onSelect={canEditA && onParticipantClick ? () => onParticipantClick(match.playerA!) : undefined}
      />
      <div className="border-t border-dark-100 my-1" />
      <ParticipantSlot
        participantId={match.playerB}
        playerMap={playerMap}
        teams={teams}
        score={match.scoreB}
        isWinner={isCompleted && match.winner === match.playerB}
        emptyLabel={isByeRound && !match.playerB ? "BYE" : "TBD"}
        clickable={canEditB}
        selected={selectedParticipant === match.playerB}
        onSelect={canEditB && onParticipantClick ? () => onParticipantClick(match.playerB!) : undefined}
      />
    </div>
  );
}

function ParticipantSlot({
  participantId,
  playerMap,
  teams,
  score,
  isWinner,
  emptyLabel,
  clickable,
  selected,
  onSelect,
}: {
  participantId?: string;
  playerMap: Map<string, Player>;
  teams?: Record<string, string[]>;
  score?: number;
  isWinner: boolean;
  emptyLabel: string;
  clickable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const wrapperClass = `flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
    selected
      ? "bg-accent/15 ring-1 ring-accent"
      : isWinner
        ? "bg-success/10"
        : clickable
          ? "hover:bg-dark-200/40 cursor-pointer"
          : ""
  }`;

  // No participant yet
  if (!participantId) {
    return (
      <div className={wrapperClass}>
        <span className={`text-xs text-light-300/40 ${emptyLabel === "TBD" ? "italic" : ""}`}>
          {emptyLabel}
        </span>
      </div>
    );
  }

  // Doubles: participantId is a team ID
  const teamPlayerIds = teams?.[participantId];
  if (teamPlayerIds) {
    const teamPlayers = teamPlayerIds.map((pid) => playerMap.get(pid)).filter(Boolean) as Player[];
    return (
      <div className={wrapperClass} onClick={onSelect} role={clickable ? "button" : undefined}>
        <div className="flex -space-x-1.5 shrink-0">
          {teamPlayers.map((p) => (
            <PlayerAvatar key={p.id} player={p} size="sm" />
          ))}
        </div>
        <span
          className={`text-xs flex-1 truncate ${
            selected ? "text-accent font-semibold" : isWinner ? "text-success font-semibold" : "text-light-100"
          }`}
        >
          {teamPlayers.map((p) => p.name).join(" & ")}
        </span>
        {score !== undefined && (
          <span className={`text-xs tabular-nums ${isWinner ? "text-success font-bold" : "text-light-300"}`}>
            {score}
          </span>
        )}
      </div>
    );
  }

  // Singles: participantId is a player ID
  const player = playerMap.get(participantId);
  if (!player) {
    return (
      <div className={wrapperClass}>
        <span className="text-xs text-light-300 italic">TBD</span>
      </div>
    );
  }

  return (
    <div className={wrapperClass} onClick={onSelect} role={clickable ? "button" : undefined}>
      <PlayerAvatar player={player} size="sm" />
      <span
        className={`text-xs flex-1 truncate ${
          selected ? "text-accent font-semibold" : isWinner ? "text-success font-semibold" : "text-light-100"
        }`}
      >
        {player.name}
      </span>
      {score !== undefined && (
        <span className={`text-xs tabular-nums ${isWinner ? "text-success font-bold" : "text-light-300"}`}>
          {score}
        </span>
      )}
    </div>
  );
}
