export const BadmintonLightPalette = {
	bg: {
		base: '#FFFFFF',
		surface: '#F5F5F5',
		elevated: '#EBEBEB',
		border: '#D4D4D4',
	},
	court: {
		deep: '#0B5D3B',
		lime: '#65A30D',
		limeMuted: '#4D7C0F',
	},
	text: {
		primary: '#171717',
		secondary: '#525252',
		muted: '#A3A3A3',
		onAccent: '#FFFFFF',
	},
	accent: {
		primary: '#CA8A04',
		success: '#16A34A',
		warning: '#EA580C',
		danger: '#DC2626',
		info: '#2563EB',
	},
	levels: {
		beginner: '#16A34A',
		intermediate: '#2563EB',
		advanced: '#9333EA',
		pro: '#CA8A04',
	},
	status: {
		inGame: '#DC2626',
		waiting: '#16A34A',
		bench: '#A3A3A3',
	},
} as const;
