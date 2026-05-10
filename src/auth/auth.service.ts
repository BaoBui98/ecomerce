import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { PasswordService } from '../services/password.service';
import { TokenService } from '../services/token.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) { }

  /**
   * Đăng ký tài khoản người dùng mới
   */
  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại trên hệ thống');
    }

    // Mã hóa mật khẩu trước khi lưu trữ
    const hashedPassword = await this.passwordService.hash(createUserDto.password);

    const user = await this.userRepository.createUser({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.USER,
    });

    // Loại bỏ mật khẩu khỏi kết quả trả về
    const { password, ...result } = user;
    return result;
  }

  /**
   * Đăng nhập người dùng và sinh JWT Tokens
   */
  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isPasswordMatch = await this.passwordService.compare(loginDto.password, user?.password as string);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Loại bỏ mật khẩu khỏi thông tin user trả về
    const { password, ...result } = user;

    // Sinh cặp Access Token và Refresh Token
    const accessToken = await this.tokenService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await this.tokenService.generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: result,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Lấy thông tin profile người dùng bằng email
   */
  async getProfile(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại trên hệ thống');
    }

    const { password, ...result } = user;
    return result;
  }
}
