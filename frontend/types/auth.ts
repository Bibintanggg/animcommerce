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