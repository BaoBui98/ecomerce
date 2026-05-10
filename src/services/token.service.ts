import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { EnvironmentVariables } from '../common/enviroment.common';

export interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

@Injectable()
export class TokenService {
    private readonly env: EnvironmentVariables;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.env = new EnvironmentVariables(this.configService);
    }

    /**
     * Tạo Access Token (mặc định hết hạn sau 15 phút)
     */
    async generateAccessToken(payload: TokenPayload): Promise<string> {
        return this.jwtService.signAsync(payload, {
            secret: this.env.JWT_ACCESS_SECRET,
            expiresIn: this.env.JWT_ACCESS_EXPIRES_IN as StringValue,
        });
    }

    /**
     * Tạo Refresh Token (mặc định hết hạn sau 7 ngày)
     */
    async generateRefreshToken(payload: TokenPayload): Promise<string> {
        return this.jwtService.signAsync(payload, {
            secret: this.env.JWT_REFRESH_SECRET,
            expiresIn: this.env.JWT_REFRESH_EXPIRES_IN as StringValue,
        });
    }

    /**
     * Xác thực Access Token
     */
    async verifyAccessToken(token: string): Promise<any> {
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: this.env.JWT_ACCESS_SECRET,
            });
        } catch (error) {
            throw new UnauthorizedException('Access Token không hợp lệ hoặc đã hết hạn');
        }
    }

    /**
     * Xác thực Refresh Token
     */
    async verifyRefreshToken(token: string): Promise<any> {
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: this.env.JWT_REFRESH_SECRET,
            });
        } catch (error) {
            throw new UnauthorizedException('Refresh Token không hợp lệ hoặc đã hết hạn');
        }
    }
}
