import { ComponentPropsWithoutRef, FC } from 'react';
import { Pressable } from 'react-native';
import { twMerge } from 'tailwind-merge';

type ButtonProps = ComponentPropsWithoutRef<typeof Pressable> & {
    className?: string;
};

export const Button: FC<ButtonProps> = ({ className, ...props }) => (
    <Pressable
        className={twMerge(
            'flex justify-center items-center border border-accent-border-color rounded-md bg-accent-color px-4 py-0 w-fit',
            className,
        )}
        {...props}
    />
);
