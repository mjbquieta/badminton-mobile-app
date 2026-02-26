export type UserRole = 'admin' | 'player';

export type UserRolePermissions = {
	canManagePlayers: boolean;
	canManageCourts: boolean;
	canManageDrafts: boolean;
	canManageConfirmation: boolean;
	canViewStatistics: boolean;
	canInviteUsers: boolean;
};
