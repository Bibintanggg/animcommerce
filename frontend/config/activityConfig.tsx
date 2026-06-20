import { ActivityType } from "@/types/activity-log";
import { AlertCircle, LogIn, Package, ShoppingCart, UserCheck } from "lucide-react";


export const activityConfig: Record<ActivityType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    checkout: {
        label: "Checkout",
        icon: <ShoppingCart className="h-3.5 w-3.5" />,
        color: "text-[#185FA5]",
        bg: "bg-[#E6F1FB]",
    },
    register: {
        label: "Registrasi",
        icon: <UserCheck className="h-3.5 w-3.5" />,
        color: "text-[#3B6D11]",
        bg: "bg-[#EAF3DE]",
    },
    login: {
        label: "Login",
        icon: <LogIn className="h-3.5 w-3.5" />,
        color: "text-[#5F5E5A]",
        bg: "bg-[#F1EFE8]",
    },
    order_shipped: {
        label: "Pesanan Dikirim",
        icon: <Package className="h-3.5 w-3.5" />,
        color: "text-[#854F0B]",
        bg: "bg-[#FAEEDA]",
    },
    payment_failed: {
        label: "Pembayaran Gagal",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
        color: "text-[#A32D2D]",
        bg: "bg-[#FCEBEB]",
    },
};