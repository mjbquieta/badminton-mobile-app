"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getAuthErrorMessage } from "@badminton/firebase";
import { useAppSelector, useAppDispatch, setPlayers, setCourts, setDrafts, setTournaments, setSchedules, setDraftTemplates } from "@badminton/store";
import { useRef, useState } from "react";
import {
	FiCheck,
	FiDatabase,
	FiDownload,
	FiEdit2,
	FiLock,
	FiMail,
	FiMessageSquare,
	FiMoon,
	FiSettings,
	FiSun,
	FiUpload,
	FiX,
} from "react-icons/fi";
import type { ThemeMode } from "@badminton/types";

export default function SettingsPage() {
	const { profile, user, updatePassword, updateClubName } = useAuth();
	const { theme, setTheme, resolvedTheme } = useTheme();
	const dispatch = useAppDispatch();

	const players = useAppSelector((s) => s.players.items);
	const courts = useAppSelector((s) => s.courts.items);
	const drafts = useAppSelector((s) => s.drafts.items);
	const tournaments = useAppSelector((s) => s.tournaments.items);
	const schedules = useAppSelector((s) => s.schedules.items);
	const draftTemplates = useAppSelector((s) => s.draftTemplates.items);

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Club name state
	const [editingClubName, setEditingClubName] = useState(false);
	const [clubName, setClubName] = useState("");
	const [clubNameSaving, setClubNameSaving] = useState(false);
	const [clubNameError, setClubNameError] = useState<string | null>(null);
	const [clubNameSuccess, setClubNameSuccess] = useState(false);

	// Password state
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordSaving, setPasswordSaving] = useState(false);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [passwordSuccess, setPasswordSuccess] = useState(false);

	// Feedback state
	const [feedbackName, setFeedbackName] = useState("");
	const [feedbackType, setFeedbackType] = useState("Bug Report");
	const [feedbackMessage, setFeedbackMessage] = useState("");
	const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
	const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
	const [feedbackError, setFeedbackError] = useState<string | null>(null);

	// Import/Export state
	const [importPreview, setImportPreview] = useState<Record<string, number> | null>(null);
	const [importData, setImportData] = useState<Record<string, unknown[]> | null>(null);
	const [importError, setImportError] = useState<string | null>(null);
	const [importSuccess, setImportSuccess] = useState(false);

	function startEditClubName() {
		setClubName(profile?.clubName ?? "");
		setClubNameError(null);
		setClubNameSuccess(false);
		setEditingClubName(true);
	}

	function cancelEditClubName() {
		setEditingClubName(false);
		setClubNameError(null);
	}

	async function handleSaveClubName() {
		const trimmed = clubName.trim();
		if (!trimmed) {
			setClubNameError("Club name cannot be empty.");
			return;
		}
		if (trimmed === profile?.clubName) {
			setEditingClubName(false);
			return;
		}

		setClubNameSaving(true);
		setClubNameError(null);
		try {
			await updateClubName(trimmed);
			setClubNameSuccess(true);
			setEditingClubName(false);
			setTimeout(() => setClubNameSuccess(false), 3000);
		} catch (err) {
			setClubNameError(getAuthErrorMessage(err));
		} finally {
			setClubNameSaving(false);
		}
	}

	async function handleChangePassword() {
		setPasswordError(null);
		setPasswordSuccess(false);

		if (!currentPassword) {
			setPasswordError("Please enter your current password.");
			return;
		}
		if (newPassword.length < 8) {
			setPasswordError("New password must be at least 8 characters.");
			return;
		}
		if (newPassword !== confirmPassword) {
			setPasswordError("New passwords do not match.");
			return;
		}

		setPasswordSaving(true);
		try {
			await updatePassword(currentPassword, newPassword);
			setPasswordSuccess(true);
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setTimeout(() => setPasswordSuccess(false), 3000);
		} catch (err) {
			setPasswordError(getAuthErrorMessage(err));
		} finally {
			setPasswordSaving(false);
		}
	}

	async function handleSendFeedback(e: React.FormEvent) {
		e.preventDefault();
		setFeedbackError(null);
		setFeedbackSubmitting(true);

		try {
			const res = await fetch("https://formspree.io/f/mkooqkvn", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: feedbackName,
					email: user?.email ?? "",
					type: feedbackType,
					message: feedbackMessage,
				}),
			});

			if (!res.ok) throw new Error("Failed to send. Please try again.");
			setFeedbackSubmitted(true);
		} catch (err: unknown) {
			setFeedbackError(
				err instanceof Error ? err.message : "Something went wrong."
			);
		} finally {
			setFeedbackSubmitting(false);
		}
	}

	function handleExport() {
		const data = {
			version: 1,
			exportedAt: new Date().toISOString(),
			players,
			courts,
			drafts,
			tournaments,
			schedules,
			draftTemplates,
		};
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `smash-potatoes-backup-${new Date().toISOString().split("T")[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setImportError(null);
		setImportPreview(null);
		setImportData(null);
		setImportSuccess(false);

		const reader = new FileReader();
		reader.onload = (ev) => {
			try {
				const parsed = JSON.parse(ev.target?.result as string);
				if (!parsed.version || !parsed.players) {
					setImportError("Invalid backup file format.");
					return;
				}
				const preview: Record<string, number> = {};
				if (Array.isArray(parsed.players)) preview.players = parsed.players.length;
				if (Array.isArray(parsed.courts)) preview.courts = parsed.courts.length;
				if (Array.isArray(parsed.drafts)) preview.drafts = parsed.drafts.length;
				if (Array.isArray(parsed.tournaments)) preview.tournaments = parsed.tournaments.length;
				if (Array.isArray(parsed.schedules)) preview.schedules = parsed.schedules.length;
				if (Array.isArray(parsed.draftTemplates)) preview.draftTemplates = parsed.draftTemplates.length;
				setImportPreview(preview);
				setImportData(parsed);
			} catch {
				setImportError("Failed to parse JSON file.");
			}
		};
		reader.readAsText(file);
		// Reset input so same file can be re-selected
		e.target.value = "";
	}

	function handleImportConfirm() {
		if (!importData) return;
		const d = importData as Record<string, unknown[]>;
		if (d.players) dispatch(setPlayers(d.players as typeof players));
		if (d.courts) dispatch(setCourts(d.courts as typeof courts));
		if (d.drafts) dispatch(setDrafts(d.drafts as typeof drafts));
		if (d.tournaments) dispatch(setTournaments(d.tournaments as typeof tournaments));
		if (d.schedules) dispatch(setSchedules(d.schedules as typeof schedules));
		if (d.draftTemplates) dispatch(setDraftTemplates(d.draftTemplates as typeof draftTemplates));
		setImportPreview(null);
		setImportData(null);
		setImportSuccess(true);
		setTimeout(() => setImportSuccess(false), 3000);
	}

	return (
		<div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-2xl">
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
					<FiSettings className="text-accent" size={20} />
				</div>
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
					<p className="text-light-300 text-sm mt-0.5">
						Manage your account
					</p>
				</div>
			</div>

			<div className="space-y-4">
				{/* Theme */}
				<div className="bg-secondary rounded-2xl border border-dark-100 p-4 sm:p-5">
					<div className="flex items-center gap-2 mb-3">
						{resolvedTheme === "dark" ? (
							<FiMoon size={16} className="text-light-300" />
						) : (
							<FiSun size={16} className="text-light-300" />
						)}
						<h2 className="text-sm font-semibold text-light-200 uppercase tracking-wide">
							Theme
						</h2>
					</div>
					<div className="flex gap-2">
						{(["dark", "light", "system"] as ThemeMode[]).map((mode) => (
							<button
								key={mode}
								onClick={() => setTheme(mode)}
								className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
									theme === mode
										? "bg-accent/15 text-accent border border-accent/30"
										: "bg-dark-200 text-light-300 border border-dark-100 hover:text-light-100"
								}`}
							>
								{mode}
							</button>
						))}
					</div>
				</div>

				{/* Account Info */}
				<div className="bg-secondary rounded-2xl border border-dark-100 p-4 sm:p-5">
					<div className="flex items-center gap-2 mb-3">
						<FiMail size={16} className="text-light-300" />
						<h2 className="text-sm font-semibold text-light-200 uppercase tracking-wide">
							Email
						</h2>
					</div>
					<p className="text-light-100 text-sm">{user?.email ?? "—"}</p>
				</div>

				{/* Club Name */}
				<div className="bg-secondary rounded-2xl border border-dark-100 p-4 sm:p-5">
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-sm font-semibold text-light-200 uppercase tracking-wide">
							Club Name
						</h2>
						{!editingClubName && (
							<button
								onClick={startEditClubName}
								className="flex items-center gap-1.5 text-xs text-light-300 hover:text-accent transition-colors"
							>
								<FiEdit2 size={12} />
								Edit
							</button>
						)}
					</div>

					{clubNameError && (
						<div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-3 py-2 mb-3 flex items-center gap-2 text-sm">
							<span className="flex-1">{clubNameError}</span>
							<button
								onClick={() => setClubNameError(null)}
								className="text-danger/60 hover:text-danger"
							>
								<FiX size={14} />
							</button>
						</div>
					)}

					{clubNameSuccess && (
						<div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-3 py-2 mb-3 text-sm flex items-center gap-2">
							<FiCheck size={14} />
							Club name updated successfully.
						</div>
					)}

					{editingClubName ? (
						<div className="flex gap-2">
							<input
								type="text"
								value={clubName}
								onChange={(e) => setClubName(e.target.value)}
								className="flex-1 px-3 py-2 rounded-xl bg-dark-200 border border-dark-100 text-light-100 text-sm placeholder:text-light-300 focus:outline-none focus:border-accent/50"
								placeholder="Enter club name"
								autoFocus
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSaveClubName();
									if (e.key === "Escape") cancelEditClubName();
								}}
							/>
							<button
								onClick={handleSaveClubName}
								disabled={clubNameSaving}
								className="px-4 py-2 rounded-xl text-sm bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{clubNameSaving ? "Saving..." : "Save"}
							</button>
							<button
								onClick={cancelEditClubName}
								className="px-3 py-2 rounded-xl text-sm text-light-300 hover:text-light-100 hover:bg-dark-200 transition-colors"
							>
								Cancel
							</button>
						</div>
					) : (
						<p className="text-light-100 text-sm">
							{profile?.clubName ?? "—"}
						</p>
					)}
				</div>

				{/* Change Password */}
				<div className="bg-secondary rounded-2xl border border-dark-100 p-4 sm:p-5">
					<div className="flex items-center gap-2 mb-4">
						<FiLock size={16} className="text-light-300" />
						<h2 className="text-sm font-semibold text-light-200 uppercase tracking-wide">
							Change Password
						</h2>
					</div>

					{passwordError && (
						<div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-3 py-2 mb-3 flex items-center gap-2 text-sm">
							<span className="flex-1">{passwordError}</span>
							<button
								onClick={() => setPasswordError(null)}
								className="text-danger/60 hover:text-danger"
							>
								<FiX size={14} />
							</button>
						</div>
					)}

					{passwordSuccess && (
						<div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-3 py-2 mb-3 text-sm flex items-center gap-2">
							<FiCheck size={14} />
							Password changed successfully.
						</div>
					)}

					<div className="space-y-3">
						<div>
							<label className="text-xs text-light-300 mb-1 block">
								Current Password
							</label>
							<input
								type="password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								className="w-full px-3 py-2 rounded-xl bg-dark-200 border border-dark-100 text-light-100 text-sm placeholder:text-light-300 focus:outline-none focus:border-accent/50"
								placeholder="Enter current password"
							/>
						</div>
						<div>
							<label className="text-xs text-light-300 mb-1 block">
								New Password
							</label>
							<input
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="w-full px-3 py-2 rounded-xl bg-dark-200 border border-dark-100 text-light-100 text-sm placeholder:text-light-300 focus:outline-none focus:border-accent/50"
								placeholder="At least 8 characters"
							/>
						</div>
						<div>
							<label className="text-xs text-light-300 mb-1 block">
								Confirm New Password
							</label>
							<input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="w-full px-3 py-2 rounded-xl bg-dark-200 border border-dark-100 text-light-100 text-sm placeholder:text-light-300 focus:outline-none focus:border-accent/50"
								placeholder="Re-enter new password"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleChangePassword();
								}}
							/>
						</div>
						<div className="flex justify-end pt-1">
							<button
								onClick={handleChangePassword}
								disabled={passwordSaving}
								className="px-4 py-2 rounded-xl text-sm bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{passwordSaving ? "Updating..." : "Update Password"}
							</button>
						</div>
					</div>
				</div>
				{/* Feedback */}
				<div className="bg-secondary rounded-2xl border border-dark-100 p-4 sm:p-5">
					<div className="flex items-center gap-2 mb-4">
						<FiMessageSquare size={16} className="text-light-300" />
						<h2 className="text-sm font-semibold text-light-200 uppercase tracking-wide">
							Feedback
						</h2>
					</div>
					<p className="text-light-300 text-xs mb-4">
						Report a bug, suggest a feature, or share your thoughts.
					</p>

					{feedbackSubmitted ? (
						<div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
							<p className="text-green-400 font-semibold mb-1">
								Thanks for your feedback!
							</p>
							<p className="text-light-300 text-sm">
								We&apos;ll review your message and get back to you if needed.
							</p>
							<button
								onClick={() => {
									setFeedbackSubmitted(false);
									setFeedbackName("");
									setFeedbackType("Bug Report");
									setFeedbackMessage("");
								}}
								className="mt-3 text-accent text-sm hover:underline"
							>
								Send another
							</button>
						</div>
					) : (
						<>
							{feedbackError && (
								<div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-3 py-2 mb-3 flex items-center gap-2 text-sm">
									<span className="flex-1">{feedbackError}</span>
									<button
										onClick={() => setFeedbackError(null)}
										className="text-danger/60 hover:text-danger"
									>
										<FiX size={14} />
									</button>
								</div>
							)}

							<form onSubmit={handleSendFeedback} className="space-y-3">
								<div>
									<label className="text-xs text-light-300 mb-1 block">
										Name
									</label>
									<input
										type="text"
										value={feedbackName}
										onChange={(e) => setFeedbackName(e.target.value)}
										className="w-full px-3 py-2 rounded-xl bg-dark-200 border border-dark-100 text-light-100 text-sm placeholder:text-light-300 focus:outline-none focus:border-accent/50"
										placeholder="Your name (optional)"
									/>
								</div>

								<div>
									<label className="text-xs text-light-300 mb-1 block">
										Type
									</label>
									<select
										value={feedbackType}
										onChange={(e) => setFeedbackType(e.target.value)}
										className="w-full px-3 py-2 rounded-xl bg-dark-200 border border-dark-100 text-light-100 text-sm focus:outline-none focus:border-accent/50 appearance-none"
									>
										<option value="Bug Report">Bug Report</option>
										<option value="Suggestion">Suggestion</option>
										<option value="Other">Other</option>
									</select>
								</div>

								<div>
									<label className="text-xs text-light-300 mb-1 block">
										Message
									</label>
									<textarea
										value={feedbackMessage}
										onChange={(e) => setFeedbackMessage(e.target.value)}
										required
										rows={4}
										className="w-full px-3 py-2 rounded-xl bg-dark-200 border border-dark-100 text-light-100 text-sm placeholder:text-light-300 focus:outline-none focus:border-accent/50 resize-none"
										placeholder="Describe the issue or share your idea..."
									/>
								</div>

								<div className="flex justify-end pt-1">
									<button
										type="submit"
										disabled={feedbackSubmitting}
										className="px-4 py-2 rounded-xl text-sm bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										{feedbackSubmitting ? "Sending..." : "Send Feedback"}
									</button>
								</div>
							</form>
						</>
					)}
				</div>
				{/* Data Management */}
				<div className="bg-secondary rounded-2xl border border-dark-100 p-4 sm:p-5">
					<div className="flex items-center gap-2 mb-4">
						<FiDatabase size={16} className="text-light-300" />
						<h2 className="text-sm font-semibold text-light-200 uppercase tracking-wide">
							Data Management
						</h2>
					</div>
					<p className="text-light-300 text-xs mb-4">
						Export your data as a JSON backup or import from a previous backup.
					</p>

					{importError && (
						<div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-3 py-2 mb-3 flex items-center gap-2 text-sm">
							<span className="flex-1">{importError}</span>
							<button onClick={() => setImportError(null)} className="text-danger/60 hover:text-danger">
								<FiX size={14} />
							</button>
						</div>
					)}

					{importSuccess && (
						<div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-3 py-2 mb-3 text-sm flex items-center gap-2">
							<FiCheck size={14} />
							Data imported successfully.
						</div>
					)}

					<div className="flex gap-3 mb-4">
						<button
							onClick={handleExport}
							className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-primary hover:bg-accent/80 transition-colors"
						>
							<FiDownload size={14} />
							Export Data
						</button>
						<button
							onClick={() => fileInputRef.current?.click()}
							className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-dark-100 text-light-200 hover:bg-dark-200 transition-colors"
						>
							<FiUpload size={14} />
							Import Data
						</button>
						<input
							ref={fileInputRef}
							type="file"
							accept=".json"
							onChange={handleImportFile}
							className="hidden"
						/>
					</div>

					{/* Import Preview */}
					{importPreview && (
						<div className="bg-primary rounded-xl border border-dark-100 p-4">
							<p className="text-light-100 text-sm font-semibold mb-2">Import Preview</p>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 text-xs">
								{Object.entries(importPreview).map(([key, count]) => (
									<div key={key} className="bg-secondary rounded-lg px-3 py-2 border border-dark-100">
										<span className="text-light-300 capitalize">{key}</span>
										<span className="text-light-100 font-bold ml-2">{count}</span>
									</div>
								))}
							</div>
							<p className="text-warning text-xs mb-3">
								This will replace all existing data. Make sure you have a backup.
							</p>
							<div className="flex gap-2">
								<button
									onClick={handleImportConfirm}
									className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-primary hover:bg-accent/80 transition-colors"
								>
									Confirm Import
								</button>
								<button
									onClick={() => { setImportPreview(null); setImportData(null); }}
									className="px-4 py-2 rounded-xl text-sm text-light-300 hover:bg-dark-200 transition-colors"
								>
									Cancel
								</button>
							</div>
						</div>
					)}

					{/* Current Data Summary */}
					<div className="text-xs text-light-300 space-y-1 mt-2">
						<p>Current data: {players.length} players, {courts.length} courts, {drafts.length} drafts, {tournaments.length} tournaments, {schedules.length} sessions, {draftTemplates.length} templates</p>
					</div>
				</div>
			</div>
		</div>
	);
}
