"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types/user";
import React, { FormEvent, useState } from "react";

interface UserFormProps {
    url: string
}

export function UserForm({ url }: UserFormProps) {
    const [formData, setFormData] = useState<{
        name: string,
        password: string,
        email: string,
        role: UserRole
    }>({
        name: "",
        email: "",
        password: "",
        role: "customer"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        console.log(result);
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <Input placeholder="Nama"
                value={formData.name}
                onChange={(e) => setFormData({
                    ...formData,
                    name: e.target.value
                })} />

            <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({
                    ...formData,
                    email: e.target.value
                })}
            />

            <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({
                    ...formData,
                    password: e.target.value
                })}
            />

            <Select value={formData.role}
                onValueChange={(value) => setFormData({
                    ...formData,
                    role: value as UserRole
                })}>

                <SelectTrigger>
                    <SelectValue placeholder="role" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="admin">
                        Admin
                    </SelectItem>
                    <SelectItem value="superadmin">
                        Super Admin
                    </SelectItem>
                    <SelectItem value="customer">
                        Customer
                    </SelectItem>
                </SelectContent>
            </Select>

            <Button className="w-full" type="submit">
                Simpan
            </Button>
        </form>
    );
}