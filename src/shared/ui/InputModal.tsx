import Ionicons from '@expo/vector-icons/Ionicons';
import { FC, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { getColor } from '@/src/shared/theme/getColor';

type InputModalProps = {
    isVisible: boolean;
    header?: string;
    closeButtonText?: string;
    submitButtonText?: string;
    onClose?: () => void;
    onSubmit?: (text: string) => void;
};

export const InputModal: FC<InputModalProps> = ({
    header,
    isVisible,
    onClose,
    onSubmit,
    closeButtonText = 'Close',
    submitButtonText = 'Submit',
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleClose = () => {
        setInputValue('');
        onClose?.();
    };

    return (
        <Modal animationType="fade" transparent visible={isVisible}>
            <View className="flex-1 items-center justify-center bg-overlay-color">
                <View className="w-[80%] max-w-[600px] rounded-lg border border-tabs-border-color bg-tabs-bg p-4">
                    <View className="flex flex-row items-center justify-between">
                        <Text className="text-lg text-text-color">{header}</Text>
                        <Pressable onPress={handleClose}>
                            <Ionicons
                                name="close-outline"
                                size={24}
                                color={getColor('text-color')}
                            />
                        </Pressable>
                    </View>
                    <View className="mt-10">
                        <TextInput
                            className="rounded border border-text-color px-2 py-1 text-text-color"
                            value={inputValue}
                            onChangeText={setInputValue}
                        />
                    </View>
                    <View className="mt-10 flex flex-row justify-end gap-2">
                        <Pressable
                            className="flex items-center justify-center rounded-md border border-neutral-button-border bg-neutral-button-bg px-2 py-1"
                            onPress={handleClose}
                        >
                            <Text className="text-lg text-text-color">{closeButtonText}</Text>
                        </Pressable>
                        <Pressable
                            className="flex items-center justify-center rounded-md border border-accent-border-color bg-accent-color px-2 py-1"
                            onPress={() => {
                                onSubmit?.(inputValue);
                                handleClose();
                            }}
                        >
                            <Text className="text-lg text-text-color">{submitButtonText}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
