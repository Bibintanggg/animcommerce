"use client"

import SectionTitle from "@/components/SectionTitle";
import StatCard from "@/components/StatCards";
import { columns } from "@/components/ui/table/columns";
import { DataTable } from "@/components/ui/table/data-table";
import { data } from "@/data/user-data";
import { Pencil, ShieldCheck, ShieldOff, TrendingUp, UserCheck, UserMinus, Users, UserX, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateModal from "@/components/CreateModal";
import { UserForm } from "../../../components/forms/UserForm";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/services/users.service";

export default function ManageUsers() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
    })

    // const totalUsers = data.length;
    // const activeUsers = data.filter((u) => u.status === "active").length;
    // const inactiveUsers = data.filter((u) => u.status === "inactive").length;
    // const bannedUsers = data.filter((u) => u.status === "banned").length;
    // const unverifiedUsers = data.filter((u) => u.email_verified_at === null).length;
    // const adminUsers = data.filter((u) => u.role === "admin").length;
    // const editorUsers = data.filter((u) => u.role === "superadmin").length;
    // const viewerUsers = data.filter((u) => u.role === "customer").length;
    // const verifiedUsers = data.filter((u) => u.email_verified_at !== null).length;
    // const recentRegistered = data.filter((u) => {
    //     const d = new Date(u.created_at);
    //     const cutoff = new Date("2024-05-01");
    //     return d >= cutoff;
    // }).length;


    return (
        <div className="p-10">
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
                        label="Pengguna Aktif"
                        value={activeUsers}
                        icon={<UserCheck className="h-4 w-4 text-[#3B6D11]" />}
                        accent="bg-[#EAF3DE]"
                        sub={`${Math.round((activeUsers / totalUsers) * 100)}% dari total`}
                    />
                    <StatCard
                        label="Nonaktif"
                        value={inactiveUsers}
                        icon={<UserMinus className="h-4 w-4 text-[#5F5E5A]" />}
                        accent="bg-[#F1EFE8]"
                    />
                    <StatCard
                        label="Dibanned"
                        value={bannedUsers}
                        icon={<UserX className="h-4 w-4 text-[#A32D2D]" />}
                        accent="bg-[#FCEBEB]"
                    />
                    <StatCard
                        label="Belum Verifikasi"
                        value={unverifiedUsers}
                        icon={<ShieldOff className="h-4 w-4 text-[#854F0B]" />}
                        accent="bg-[#FAEEDA]"
                        sub="email belum konfirmasi"
                    />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <StatCard
                        label="Admin"
                        value={adminUsers}
                        icon={<ShieldCheck className="h-4 w-4 text-[#3C3489]" />}
                        accent="bg-[#EEEDFE]"
                    />
                    <StatCard
                        label="Editor"
                        value={editorUsers}
                        icon={<Pencil className="h-4 w-4 text-[#185FA5]" />}
                        accent="bg-[#E6F1FB]"
                    />
                    <StatCard
                        label="Viewer / Customer"
                        value={viewerUsers}
                        icon={<Users className="h-4 w-4 text-[#854F0B]" />}
                        accent="bg-[#FAEEDA]"
                    />
                    <StatCard
                        label="Registrasi Baru"
                        value={recentRegistered}
                        icon={<TrendingUp className="h-4 w-4 text-[#3B6D11]" />}
                        accent="bg-[#EAF3DE]"
                        sub="sejak Mei 2024"
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
                        trigger={
                            <Button>
                                Tambah Pengguna
                            </Button>
                        }
                    >
                        <UserForm url="http://localhost:8080/api/superadmin/users" />
                    </CreateModal>
                </div>

                <DataTable
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    filterFields={[
                        { value: "name", placeholder: "Cari nama atau email..." },
                        {
                            value: "role",
                            options: [
                                { label: "Admin", value: "admin" },
                                { label: "Superadmin", value: "superadmin" },
                                { label: "Customer", value: "customer" },
                            ],
                        },
                    ]}
                />
            </section>

        </div>
    )
}