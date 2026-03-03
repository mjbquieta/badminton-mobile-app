"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
	initializeFirebase,
	getConfirmationDoc,
	subscribeToConfirmation,
	updatePlayerConfirmation,
	addJoinRequest,
} from "@badminton/firebase";
import { firebaseConfig } from "@/config/firebase";
import {
	PlayerLevel,
	type ConfirmationDocument,
	type PlayerConfirmation,
	type ConfirmationStatus,
	type JoinRequest,
} from "@badminton/types";
import { playerLevelConfig } from "@badminton/ui-shared";
import {
	FiActivity,
	FiCalendar,
	FiCheck,
	FiClock,
	FiLock,
	FiMapPin,
	FiSearch,
	FiUserPlus,
} from "react-icons/fi";

type Phase = "pin-entry" | "loading" | "viewing" | "not-found" | "error";

export default function ConfirmationPage() {
	const params = useParams();
	const serialId = params.serialId as string;

	const [phase, setPhase] = useState<Phase>("pin-entry");
	const [pinInput, setPinInput] = useState("");
	const [pinError, setPinError] = useState<string | null>(null);
	const [data, setData] = useState<ConfirmationDocument | null>(null);
	const [updatingPlayer, setUpdatingPlayer] = useState<string | null>(null);
	const [playerSearch, setPlayerSearch] = useState("");
	const firebaseInitialized = useRef(false);

	// Join request form state
	const [showJoinForm, setShowJoinForm] = useState(false);
	const [joinName, setJoinName] = useState("");
	const [joinLevel, setJoinLevel] = useState<PlayerLevel>(PlayerLevel.INTERMEDIATE);
	const [joinDescription, setJoinDescription] = useState("");
	const [joinSubmitting, setJoinSubmitting] = useState(false);
	const [joinSubmitted, setJoinSubmitted] = useState(false);

	useEffect(() => {
		if (!firebaseInitialized.current) {
			initializeFirebase(firebaseConfig);
			firebaseInitialized.current = true;
		}
	}, []);

	async function handlePinSubmit() {
		if (pinInput.length !== 8) {
			setPinError("PIN must be 8 digits.");
			return;
		}
		setPhase("loading");
		setPinError(null);
		try {
			const doc = await getConfirmationDoc(serialId);
			if (!doc) {
				setPhase("not-found");
				return;
			}
			if (doc.pin !== pinInput) {
				setPinError("Incorrect PIN. Please try again.");
				setPhase("pin-entry");
				return;
			}
			setData(doc);
			setPhase("viewing");
		} catch {
			setPhase("error");
		}
	}

	useEffect(() => {
		if (phase !== "viewing") return;
		const unsubscribe = subscribeToConfirmation(
			serialId,
			(updatedData) => setData(updatedData),
			(err) => console.error("Subscription error:", err),
		);
		return unsubscribe;
	}, [phase, serialId]);

	async function handleStatusChange(
		playerId: string,
		status: "confirmed" | "declined",
	) {
		if (!data || data.locked) return;
		setUpdatingPlayer(playerId);
		try {
			await updatePlayerConfirmation(
				serialId,
				playerId,
				status,
				data.playerConfirmations,
			);
		} catch (err) {
			console.error("Failed to update confirmation:", err);
		} finally {
			setUpdatingPlayer(null);
		}
	}

	// --- PIN Entry ---
	if (phase === "pin-entry" || phase === "loading") {
		return (
			<div className="flex flex-col items-center pt-16">
				<div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
					<FiActivity className="text-accent" size={28} />
				</div>
				<h1 className="text-xl font-bold mb-1">Player Confirmation</h1>
				<p className="text-light-300 text-sm mb-8">
					Enter the 8-digit PIN to view this event
				</p>
				<div className="w-full max-w-xs space-y-4">
					<input
						type="text"
						inputMode="numeric"
						maxLength={8}
						placeholder="Enter 8-digit PIN"
						value={pinInput}
						onChange={(e) => {
							const val = e.target.value.replace(/\D/g, "").slice(0, 8);
							setPinInput(val);
							setPinError(null);
						}}
						onKeyDown={(e) =>
							e.key === "Enter" && pinInput.length === 8 && handlePinSubmit()
						}
						className="w-full bg-dark-200 border border-dark-100 rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] font-mono text-light-100 placeholder:text-light-300/40 placeholder:tracking-normal placeholder:text-sm outline-none focus:border-accent/50"
						autoFocus
					/>
					{pinError && (
						<p className="text-danger text-xs text-center">{pinError}</p>
					)}
					<button
						onClick={handlePinSubmit}
						disabled={pinInput.length !== 8 || phase === "loading"}
						className="w-full py-3 rounded-xl bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					>
						{phase === "loading" ? (
							<span className="flex items-center justify-center gap-2">
								<span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
								Verifying...
							</span>
						) : (
							"View Event"
						)}
					</button>
				</div>
			</div>
		);
	}

	// --- Not Found ---
	if (phase === "not-found") {
		return (
			<div className="flex flex-col items-center pt-16 text-center">
				<div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
					<FiActivity className="text-danger" size={28} />
				</div>
				<h1 className="text-xl font-bold mb-2">Event Not Found</h1>
				<p className="text-light-300 text-sm">
					This confirmation link is invalid or has expired.
				</p>
			</div>
		);
	}

	// --- Error ---
	if (phase === "error") {
		return (
			<div className="flex flex-col items-center pt-16 text-center">
				<div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
					<FiActivity className="text-danger" size={28} />
				</div>
				<h1 className="text-xl font-bold mb-2">Something Went Wrong</h1>
				<p className="text-light-300 text-sm">
					Failed to load the event. Please try again later.
				</p>
			</div>
		);
	}

	async function handleJoinRequest() {
		if (!data || joinName.trim().length < 2) return;
		setJoinSubmitting(true);
		try {
			const request: JoinRequest = {
				id: crypto.randomUUID(),
				name: joinName.trim(),
				level: joinLevel,
				description: joinDescription.trim(),
				status: "pending",
				createdAt: Date.now(),
			};
			await addJoinRequest(serialId, request, data.joinRequests ?? []);
			setJoinSubmitted(true);
			setShowJoinForm(false);
		} catch (err) {
			console.error("Failed to submit join request:", err);
		} finally {
			setJoinSubmitting(false);
		}
	}

	// --- Viewing ---
	if (!data) return null;

	const { eventDetails, playerConfirmations, locked } = data;
	const existingRequest = (data.joinRequests ?? []).find(
		(r) => r.name.toLowerCase() === joinName.trim().toLowerCase(),
	);
	const existingPlayer = joinName.trim().length >= 2
		? playerConfirmations.find(
				(p) => p.playerName.toLowerCase() === joinName.trim().toLowerCase(),
			)
		: undefined;
	const confirmed = playerConfirmations.filter(
		(p) => p.status === "confirmed",
	).length;
	const declined = playerConfirmations.filter(
		(p) => p.status === "declined",
	).length;
	const pending = playerConfirmations.filter(
		(p) => p.status === "pending",
	).length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="text-center">
				<div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
					<FiActivity className="text-accent" size={24} />
				</div>
				<h1 className="text-xl font-bold">Player Confirmation</h1>
			</div>

			{/* Locked Banner */}
			{locked && (
				<div className="bg-warning/10 border border-warning/30 text-warning rounded-xl px-4 py-3 flex items-center gap-3">
					<FiLock size={16} className="shrink-0" />
					<span className="text-sm font-medium">
						Confirmations are locked. No further changes can be made.
					</span>
				</div>
			)}

			{/* Event Details */}
			<div className="bg-secondary rounded-2xl border border-dark-100 p-5 space-y-3">
				<h2 className="text-sm font-semibold text-light-200 uppercase tracking-wide mb-3">
					Event Details
				</h2>
				<div className="space-y-2.5">
					<div className="flex items-start gap-3">
						<FiMapPin size={16} className="text-accent shrink-0 mt-0.5" />
						<div>
							<p className="text-xs text-light-300">Location</p>
							<p className="text-sm font-medium">{eventDetails.location}</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<FiCalendar size={16} className="text-accent shrink-0 mt-0.5" />
						<div>
							<p className="text-xs text-light-300">Date</p>
							<p className="text-sm font-medium">
								{formatDate(eventDetails.date)}
							</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<FiClock size={16} className="text-accent shrink-0 mt-0.5" />
						<div>
							<p className="text-xs text-light-300">Time</p>
							<p className="text-sm font-medium">
								{formatTime(eventDetails.startTime)} &ndash;{" "}
								{formatTime(eventDetails.endTime)}
							</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<FiActivity
							size={16}
							className="text-accent shrink-0 mt-0.5"
						/>
						<div>
							<p className="text-xs text-light-300">Courts Reserved</p>
							<p className="text-sm font-medium">{eventDetails.courts}</p>
						</div>
					</div>
					{eventDetails.notes && (
						<div className="pt-2 border-t border-dark-100">
							<p className="text-xs text-light-300 mb-1">Notes</p>
							<p className="text-sm text-light-200">{eventDetails.notes}</p>
						</div>
					)}
				</div>
			</div>

			{/* Status Summary */}
			<div className="grid grid-cols-3 gap-3">
				<div className="bg-secondary rounded-xl border border-dark-100 p-3 text-center">
					<p className="text-lg font-bold text-success">{confirmed}</p>
					<p className="text-[10px] text-light-300 uppercase tracking-wide">
						Going
					</p>
				</div>
				<div className="bg-secondary rounded-xl border border-dark-100 p-3 text-center">
					<p className="text-lg font-bold text-danger">{declined}</p>
					<p className="text-[10px] text-light-300 uppercase tracking-wide">
						Not Going
					</p>
				</div>
				<div className="bg-secondary rounded-xl border border-dark-100 p-3 text-center">
					<p className="text-lg font-bold text-light-300">{pending}</p>
					<p className="text-[10px] text-light-300 uppercase tracking-wide">
						Pending
					</p>
				</div>
			</div>

			{/* Join Request Section */}
			{!locked && (
				<div className="bg-secondary rounded-2xl border border-accent/30 overflow-hidden">
					{joinSubmitted ? (
						<div className="px-5 py-6 text-center space-y-2">
							<div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto">
								<FiCheck className="text-success" size={20} />
							</div>
							<p className="text-sm font-semibold text-success">
								Request Submitted!
							</p>
							<p className="text-xs text-light-300">
								The organizer will review your request. Check back later for
								updates.
							</p>
						</div>
					) : (
						<>
							<button
								onClick={() => setShowJoinForm(!showJoinForm)}
								className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-dark-200/50 transition-colors"
							>
								<FiUserPlus size={18} className="text-accent shrink-0" />
								<span className="text-sm font-semibold text-accent">
									Not on the list? Request to join
								</span>
								<span
									className={`ml-auto text-light-300 text-xs transition-transform ${showJoinForm ? "rotate-180" : ""}`}
								>
									&#9662;
								</span>
							</button>
							{showJoinForm && (
								<div className="px-5 pb-5 space-y-4 border-t border-dark-100 pt-4">
									{/* Name */}
									<div>
										<label className="text-xs text-light-300 mb-1 block">
											Your Name
										</label>
										<input
											type="text"
											value={joinName}
											onChange={(e) => setJoinName(e.target.value)}
											placeholder="Enter your name"
											className="w-full bg-dark-200 border border-dark-100 rounded-lg px-3 py-2 text-sm text-light-100 placeholder:text-light-300/40 outline-none focus:border-accent/50"
										/>
									</div>

									{/* Skill Level */}
									<div>
										<label className="text-xs text-light-300 mb-2 block">
											Skill Level
										</label>
										<div className="grid grid-cols-4 gap-1.5">
											{(
												[
													PlayerLevel.BEGINNER,
													PlayerLevel.INTERMEDIATE,
													PlayerLevel.ADVANCED,
													PlayerLevel.PRO,
												]
											).map((level) => {
												const config = playerLevelConfig[level];
												const selected = joinLevel === level;
												return (
													<button
														key={level}
														onClick={() => setJoinLevel(level)}
														className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${
															selected
																? "border-accent/50 bg-accent/10"
																: "border-dark-100 bg-dark-200 hover:border-dark-100/80"
														}`}
														style={
															selected
																? { color: config.color }
																: undefined
														}
													>
														{config.shortLabel}
													</button>
												);
											})}
										</div>
									</div>

									{/* Description */}
									<div>
										<label className="text-xs text-light-300 mb-1 block">
											Description{" "}
											<span className="text-light-300/50">(optional)</span>
										</label>
										<textarea
											value={joinDescription}
											onChange={(e) => setJoinDescription(e.target.value)}
											placeholder="e.g. Invited by John, new to badminton..."
											rows={2}
											className="w-full bg-dark-200 border border-dark-100 rounded-lg px-3 py-2 text-sm text-light-100 placeholder:text-light-300/40 outline-none focus:border-accent/50 resize-none"
										/>
									</div>

									{existingPlayer && !joinSubmitting && (
										<p className="text-xs text-warning">
											This name is already on the player list — find your name below to confirm.
										</p>
									)}

									{existingRequest && !existingPlayer && !joinSubmitting && (
										<p className="text-xs text-warning">
											A request with this name already exists (
											{existingRequest.status}).
										</p>
									)}

									{/* Submit */}
									<button
										onClick={handleJoinRequest}
										disabled={
											joinName.trim().length < 2 ||
											joinSubmitting ||
											!!existingRequest ||
											!!existingPlayer
										}
										className="w-full py-2.5 rounded-xl bg-accent text-primary font-semibold text-sm hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
									>
										{joinSubmitting ? (
											<span className="flex items-center justify-center gap-2">
												<span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
												Submitting...
											</span>
										) : (
											"Submit Request"
										)}
									</button>
								</div>
							)}
						</>
					)}
				</div>
			)}

			{/* Player List */}
			{(() => {
				const filteredPlayers = playerSearch
					? playerConfirmations.filter((pc) =>
							pc.playerName.toLowerCase().includes(playerSearch.toLowerCase()),
						)
					: playerConfirmations;
				return (
					<div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
						<div className="px-5 py-3 border-b border-dark-100 space-y-3">
							<h2 className="text-sm font-semibold text-light-200 uppercase tracking-wide">
								Players ({playerConfirmations.length})
							</h2>
							{playerConfirmations.length > 5 && (
								<div className="relative">
									<FiSearch
										size={14}
										className="absolute left-3 top-1/2 -translate-y-1/2 text-light-300/50"
									/>
									<input
										type="text"
										placeholder="Search your name..."
										value={playerSearch}
										onChange={(e) => setPlayerSearch(e.target.value)}
										className="w-full bg-dark-200 border border-dark-100 rounded-lg pl-9 pr-3 py-2 text-sm text-light-100 placeholder:text-light-300/40 outline-none focus:border-accent/50"
									/>
								</div>
							)}
						</div>
						<div className="divide-y divide-dark-100">
							{filteredPlayers.map((pc) => (
								<PlayerConfirmationRow
									key={pc.playerId}
									pc={pc}
									locked={locked}
									updating={updatingPlayer === pc.playerId}
									onConfirm={() => handleStatusChange(pc.playerId, "confirmed")}
									onDecline={() => handleStatusChange(pc.playerId, "declined")}
								/>
							))}
							{playerSearch && filteredPlayers.length === 0 && (
								<div className="px-5 py-6 text-center text-sm text-light-300">
									No players found matching &ldquo;{playerSearch}&rdquo;
								</div>
							)}
						</div>
					</div>
				);
			})()}

			</div>
	);
}

function PlayerConfirmationRow({
	pc,
	locked,
	updating,
	onConfirm,
	onDecline,
}: {
	pc: PlayerConfirmation;
	locked: boolean;
	updating: boolean;
	onConfirm: () => void;
	onDecline: () => void;
}) {
	const config = playerLevelConfig[pc.playerLevel];
	const statusColors: Record<ConfirmationStatus, string> = {
		confirmed: "text-success",
		declined: "text-danger",
		pending: "text-light-300",
	};

	return (
		<div className="px-5 py-3 flex items-center gap-3">
			{/* Level badge */}
			<span
				className="inline-flex items-center justify-center font-bold rounded text-[10px] w-5 h-5 shrink-0"
				style={{ color: config.color, backgroundColor: `${config.color}15` }}
			>
				{config.shortLabel}
			</span>

			{/* Player info */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">{pc.playerName}</p>
				<div className="flex items-center gap-2">
					<span
						className={`text-[10px] font-semibold uppercase tracking-wide ${statusColors[pc.status]}`}
					>
						{pc.status}
					</span>
					{pc.confirmedAt && (
						<span className="text-[10px] text-light-300/50">
							{formatTimestamp(pc.confirmedAt)}
						</span>
					)}
				</div>
			</div>

			{/* Actions */}
			{!locked && (
				<div className="flex gap-1.5 shrink-0">
					{pc.status !== "confirmed" && (
						<button
							onClick={onConfirm}
							disabled={updating}
							className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-success/10 text-success border border-success/20 hover:bg-success/20 disabled:opacity-40 transition-colors"
						>
							{updating ? "..." : "Confirm"}
						</button>
					)}
					{pc.status !== "declined" && (
						<button
							onClick={onDecline}
							disabled={updating}
							className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 disabled:opacity-40 transition-colors"
						>
							{updating ? "..." : "Decline"}
						</button>
					)}
				</div>
			)}
		</div>
	);
}

function formatDate(dateStr: string): string {
	if (!dateStr) return "";
	const date = new Date(dateStr + "T00:00:00");
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function formatTime(timeStr: string): string {
	if (!timeStr) return "";
	const [h, m] = timeStr.split(":");
	const hour = parseInt(h, 10);
	const ampm = hour >= 12 ? "PM" : "AM";
	const hour12 = hour % 12 || 12;
	return `${hour12}:${m} ${ampm}`;
}

function formatTimestamp(ts: number): string {
	return new Date(ts).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}
