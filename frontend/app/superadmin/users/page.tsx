"use client";

import SectionTitle from "@/components/SectionTitle";
import StatCard from "@/components/StatCards";
import { columns, roleOptions } from "@/components/ui/table/columns";
import { DataTable } from "@/components/ui/table/data-table";
import { data } from "@/data/user-data";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateModal from "@/components/CreateModal";
import { UserForm } from "../../../components/forms/UserForm";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/services/users.service";
import { useState } from "react";
import { PaginationState } from "@tanstack/react-table";

export default function ManageUsers() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users", pagination.pageIndex, pagination.pageSize],
    queryFn: () => getUsers(pagination.pageIndex + 1, pagination.pageSize),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const filterFields = [
    {
      id: "role",
      label: "Role",
      type: "faceted" as const,
      options: roleOptions,
    },
  ];

  // ✅ Data untuk statistik (jika diperlukan)
  const usersData = data?.data || [];
  const totalUsers = usersData.length;
  const verifiedUsers = usersData.filter(
    (u) => u.email_verified_at !== null,
  ).length;
  // ... statistik lainnya

  return (
    <div className="p-10">
      {/* Bagian Statistik - Di-comment dulu sampai data siap */}
      {/* <section>
        <SectionTitle
          title="Statistik Pengguna"
          sub="Ringkasan kondisi seluruh akun pengguna di platform"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            label="Total Pengguna"
            value={totalUsers}
            icon={<Users className="h-4 w-4 text-[#185FA5]" />}
            accent="bg-[#E6F1FB]"
            sub="semua role"
          />
          <StatCard
            label="Terverifikasi"
            value={verifiedUsers}
            icon={<ShieldCheck className="h-4 w-4 text-[#3B6D11]" />}
            accent="bg-[#EAF3DE]"
            sub={`${Math.round((verifiedUsers / totalUsers) * 100)}% dari total`}
          />
        </div>
      </section> */}

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
          columns={columns}
          data={usersData}
          isLoading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={data ? Math.ceil(data.total / pagination.pageSize) : -1}
          filterFields={filterFields}
          emptyMessage="Belum ada pengguna terdaftar."
        />
      </section>
    </div>
  );
}
