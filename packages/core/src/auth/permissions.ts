import { type UserRole, type UserRolePermissions } from '@badminton/types';

export const ROLE_PERMISSIONS: Record<UserRole, UserRolePermissions> = {
	admin: {
		canManagePlayers: true,
		canManageCourts: true,
		canManageDrafts: true,
		canManageConfirmation: true,
		canViewStatistics: true,
		canInviteUsers: true,
	},
	player: {
		canManagePlayers: false,
		canManageCourts: false,
		canManageDrafts: false,
		canManageConfirmation: false,
		canViewStatistics: true,
		canInviteUsers: false,
	},
};

export function hasPermission(role: UserRole, permission: keyof UserRolePermissions): boolean {
	return ROLE_PERMISSIONS[role][permission];
}

export function getPermissions(role: UserRole): UserRolePermissions {
	return ROLE_PERMISSIONS[role];
}
