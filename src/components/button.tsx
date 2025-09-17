import { ComponentPropsWithoutRef, FC } from "react";
import { Pressable } from "react-native";
import { twMerge } from "tailwind-merge";

type ButtonProps = ComponentPropsWithoutRef<typeof Pressable> & {
  className?: string;
};

export const Button: FC<ButtonProps> = ({ className, ...props }) => (
  <Pressable
    className={twMerge(
      `flex justify-center items-center border border-blue-200 rounded-md bg-blue-400 px-4 py-0 w-fit text-white`,
      className
    )}
    {...props}
  />
);
