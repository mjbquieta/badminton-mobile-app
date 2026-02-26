"use client";

import type { SwissStanding, Player } from "@badminton/types";
import { PlayerAvatar } from "./PlayerAvatar";

type SwissStandingsTableProps = {
  standings: SwissStanding[];
  playerMap: Map<string, Player>;
  teams?: Record<string, string[]>;
  /** How many top participants qualify for playoffs */
  playoffCutoff?: number;
};

export function SwissStandingsTable({
  standings,
  playerMap,
  teams,
  playoffCutoff = 4,
}: SwissStandingsTableProps) {
  const getParticipantName = (id: string): string => {
    if (teams?.[id]) {
      return teams[id].map((pid) => playerMap.get(pid)?.name ?? "?").join(" & ");
    }
    return playerMap.get(id)?.name ?? "Unknown";
  };

  const getParticipantAvatars = (id: string) => {
    if (teams?.[id]) {
      const teamPlayers = teams[id]
        .map((pid) => playerMap.get(pid))
        .filter(Boolean) as Player[];
      return (
        <div className="flex -space-x-1.5 shrink-0">
          {teamPlayers.map((p) => (
            <PlayerAvatar key={p.id} player={p} size="sm" />
          ))}
        </div>
      );
    }
    const player = playerMap.get(id);
    return player ? <PlayerAvatar player={player} size="sm" /> : null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-light-300 border-b border-dark-100">
            <th className="text-left py-2 px-2 font-medium">#</th>
            <th className="text-left py-2 px-2 font-medium">Team</th>
            <th className="text-center py-2 px-1 font-medium">GP</th>
            <th className="text-center py-2 px-1 font-medium">W</th>
            <th className="text-center py-2 px-1 font-medium">L</th>
            <th className="text-center py-2 px-1 font-medium">PF</th>
            <th className="text-center py-2 px-1 font-medium">PA</th>
            <th className="text-center py-2 px-1 font-medium">PD</th>
            <th className="text-center py-2 px-1 font-medium">MP</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => {
            const isQualified = s.rank <= playoffCutoff;
            return (
              <tr
                key={s.participantId}
                className={`border-b border-dark-100/50 ${
                  isQualified ? "bg-accent/5" : ""
                }`}
              >
                <td className="py-2 px-2">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                      isQualified
                        ? "bg-accent/20 text-accent"
                        : "text-light-300"
                    }`}
                  >
                    {s.rank}
                  </span>
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    {getParticipantAvatars(s.participantId)}
                    <span
                      className={`truncate max-w-[140px] ${
                        isQualified
                          ? "text-light-100 font-medium"
                          : "text-light-200"
                      }`}
                    >
                      {getParticipantName(s.participantId)}
                    </span>
                  </div>
                </td>
                <td className="text-center py-2 px-1 text-light-300">{s.gamesPlayed}</td>
                <td className="text-center py-2 px-1 text-success font-medium">{s.wins}</td>
                <td className="text-center py-2 px-1 text-danger font-medium">{s.losses}</td>
                <td className="text-center py-2 px-1 text-light-200">{s.pointsFor}</td>
                <td className="text-center py-2 px-1 text-light-300">{s.pointsAgainst}</td>
                <td className="text-center py-2 px-1">
                  <span
                    className={
                      s.pointDifferential > 0
                        ? "text-success"
                        : s.pointDifferential < 0
                          ? "text-danger"
                          : "text-light-300"
                    }
                  >
                    {s.pointDifferential > 0 ? "+" : ""}
                    {s.pointDifferential}
                  </span>
                </td>
                <td className="text-center py-2 px-1 text-accent font-bold">{s.matchPoints}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {standings.length > 0 && (
        <p className="text-[10px] text-light-300 mt-2 px-2">
          Top {playoffCutoff} advance to playoffs
        </p>
      )}
    </div>
  );
}
