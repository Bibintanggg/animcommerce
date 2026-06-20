export type UserStatus = "active" | "inactive" | "banned";
export type UserRole = "superadmin" | "admin" | "customer";

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    email_verified_at: string | null;
    last_login_at: string | null;
    created_at: string;
    city: string;
    lat: number;
    lng: number;
}

export interface UserResponse {
    message: string
    data: User[]
}