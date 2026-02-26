"use client";

import { Modal } from "@/components/Modal";
import type { Draft, Player } from "@badminton/types";
import { useState } from "react";
import { FiCheck, FiClipboard, FiPrinter } from "react-icons/fi";

type Props = {
  open: boolean;
  onClose: () => void;
  drafts: Draft[];
  courts: { id: string; name: string }[];
  resolvePlayer: (id: string) => Player | undefined;
  courtCount: number;
};

export function ExportScheduleModal({
  open,
  onClose,
  drafts,
  courts,
  resolvePlayer,
  courtCount,
}: Props) {
  const [copied, setCopied] = useState(false);

  function generateText(): string {
    const lines: string[] = ["Match Schedule", "=".repeat(40), ""];
    const courtMap = new Map(courts.map((c) => [c.id, c.name]));

    for (let i = 0; i < drafts.length; i += courtCount) {
      const setNum = Math.floor(i / courtCount) + 1;
      lines.push(`--- Set ${setNum} ---`);

      const round = drafts.slice(i, i + courtCount);
      round.forEach((draft, j) => {
        const matchNum = i + j + 1;
        const half = Math.ceil(draft.playerIds.length / 2);
        const teamA = draft.playerIds
          .slice(0, half)
          .map((id) => resolvePlayer(id)?.name ?? "?")
          .join(" & ");
        const teamB = draft.playerIds
          .slice(half)
          .map((id) => resolvePlayer(id)?.name ?? "?")
          .join(" & ");
        const court = draft.courtId
          ? (courtMap.get(draft.courtId) ?? "")
          : "";
        const score =
          draft.scoreA != null && draft.scoreB != null
            ? ` (${draft.scoreA}-${draft.scoreB})`
            : "";
        const winner =
          draft.finished && draft.winner
            ? ` [Winner: Team ${draft.winner}]`
            : "";
        lines.push(
          `#${matchNum}${court ? ` | ${court}` : ""}: ${teamA} vs ${teamB}${score}${winner}`,
        );
      });
      lines.push("");
    }

    return lines.join("\n");
  }

  function handleCopy() {
    navigator.clipboard.writeText(generateText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <Modal open={open} onClose={onClose} title="Export Schedule">
      <div className="space-y-4">
        <p className="text-sm text-light-300">
          Choose how to export the match schedule.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dark-100 hover:border-accent hover:bg-accent/10 transition-colors"
          >
            {copied ? (
              <FiCheck size={20} className="text-green-400" />
            ) : (
              <FiClipboard size={20} className="text-light-300" />
            )}
            <span className="text-sm text-light-100">
              {copied ? "Copied!" : "Copy as Text"}
            </span>
          </button>
          <button
            onClick={handlePrint}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dark-100 hover:border-accent hover:bg-accent/10 transition-colors"
          >
            <FiPrinter size={20} className="text-light-300" />
            <span className="text-sm text-light-100">Print / PDF</span>
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-light-300 hover:text-light-100 hover:bg-dark-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
