class AuthService {
    async login(credentials: LoginDto): Promise<AuthResponse> {
        const user = await this.validateUser(credentials);
        return {
        access_token: this.generateJWT(user),
        refresh_token: this.generateRefreshToken(user),
        expires_in: 3600
        };
    }

    private generateJWT(user: User): string {
        return jwt.sign({
        sub: user.id,
        role: user.role,
        permissions: this.getPermissions(user.role)
        }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    }
}