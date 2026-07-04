"use client";

import SectionTitle from "@/components/SectionTitle";
import StatCard from "@/components/StatCards";
import { roleOptions } from "@/components/ui/table/columns"; // cuma roleOptions yg kepake
import { DataTable } from "@/components/ui/table/data-table";
import {
  Pencil,
  ShieldCheck,
  ShieldOff,
  TrendingUp,
  UserCheck,
  UserMinus,
  Users,
  UserX,
  Plus,
  KeyRound,
  Trash2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateModal from "@/components/CreateModal";
import { UserForm } from "../../../components/forms/UserForm";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getUsers } from "@/services/users.service";
import { useEffect, useState } from "react";
import { PaginationState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { Badge } from "@/components/ui/badge";

export default function ManageUsers() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["users", pagination.pageIndex, pagination.pageSize, debouncedSearch],
    queryFn: () =>
      getUsers(pagination.pageIndex + 1, pagination.pageSize, debouncedSearch),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  const filterFields = [
    {
      id: "role",
      label: "Role",
      type: "faceted" as const,
      options: roleOptions,
    },
  ];

  const usersData: User[] = data?.data || [];
  const totalUsers = usersData.length;
  const verifiedUsers = usersData.filter(
    (u) => u.email_verified_at !== null,
  ).length;

  const handleResetPassword = (user: User) => {
    // TODO: panggil endpoint reset password, atau buka modal konfirmasi
    console.log("reset password for", user.id);
  };

  const handleDelete = (user: User) => {
    // TODO: buka confirm dialog, baru call API delete pas confirm
    setDeleteTarget(user);
  };

  return (
    <div className="p-10">

      <section className="mt-10">
        <div className="flex items-start justify-between gap-4 mb-6">
          <SectionTitle
            title="Manajemen Pengguna"
            sub="Daftar lengkap seluruh pengguna, bisa difilter dan dicari"
          />

          <CreateModal
            title="Tambah Pengguna"
            description="Buat akun pengguna baru"
            url="http://localhost:8080/api/superadmin/users"
            trigger={<Button>Tambah Pengguna</Button>}
          >
            <UserForm url="http://localhost:8080/api/superadmin/users" />
          </CreateModal>
        </div>

        <DataTable
          data={usersData}
          columns={[
            { type: "avatar", header: "Pengguna", titleKey: "name", subtitleKey: "email" },
            {
              type: "custom",
              header: "Alamat",
              render: (user) => {
                const addresses = user.addresses || [];
                const mainAddress = addresses.find((a) => a.is_default) || addresses[0];
                if (!mainAddress) return <span className="text-sm text-muted-foreground">-</span>;
                return (
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[200px]">
                      {mainAddress.address_line}, {mainAddress.city}, {mainAddress.postal_code}
                    </span>
                    {mainAddress.is_default && (
                      <Badge variant="outline" className="text-xs ml-1">Default</Badge>
                    )}
                  </div>
                );
              },
            },
            {
              type: "badge",
              header: "Role",
              key: "role",
              variantMap: { admin: "default", superadmin: "destructive", customer: "secondary" },
              labelMap: { admin: "Admin", superadmin: "Super Admin", customer: "Customer" },
            },
            { type: "iconStatus", header: "Verifikasi", key: "email_verified_at", trueIcon: ShieldCheck, falseIcon: ShieldOff },
            { type: "date", header: "Bergabung", key: "created_at" },
          ]}
          actions={[
            { icon: Pencil, label: "Edit", onClick: (u) => router.push(`/users/${u.id}`) },
            { icon: KeyRound, label: "Reset password", onClick: handleResetPassword },
            { icon: Trash2, label: "Hapus", onClick: handleDelete, className: "text-destructive" },
          ]}
          searchValue={search}
          onSearchChange={setSearch}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={data?.totalPages ?? 1}
        />

        {isFetching && !isLoading && (
          <span className="text-xs text-muted-foreground">Memperbarui data...</span>
        )}
      </section>
    </div>
  );
}