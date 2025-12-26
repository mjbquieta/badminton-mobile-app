export const PotatoPalette = {
	bg: {
		primary: "#2B1B12",
		surface: "#3C2A1E",
		border: "#4A3425",
	},
	text: {
		onDark: "#FFF7ED",
		muted: "#E7D9C2",
		placeholder: "#C4B39C",
	},
	accent: {
		gold: "#D8A34A",
		// Brighter so it's clearly visible on dark potato backgrounds.
		sprout: "#7AD957",
		// Brighter so delete/remove actions are clearly visible on dark backgrounds.
		danger: "#FF5A3D",
	},
} as const;
