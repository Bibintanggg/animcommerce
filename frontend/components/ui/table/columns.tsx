"use client";

import { roleConfig } from "@/config/roleConfig";
import { statusConfig } from "@/config/statusConfig";
import { formatDate } from "@/helper/formatDate";
import { getInitials } from "@/helper/getInitials";
import { User } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import {
  KeyRound,
  MapPin,
  Pencil,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { Badge } from "../badge";
import { Button } from "../button";
import { useRouter } from "next/navigation";

interface UserColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Customer", value: "customer" },
  { label: "Super Admin", value: "superadmin" },
];

export const columns = ({ onEdit, onDelete}: UserColumnsProps): ColumnDef<User>[] => [
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
            <span className="text-xs text-muted-foreground truncate">
              {email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "address",
    header: "Alamat",
    cell: ({ row }) => {
      const user = row.original;

      const addresses = user.addresses || [];
      const defaultAddress = addresses.find((addr) => addr.is_default);
      const mainAddress = defaultAddress || addresses[0];

      if (!mainAddress) {
        return <span className="text-sm text-muted-foreground">-</span>;
      }

      const addressText = `${mainAddress.address_line}, ${mainAddress.city}, ${mainAddress.postal_code}`;

      return (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="truncate max-w-[200px]">{addressText}</span>
          {mainAddress.is_default && (
            <Badge variant="outline" className="text-xs ml-1">
              Default
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as string;
      return value.includes(rowValue);
    },
    cell: ({ row }) => {
      const role = row.original.role;
      const cfg = roleConfig[role];

      // Tampilkan dengan Badge yang lebih baik
      const getRoleVariant = (role: string) => {
        switch (role) {
          case "admin":
            return "default";
          case "superadmin":
            return "destructive";
          default:
            return "secondary";
        }
      };

      return <Badge variant={getRoleVariant(role)}>{cfg?.label || role}</Badge>;
    },
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
            onClick={() => onEdit(user)}
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
            onClick={() => onDelete(user)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];
