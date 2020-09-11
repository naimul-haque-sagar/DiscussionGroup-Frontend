export interface LoginResponseReturn {
    jwtToken: string;
    refreshToken: string;
    expiresAt: Date;
    username: string;
}