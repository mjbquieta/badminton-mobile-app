import { BadmintonPalette } from "@/constants/palette";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Animated, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastType = "success" | "error" | "info";

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const toastConfig: Record<
  ToastType,
  { icon: React.ReactNode; bgColor: string; borderColor: string }
> = {
  success: {
    icon: (
      <AntDesign
        name="check-circle"
        size={18}
        color={BadmintonPalette.accent.success}
      />
    ),
    bgColor: `${BadmintonPalette.accent.success}15`,
    borderColor: `${BadmintonPalette.accent.success}40`,
  },
  error: {
    icon: (
      <MaterialCommunityIcons
        name="alert-circle"
        size={20}
        color={BadmintonPalette.accent.danger}
      />
    ),
    bgColor: `${BadmintonPalette.accent.danger}15`,
    borderColor: `${BadmintonPalette.accent.danger}40`,
  },
  info: {
    icon: (
      <AntDesign
        name="info-circle"
        size={18}
        color={BadmintonPalette.accent.info}
      />
    ),
    bgColor: `${BadmintonPalette.accent.info}15`,
    borderColor: `${BadmintonPalette.accent.info}40`,
  },
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    ({ message, type = "success", duration = 2500 }: ToastConfig) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast({ message, type, duration });
      setVisible(true);

      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      timeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setVisible(false);
          setToast(null);
        });
      }, duration);
    },
    [translateY, opacity]
  );

  const config = toast
    ? toastConfig[toast.type || "success"]
    : toastConfig.success;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && toast && (
        <Animated.View
          style={{
            position: "absolute",
            top: insets.top + 10,
            left: 16,
            right: 16,
            zIndex: 9999,
            transform: [{ translateY }],
            opacity,
          }}
        >
          <View
            className="flex-row items-center rounded-xl px-4 py-3"
            style={{
              backgroundColor: BadmintonPalette.bg.surface,
              borderWidth: 1,
              borderColor: config.borderColor,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="mr-3">{config.icon}</View>
            <Text
              className="flex-1 text-sm font-medium"
              style={{ color: BadmintonPalette.text.primary }}
              numberOfLines={2}
            >
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};
