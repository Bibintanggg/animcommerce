import { LucideIcon } from "lucide-react";

export type ColumnConfig<T> =
    | { type: "text"; header: string; key: keyof T; className?: string }
    | {
        type: "avatar";
        header: string;
        titleKey: keyof T;
        subtitleKey?: keyof T;
        imageKey?: keyof T;
    }
    | {
        type: "badge";
        header: string;
        key: keyof T;
        variantMap?: Record<
            string,
            "default" | "secondary" | "destructive" | "outline"
        >;
        labelMap?: Record<string, string>;
    }
    | { type: "date"; header: string; key: keyof T }
    | {
        type: "iconStatus";
        header: string;
        key: keyof T;
        trueIcon: LucideIcon;
        falseIcon: LucideIcon;
    }
    | {
        type: "custom";
        header: string;
        render: (row: T) => React.ReactNode;
    };

export interface ActionConfig<T> {
    icon: LucideIcon;
    label: string;
    onClick: (row: T) => void;
    className?: string;
    show?: (row: T) => boolean;
}