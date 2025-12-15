import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; tokens: AuthTokens }> {
    // Hash password
    const password_hash = await this.hashPassword(registerDto.password);

    // Create user
    const { password, ...userData } = registerDto;
    const user = await this.usersService.create({
      ...userData,
      password_hash,
    } as any);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Remove sensitive data before returning
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: Partial<User>; tokens: AuthTokens }> {
    // Find user with password
    const user = await this.usersService.findByEmail(loginDto.email, true);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is active
    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await this.comparePasswords(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Generate new tokens
      return await this.generateTokens(payload.sub, payload.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.usersService.findOne(userId);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  private async generateTokens(userId: string, email: string): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: userId,
      email,
    };

    const accessTokenExpiry = this.configService.get<string>('JWT_ACCESS_EXPIRY', '15m');
    const refreshTokenExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d');

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessTokenExpiry,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiry,
      }),
    ]);

    // Parse expiry time to seconds (simplified - assumes 'm' for minutes)
    const expiresIn = parseInt(accessTokenExpiry) * 60;

    return {
      access_token,
      refresh_token,
      expires_in: expiresIn,
    };
  }
}
