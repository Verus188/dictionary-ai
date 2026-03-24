import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { getColor } from '@/src/shared/theme/getColor';

export const SpinningIcon = () => {
    const spinValue = useRef(new Animated.Value(0)).current;
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
        let isMounted = true;

        const spinOnce = () => {
            spinValue.setValue(0);
            animationRef.current = Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            });

            animationRef.current.start(({ finished }) => {
                if (finished && isMounted) {
                    spinOnce();
                }
            });
        };

        spinOnce();

        return () => {
            isMounted = false;
            animationRef.current?.stop();
        };
    }, [spinValue]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="refresh-outline" size={24} color={getColor('text-color')} />
        </Animated.View>
    );
};
