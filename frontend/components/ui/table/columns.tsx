"use client"

import { roleConfig } from "@/config/roleConfig";
import { statusConfig } from "@/config/statusConfig";
import { formatDate } from "@/helper/formatDate";
import { getInitials } from "@/helper/getInitials";
import { User } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import { Badge, KeyRound, MapPin, Pencil, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "../button";

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "id",
        header: "ID",
        size: 50,
        cell: ({ row }) => (
            <span className="text-muted-foreground text-xs">#{row.original.id}</span>
        ),
    },
    {
        accessorKey: "name",
        header: "Pengguna",
        cell: ({ row }) => {
            const { name, email, city } = row.original;
            return (
                <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
                        {getInitials(name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm truncate">{name}</span>
                        <span className="text-xs text-muted-foreground truncate">{email}</span>
                    </div>
                </div>
            );
        },
    },
    // {
    //     accessorKey: "city",
    //     header: "Kota",
    //     cell: ({ row }) => (
    //         <div className="flex items-center gap-1 text-sm text-muted-foreground">
    //             <MapPin className="h-3 w-3" />
    //             {row.original.city}
    //         </div>
    //     ),
    // },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            console.log("ROLE:", row.original.role);

            const cfg = roleConfig[row.original.role];

            return <div>{row.original.role}</div>;
        }
    },
    {
        accessorKey: "email_verified_at",
        header: "Verifikasi",
        cell: ({ row }) => {
            const verified = !!row.original.email_verified_at;
            return verified ? (
                <ShieldCheck className="h-4 w-4 text-[#3B6D11]" />
            ) : (
                <ShieldOff className="h-4 w-4 text-muted-foreground" />
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Bergabung",
        cell: ({ row }) => (
            <span className="text-sm">{formatDate(row.original.created_at)}</span>
        ),
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex items-center gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title="Edit"
                        onClick={() => console.log("edit", user.id)}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title="Reset password"
                        onClick={() => console.log("reset password", user.id)}
                    >
                        <KeyRound className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        title="Hapus"
                        onClick={() => console.log("delete", user.id)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            );
        },
    },
];