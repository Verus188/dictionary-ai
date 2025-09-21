import Ionicons from "@expo/vector-icons/Ionicons";
import { FC, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

type CardModalProps = {
  isVisible: boolean;
  header?: string;
  closeButtonText?: string;
  submitButtonText?: string;
  onClose?: () => void;
  onSubmit?: (text: string) => void;
};

export const InputModal: FC<CardModalProps> = ({
  header,
  isVisible,
  onClose,
  onSubmit,
  closeButtonText = "Close",
  submitButtonText = "Submit",
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleClose = () => {
    setInputValue("");
    onClose?.();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible}>
      <View className="flex-1 items-center justify-center bg-black/30">
        <View className="w-[80%] max-w-[600px] bg-tabs-bg border border-tabs-border-color flex flex-col gap-10 p-4 rounded-lg">
          <View className="flex flex-row justify-between items-center">
            <Text className="text-text-color text-lg">{header}</Text>
            <Pressable onPress={handleClose}>
              <Ionicons name="close-outline" size={24} color="white" />
            </Pressable>
          </View>
          <View>
            <TextInput
              className="border border-text-color text-text-color rounded px-2 py-1"
              value={inputValue}
              onChangeText={setInputValue}
            />
          </View>
          <View className="flex flex-row justify-end gap-2">
            <Pressable
              className="flex justify-center items-center rounded-md bg-gray-600 border border-gray-400 px-2 py-1"
              onPress={handleClose}
            >
              <Text className="text-white text-lg">{closeButtonText}</Text>
            </Pressable>
            <Pressable
              className="flex justify-center items-center rounded-md bg-blue-400 border border-blue-200 px-2 py-1"
              onPress={() => {
                onSubmit?.(inputValue);
                handleClose();
              }}
            >
              <Text className="text-white text-lg">{submitButtonText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
