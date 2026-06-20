import { UserStatus } from "@/types/user";

export const statusConfig: Record<UserStatus, { label: string; className: string }> = {
    active: { label: "Aktif", className: "bg-[#EAF3DE] text-[#3B6D11]" },
    inactive: { label: "Nonaktif", className: "bg-[#F1EFE8] text-[#5F5E5A]" },
    banned: { label: "Banned", className: "bg-[#FCEBEB] text-[#A32D2D]" },
};