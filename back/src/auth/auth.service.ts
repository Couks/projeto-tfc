import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  hashPassword,
  verifyPassword,
  signSession,
} from '../common/utils/auth.utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly sessionSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secret = this.configService.get<string>('auth.secret');
    if (!secret) {
      throw new Error('AUTH_SECRET is not configured or is empty');
    }
    this.sessionSecret = secret;
  }

  /**
   * Authenticates a user with email and password
   * @param loginDto Login credentials
   * @returns Signed session cookie value
   */
  async login(loginDto: LoginDto): Promise<string> {
    const { email, password } = loginDto;

    this.logger.log(`Login attempt for email: ${email}`);

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      this.logger.warn(`Invalid login attempt for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      this.logger.warn(`Invalid password for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`Successful login for user: ${user.id}`);

    // Create signed session
    return signSession({ userId: user.id }, this.sessionSecret);
  }

  /**
   * Registers a new user
   * @param registerDto Registration data
   * @returns Signed session cookie value
   */
  async register(registerDto: RegisterDto): Promise<string> {
    const { email, password, name } = registerDto;

    this.logger.log(`Registration attempt for email: ${email}`);

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed: email already exists: ${email}`);
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });

    this.logger.log(`User registered successfully: ${user.id}`);

    return signSession({ userId: user.id }, this.sessionSecret);
  }

  /**
   * Retrieves current user information
   * @param userId User ID from session
   * @returns User data
   */
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        avatarUrl: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
