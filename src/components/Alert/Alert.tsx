import { HTMLAttributes } from "react";
import { CheckCircle, Info, WarningCircle, XCircle } from "phosphor-react";

type AlertProps = {
    title?: string;
    description: string;
    variant: 'solid' | 'outline';
    action: 'default' | 'info' | 'success' | 'warning' | 'error';
    className?: string;
} & HTMLAttributes<HTMLDivElement>;

const VARIANT_ACTION_CLASSES = {
    solid: {
        default: 'bg-background-50 border-transparent',
        info: 'bg-info border-transparent',
        success: 'bg-success border-transparent',
        warning: 'bg-warning border-transparent',
        error: 'bg-error border-transparent',
    },
    outline: {
        default: 'bg-background border border-border-100',
        info: 'bg-background border border-border-100',
        success: 'bg-background border border-border-100',
        warning: 'bg-background border border-border-100',
        error: 'bg-background border border-border-100',
    },
} as const;

const ICON_CLASSES = {
    default: 'text-950',
    info: 'text-info-800',
    success: 'text-success-800',
    warning: 'text-warning-800',
    error: 'text-error-800',
} as const;

const TEXT_COLOR_CLASSES = {
    default: 'text-950',
    info: 'text-info-800',
    success: 'text-success-800',
    warning: 'text-warning-800',
    error: 'text-error-800',
} as const;

export const Alert = ({
    variant = 'solid',
    title,
    description,
    action = 'default',
    className,
    ...props
}: AlertProps) => {
    const icons = {
        default: <CheckCircle size={18} />,
        info: <Info size={18} />,
        success: <CheckCircle size={18} />,
        warning: <WarningCircle size={18} />,
        error: <XCircle size={18} />,
    };
    const baseClasses = 'alert-wrapper flex items-start gap-2 w-[384px] py-3 px-4 font-inherit rounded-md';
    const variantClasses = VARIANT_ACTION_CLASSES[variant][action];
    const iconClasses = ICON_CLASSES[action];
    const hasHeading = Boolean(title);

    return (
        <div className={`${baseClasses} ${variantClasses} ${className ?? ''}`} {...props}>
            <span className={`mt-0.5 ${iconClasses}`}>{icons[action]}</span>
            <div>
                {hasHeading && (
                    <div className={`font-medium mb-0.5 ${TEXT_COLOR_CLASSES[action]}`}>{title}</div>
                )}
                <div className={`font-light ${hasHeading ? 'text-sm' : 'text-base'} ${!hasHeading ? TEXT_COLOR_CLASSES[action] : 'text-700'}`}>{description}</div>
            </div>
        </div>
    );
};