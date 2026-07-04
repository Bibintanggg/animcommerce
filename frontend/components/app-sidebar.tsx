"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    ChevronUp,
    Shield,
    LucideIcon,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import { login } from "@/services/auth.service";
import { useRouter } from "next/navigation";

type MenuItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    roles: UserRole[];
};

export function AppSidebar() {
    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null

    const router = useRouter()

    const logout = async () => {
        try {
            localStorage.removeItem("token")
            localStorage.removeItem("user")

            router.push('/login')
        } catch (error) {
            console.log(error)
        }
    }

    const menus: MenuItem[] = [
        {
            title: "Dashboard",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
            roles: ["admin", "superadmin"],
        },
        {
            title: "Products",
            href: "/admin/products",
            icon: Package,
            roles: ["admin", "superadmin"],
        },
        {
            title: "Orders",
            href: "/admin/orders",
            icon: ShoppingCart,
            roles: ["admin", "superadmin"],
        },
        {
            title: "Users",
            href: "/superadmin/users",
            icon: Users,
            roles: ["superadmin"],
        },
        {
            title: "Settings",
            href: "/settings",
            icon: Settings,
            roles: ["admin", "superadmin"],
        },
    ];
    return (
        <Sidebar>
            <SidebarHeader className="border-b">
                <div className="flex items-center gap-3 px-2 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                        <Shield className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="font-semibold">NIHON</h2>
                        <p className="text-xs text-muted-foreground">
                            Superadmin Panel
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-sm">Main Menu</SidebarGroupLabel>

                    <SidebarMenu className="space-y-2">
                        {menus
                            .filter((menu) => menu.roles.includes(user?.role))
                            .map((menu) => {
                                const Icon = menu.icon;

                                return (
                                    <SidebarMenuItem key={menu.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={menu.href}>
                                                <Icon size={20} />
                                                <span className="text-base font-medium">
                                                    {menu.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                            B
                                        </div>

                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-medium">
                                                {user?.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {user?.role}
                                            </span>
                                        </div>
                                    </div>

                                    <ChevronUp className="ml-auto h-4 w-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                side="top"
                                align="end"
                                className="w-56"
                            >
                                <DropdownMenuItem>
                                    Profile
                                </DropdownMenuItem>

                                <DropdownMenuItem>
                                    Settings
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={logout}>
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}