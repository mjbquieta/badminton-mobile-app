import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

const ConfirmationModal = ({
  text,
  onConfirm,
  visible,
  onClose,
}: {
  text: string;
  onConfirm: () => void;
  visible: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50"
        onPress={onClose}
      >
        <Pressable className="w-4/5 rounded-xl bg-white p-5" onPress={() => {}}>
          <Text className="text-lg font-bold text-primary">{text}</Text>
          <View className="flex-row justify-between">
            <Pressable onPress={onClose} className="mt-4 self-end">
              <Text className="text-lg font-bold text-red-500">Close</Text>
            </Pressable>
            <Pressable onPress={onConfirm} className="mt-4 self-end">
              <Text className="text-lg font-bold text-primary">Confirm</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ConfirmationModal;
