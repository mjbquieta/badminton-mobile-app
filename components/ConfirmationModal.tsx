import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

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
        className="flex-1 items-center justify-center bg-black/70"
        onPress={onClose}
      >
        <Pressable
          className="w-4/5 max-w-sm rounded-2xl bg-secondary border border-dark-100 overflow-hidden"
          onPress={() => {}}
        >
          {/* Content */}
          <View className="p-5">
            <Text className="text-light-100 text-lg font-semibold">{text}</Text>
          </View>

          {/* Actions */}
          <View className="flex-row border-t border-dark-100">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-4 items-center border-r border-dark-100 active:bg-dark-200"
            >
              <Text className="text-light-200 font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-4 items-center active:bg-dark-200"
            >
              <Text className="text-danger font-bold">Confirm</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ConfirmationModal;
