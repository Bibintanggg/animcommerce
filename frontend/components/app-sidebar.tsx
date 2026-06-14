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

export function AppSidebar() {
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
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/superadmin/dashboard">
                                    <LayoutDashboard size={20} />
                                    <span className="text-base font-medium">Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/admin/products">
                                    <Package size={20} />
                                    <span className="text-base font-medium">Products</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/admin/orders">
                                    <ShoppingCart size={20} />
                                    <span className="text-base font-medium">Orders</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/superadmin/users">
                                    <Users size={20} />
                                    <span className="text-base font-medium">Users</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/settings">
                                    <Settings size={20} />
                                    <span className="text-base font-medium">Settings</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
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
                                                Bintang
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Superadmin
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

                                <DropdownMenuItem>
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