import { BadmintonPalette } from "@/constants/palette";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Text, TouchableOpacity, View } from "react-native";

type ScreenHeaderProps = {
	title: string;
	onBack: () => void;
};

const ScreenHeader = ({ title, onBack }: ScreenHeaderProps) => (
	<View className="px-6 pt-4 pb-2">
		<View className="flex-row items-center gap-3">
			<TouchableOpacity
				onPress={onBack}
				className="size-12 rounded-2xl bg-court-deep/30 items-center justify-center"
				accessibilityRole="button"
				accessibilityLabel="Go back"
			>
				<AntDesign
					name="left"
					size={24}
					color={BadmintonPalette.court.lime}
				/>
			</TouchableOpacity>
			<Text className="text-light-100 text-2xl font-bold">{title}</Text>
		</View>
	</View>
);

export default ScreenHeader;
