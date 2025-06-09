import * as react from 'react';
import { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonProps = {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;
declare const Button: ({ children, variant, size, className, ...props }: ButtonProps) => react.JSX.Element;

export { Button };
