"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserRole } from "@/types/user";
import { gooeyToast } from "goey-toast";
import React, { useEffect, useState } from "react";

interface UserFormProps {
    url: string
    mode?: "create" | "edit";
    user?: User | null;
    method?: "PUT" | "POST";
}

interface Address {
    receiver_name: string;
    phone_number: string;
    address_line: string;
    city: string;
    postal_code: string;
    is_default: boolean;
}

export function UserForm({ url, mode = "create", user, method }: UserFormProps) {
    const [formData, setFormData] = useState<{
        name: string,
        password: string,
        email: string,
        role: UserRole,
        user_address: Address | null
    }>({
        name: "",
        email: "",
        password: "",
        role: "customer",
        user_address: null
    })

    const [showAddress, setShowAddress] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (mode == "edit" && user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: "",
                role: user.role,
                user_address: user.addresses?.[0]
                    ? {
                        receiver_name: user.addresses[0].receiver_name,
                        phone_number: user.addresses[0].phone_number,
                        address_line: user.addresses[0].address_line,
                        city: user.addresses[0].city,
                        postal_code: user.addresses[0].postal_code,
                        is_default: user.addresses[0].is_default,
                    } : null
            });

            setShowAddress(!!user.addresses?.length)
        }

        if (mode == "create") {
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "customer",
                user_address: null,
            });

            setShowAddress(false);
        }
    }, [user, mode])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        // Validasi sebelum submit
        if (formData.user_address) {
            // Validasi postal_code max 10 karakter
            if (formData.user_address.postal_code.length > 10) {
                setError("Kode pos maksimal 10 karakter");
                setIsLoading(false);
                return;
            }

            // Validasi phone_number max 20 karakter
            if (formData.user_address.phone_number.length > 20) {
                setError("Nomor telepon maksimal 20 karakter");
                setIsLoading(false);
                return;
            }

            // Validasi receiver_name max 100 karakter
            if (formData.user_address.receiver_name.length > 100) {
                setError("Nama penerima maksimal 100 karakter");
                setIsLoading(false);
                return;
            }

            // Validasi city max 100 karakter
            if (formData.user_address.city.length > 100) {
                setError("Kota maksimal 100 karakter");
                setIsLoading(false);
                return;
            }
        }

        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
        };

        if (formData.password.trim()) {
            payload.password = formData.password
        }

        if (formData.user_address) {
            Object.assign(payload, { user_address: formData.user_address });
        }

        try {
            const response = await fetch(url, {
                method: mode === "edit" ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Gagal menyimpan data");
            }

            gooeyToast.success("Pengguna berhasil ditambahkan");

            setFormData({
                name: "",
                email: "",
                password: "",
                role: "customer",
                user_address: null
            });
            setShowAddress(false);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            gooeyToast.error(
                err instanceof Error ? err.message : "Terjadi kesalahan"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddressChange = (field: keyof Address, value: string | boolean) => {
        setFormData({
            ...formData,
            user_address: {
                ...(formData.user_address || {
                    receiver_name: "",
                    phone_number: "",
                    address_line: "",
                    city: "",
                    postal_code: "",
                    is_default: false
                }),
                [field]: value
            }
        });
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <Input
                placeholder="Nama"
                value={formData.name}
                onChange={(e) => setFormData({
                    ...formData,
                    name: e.target.value
                })}
                required
            />

            <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({
                    ...formData,
                    email: e.target.value
                })}
                required
            />

            {mode === "create" && (
                <Input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            password: e.target.value,
                        })
                    }
                    required
                />
            )}

            <Select
                value={formData.role}
                onValueChange={(value) => setFormData({
                    ...formData,
                    role: value as UserRole
                })}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Role" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
            </Select>

            <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddress(!showAddress)}
                className="w-full"
            >
                {showAddress ? "Sembunyikan Alamat" : "Tambahkan Alamat"}
            </Button>

            {showAddress && (
                <div className="space-y-3 border p-4 rounded-md">
                    <h4 className="text-sm font-medium">Informasi Alamat</h4>

                    <Input
                        placeholder="Nama Penerima (max 100 karakter)"
                        maxLength={100}
                        value={formData.user_address?.receiver_name || ""}
                        onChange={(e) => handleAddressChange("receiver_name", e.target.value)}
                    />

                    <Input
                        placeholder="Nomor Telepon (max 20 karakter)"
                        maxLength={20}
                        value={formData.user_address?.phone_number || ""}
                        onChange={(e) => handleAddressChange("phone_number", e.target.value)}
                    />

                    <Input
                        placeholder="Alamat Lengkap"
                        value={formData.user_address?.address_line || ""}
                        onChange={(e) => handleAddressChange("address_line", e.target.value)}
                    />

                    <Input
                        placeholder="Kota (max 100 karakter)"
                        maxLength={100}
                        value={formData.user_address?.city || ""}
                        onChange={(e) => handleAddressChange("city", e.target.value)}
                    />

                    <Input
                        placeholder="Kode Pos (max 10 karakter)"
                        maxLength={10}
                        value={formData.user_address?.postal_code || ""}
                        onChange={(e) => handleAddressChange("postal_code", e.target.value)}
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_default"
                            checked={formData.user_address?.is_default || false}
                            onChange={(e) => handleAddressChange("is_default", e.target.checked)}
                        />
                        <label htmlFor="is_default" className="text-sm">
                            Jadikan alamat default
                        </label>
                    </div>
                </div>
            )}

            <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
        </form>
    );
}