export interface LoginRequest {
    email: string,
    password: string
}

export interface LoginResponse {
    message: string
    data: {
        token: string
        user: {
            id: number
            name: string
            role: string
        }
    }
}

export interface RegisterRequest {
    name: string,
    email: string,
    password: string
}

export interface RegisterResponse {
    message: string
}