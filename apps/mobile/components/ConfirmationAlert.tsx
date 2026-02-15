import { Alert } from "react-native";

const ConfirmationAlert = ({
  title,
  message,
  onConfirm,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
}) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: "Cancel",
        onPress: () => {
          return;
        },
        style: "cancel",
      },
      {
        text: "Yes, Confirm",
        onPress: () => {
          onConfirm();
        },
        style: "destructive",
      },
    ],
    { cancelable: false }
  );
};

export default ConfirmationAlert;
