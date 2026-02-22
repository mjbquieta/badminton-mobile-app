import ScreenHeader from "@/components/activity/ScreenHeader";
import { BadmintonPalette } from "@/constants/palette";
import { PlayerLevel } from "@badminton/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";
import {
	Keyboard,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

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

function parseEntries(
	text: string,
): { entries: { name: string; level: PlayerLevel }[]; skipped: number } {
	const trimmed = text.trim();
	if (!trimmed) return { entries: [], skipped: 0 };

	let raw: { name: string; level: string }[];

	if (trimmed.startsWith("[")) {
		try {
			const parsed = JSON.parse(trimmed);
			if (!Array.isArray(parsed)) return { entries: [], skipped: 0 };
			raw = parsed.map((item: unknown) => {
				if (typeof item === "object" && item !== null) {
					const obj = item as Record<string, unknown>;
					return {
						name: String(obj.name ?? ""),
						level: String(obj.level ?? ""),
					};
				}
				return { name: "", level: "" };
			});
		} catch {
			return { entries: [], skipped: 0 };
		}
	} else {
		raw = parseCsv(trimmed);
	}

	const entries: { name: string; level: PlayerLevel }[] = [];
	let skipped = 0;

	for (const item of raw) {
		const name = item.name.trim();
		const level = item.level.trim().toUpperCase();
		if (name.length >= 1 && validLevels.has(level as PlayerLevel)) {
			entries.push({ name, level: level as PlayerLevel });
		} else {
			skipped++;
		}
	}

	return { entries, skipped };
}

type ImportPlayersScreenProps = {
	onImport: (entries: { name: string; level: PlayerLevel }[]) => {
		imported: number;
		skipped: number;
	};
	onBack: () => void;
};

const ImportPlayersScreen = ({ onImport, onBack }: ImportPlayersScreenProps) => {
	const [importText, setImportText] = useState("");
	const [error, setError] = useState<string | null>(null);

	const handleImport = () => {
		Keyboard.dismiss();
		setError(null);

		const trimmed = importText.trim();
		if (!trimmed) {
			setError("Please paste JSON or CSV text.");
			return;
		}

		const { entries, skipped: parseSkipped } = parseEntries(trimmed);

		if (entries.length === 0) {
			setError(
				parseSkipped > 0
					? `All ${parseSkipped} entries were invalid. Check the format.`
					: "Could not parse any entries. Use JSON array or CSV format.",
			);
			return;
		}

		const result = onImport(entries);
		if (result.imported > 0) {
			onBack();
		}
	};

	return (
		<>
			<ScreenHeader title="Import Players" onBack={onBack} />

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 24, gap: 16 }}
				keyboardShouldPersistTaps="handled"
			>
				<Text
					className="text-sm"
					style={{ color: BadmintonPalette.text.muted }}
				>
					Paste JSON or CSV text
				</Text>

				{/* Format hints */}
				<View className="bg-dark-200 border border-dark-100 rounded-xl p-3">
					<Text
						className="text-xs font-semibold mb-1"
						style={{ color: BadmintonPalette.text.secondary }}
					>
						JSON format:
					</Text>
					<Text
						className="text-xs font-mono"
						style={{ color: BadmintonPalette.text.muted }}
					>
						{'[{"name":"Juan","level":"BEGINNER"}]'}
					</Text>
					<Text
						className="text-xs font-semibold mt-2 mb-1"
						style={{ color: BadmintonPalette.text.secondary }}
					>
						CSV format:
					</Text>
					<Text
						className="text-xs font-mono"
						style={{ color: BadmintonPalette.text.muted }}
					>
						name,level{"\n"}Juan,BEGINNER
					</Text>
				</View>

				{/* Error */}
				{error && (
					<View className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex-row items-center">
						<AntDesign
							name="exclamation-circle"
							size={14}
							color={BadmintonPalette.accent.danger}
						/>
						<Text
							className="text-sm ml-2 flex-1"
							style={{ color: BadmintonPalette.accent.danger }}
						>
							{error}
						</Text>
					</View>
				)}

				{/* Text input */}
				<TextInput
					value={importText}
					onChangeText={setImportText}
					placeholder="Paste JSON or CSV here..."
					placeholderTextColor={BadmintonPalette.text.muted}
					multiline
					numberOfLines={8}
					textAlignVertical="top"
					className="bg-dark-200 border border-dark-100 rounded-xl px-3 py-3 text-sm min-h-[200px]"
					style={{ color: BadmintonPalette.text.primary }}
				/>
			</ScrollView>

			{/* Footer */}
			<View
				className="flex-row items-center px-6 py-4 border-t border-dark-100"
				style={{ gap: 12 }}
			>
				<TouchableOpacity
					className="flex-1 py-3 rounded-xl border border-dark-100 bg-dark-200 items-center"
					onPress={() => {
						Keyboard.dismiss();
						onBack();
					}}
					accessibilityRole="button"
					accessibilityLabel="Cancel"
				>
					<Text
						className="font-bold"
						style={{ color: BadmintonPalette.text.secondary }}
					>
						Cancel
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					className="flex-1 py-3 rounded-xl items-center flex-row justify-center bg-accent active:opacity-80"
					onPress={handleImport}
					accessibilityRole="button"
					accessibilityLabel="Import players"
				>
					<AntDesign
						name="download"
						size={16}
						color={BadmintonPalette.bg.base}
					/>
					<Text
						className="font-bold ml-1"
						style={{ color: BadmintonPalette.bg.base }}
					>
						Import
					</Text>
				</TouchableOpacity>
			</View>
		</>
	);
};

export default ImportPlayersScreen;
