import { useToast } from "@/components/Toast";
import { BadmintonPalette } from "@/constants/palette";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthErrorMessage } from "@badminton/firebase";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Keyboard,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export const AccountContent = () => {
	const { user, profile, updatePassword, updateClubName } = useAuth();
	const { showToast } = useToast();

	// Club name state
	const [editingClubName, setEditingClubName] = useState(false);
	const [clubName, setClubName] = useState("");
	const [clubNameSaving, setClubNameSaving] = useState(false);

	// Password state
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordSaving, setPasswordSaving] = useState(false);

	const startEditClubName = () => {
		setClubName(profile?.clubName ?? "");
		setEditingClubName(true);
	};

	const cancelEditClubName = () => {
		setEditingClubName(false);
	};

	const handleSaveClubName = async () => {
		const trimmed = clubName.trim();
		if (!trimmed) {
			Alert.alert("Error", "Club name cannot be empty.");
			return;
		}
		if (trimmed === profile?.clubName) {
			setEditingClubName(false);
			return;
		}

		Keyboard.dismiss();
		setClubNameSaving(true);
		try {
			await updateClubName(trimmed);
			setEditingClubName(false);
			showToast({ message: "Club name updated", type: "success" });
		} catch (err) {
			Alert.alert("Error", getAuthErrorMessage(err));
		} finally {
			setClubNameSaving(false);
		}
	};

	const handleChangePassword = async () => {
		if (!currentPassword) {
			Alert.alert("Error", "Please enter your current password.");
			return;
		}
		if (newPassword.length < 8) {
			Alert.alert("Error", "New password must be at least 8 characters.");
			return;
		}
		if (newPassword !== confirmPassword) {
			Alert.alert("Error", "New passwords do not match.");
			return;
		}

		Keyboard.dismiss();
		setPasswordSaving(true);
		try {
			await updatePassword(currentPassword, newPassword);
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			showToast({ message: "Password changed successfully", type: "success" });
		} catch (err) {
			Alert.alert("Error", getAuthErrorMessage(err));
		} finally {
			setPasswordSaving(false);
		}
	};

	return (
		<ScrollView
			className="flex-1 bg-primary px-6"
			contentContainerStyle={{ paddingBottom: 40 }}
			keyboardShouldPersistTaps="handled"
		>
			{/* Email */}
			<View className="bg-secondary border border-dark-100 rounded-2xl p-4 mb-4">
				<View className="flex-row items-center gap-2 mb-2">
					<AntDesign
						name="mail"
						size={16}
						color={BadmintonPalette.text.muted}
					/>
					<Text
						className="text-xs font-semibold uppercase tracking-wider"
						style={{ color: BadmintonPalette.text.secondary }}
					>
						Email
					</Text>
				</View>
				<Text
					className="text-sm"
					style={{ color: BadmintonPalette.text.primary }}
				>
					{user?.email ?? "—"}
				</Text>
			</View>

			{/* Club Name */}
			<View className="bg-secondary border border-dark-100 rounded-2xl p-4 mb-4">
				<View className="flex-row items-center justify-between mb-2">
					<Text
						className="text-xs font-semibold uppercase tracking-wider"
						style={{ color: BadmintonPalette.text.secondary }}
					>
						Club Name
					</Text>
					{!editingClubName && (
						<TouchableOpacity
							onPress={startEditClubName}
							className="flex-row items-center gap-1"
						>
							<AntDesign
								name="edit"
								size={12}
								color={BadmintonPalette.text.muted}
							/>
							<Text
								className="text-xs"
								style={{ color: BadmintonPalette.text.muted }}
							>
								Edit
							</Text>
						</TouchableOpacity>
					)}
				</View>

				{editingClubName ? (
					<View>
						<TextInput
							value={clubName}
							onChangeText={setClubName}
							placeholder="Enter club name"
							placeholderTextColor={BadmintonPalette.text.muted}
							className="bg-dark-200 border border-dark-100 rounded-xl px-3 py-2.5 text-sm mb-3"
							style={{ color: BadmintonPalette.text.primary }}
							autoFocus
							onSubmitEditing={handleSaveClubName}
						/>
						<View className="flex-row gap-3">
							<TouchableOpacity
								onPress={cancelEditClubName}
								className="flex-1 py-2.5 rounded-xl border border-dark-100 bg-dark-200 items-center"
							>
								<Text
									className="text-sm font-semibold"
									style={{ color: BadmintonPalette.text.secondary }}
								>
									Cancel
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleSaveClubName}
								disabled={clubNameSaving}
								className="flex-1 py-2.5 rounded-xl items-center"
								style={{
									backgroundColor: BadmintonPalette.accent.primary,
									opacity: clubNameSaving ? 0.5 : 1,
								}}
							>
								{clubNameSaving ? (
									<ActivityIndicator
										size="small"
										color={BadmintonPalette.bg.base}
									/>
								) : (
									<Text
										className="text-sm font-bold"
										style={{ color: BadmintonPalette.bg.base }}
									>
										Save
									</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				) : (
					<Text
						className="text-sm"
						style={{ color: BadmintonPalette.text.primary }}
					>
						{profile?.clubName ?? "—"}
					</Text>
				)}
			</View>

			{/* Change Password */}
			<View className="bg-secondary border border-dark-100 rounded-2xl p-4">
				<View className="flex-row items-center gap-2 mb-4">
					<AntDesign
						name="lock1"
						size={16}
						color={BadmintonPalette.text.muted}
					/>
					<Text
						className="text-xs font-semibold uppercase tracking-wider"
						style={{ color: BadmintonPalette.text.secondary }}
					>
						Change Password
					</Text>
				</View>

				<View className="mb-3">
					<Text
						className="text-xs mb-1"
						style={{ color: BadmintonPalette.text.muted }}
					>
						Current Password
					</Text>
					<TextInput
						value={currentPassword}
						onChangeText={setCurrentPassword}
						placeholder="Enter current password"
						placeholderTextColor={BadmintonPalette.text.muted}
						secureTextEntry
						className="bg-dark-200 border border-dark-100 rounded-xl px-3 py-2.5 text-sm"
						style={{ color: BadmintonPalette.text.primary }}
					/>
				</View>

				<View className="mb-3">
					<Text
						className="text-xs mb-1"
						style={{ color: BadmintonPalette.text.muted }}
					>
						New Password
					</Text>
					<TextInput
						value={newPassword}
						onChangeText={setNewPassword}
						placeholder="At least 8 characters"
						placeholderTextColor={BadmintonPalette.text.muted}
						secureTextEntry
						className="bg-dark-200 border border-dark-100 rounded-xl px-3 py-2.5 text-sm"
						style={{ color: BadmintonPalette.text.primary }}
					/>
				</View>

				<View className="mb-4">
					<Text
						className="text-xs mb-1"
						style={{ color: BadmintonPalette.text.muted }}
					>
						Confirm New Password
					</Text>
					<TextInput
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						placeholder="Re-enter new password"
						placeholderTextColor={BadmintonPalette.text.muted}
						secureTextEntry
						className="bg-dark-200 border border-dark-100 rounded-xl px-3 py-2.5 text-sm"
						style={{ color: BadmintonPalette.text.primary }}
						onSubmitEditing={handleChangePassword}
					/>
				</View>

				<TouchableOpacity
					onPress={handleChangePassword}
					disabled={passwordSaving}
					className="py-3 rounded-xl items-center"
					style={{
						backgroundColor: BadmintonPalette.accent.primary,
						opacity: passwordSaving ? 0.5 : 1,
					}}
				>
					{passwordSaving ? (
						<ActivityIndicator
							size="small"
							color={BadmintonPalette.bg.base}
						/>
					) : (
						<Text
							className="text-sm font-bold"
							style={{ color: BadmintonPalette.bg.base }}
						>
							Update Password
						</Text>
					)}
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
};
