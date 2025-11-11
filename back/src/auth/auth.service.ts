import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { hashPassword, verifyPassword } from '../common/utils/auth.utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Autentica um usuário usando email e senha
   * @param loginDto Credenciais de login
   * @returns Valor do cookie de sessão assinado
   */
  async login(loginDto: LoginDto): Promise<string> {
    const { email, password } = loginDto;

    this.logger.log(`Login attempt for email: ${email}`);

    // Procurar usuário pelo email
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

    // Verificar se a senha está correta
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      this.logger.warn(`Invalid password for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Atualizar o timestamp do último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`Successful login for user: ${user.id}`);

    // Gerar token JWT
    return this.jwtService.sign({
      userId: user.id,
      sub: user.id,
    });
  }

  /**
   * Registra um novo usuário
   * @param registerDto Dados de registro
   * @returns Valor do cookie de sessão assinado
   */
  async register(registerDto: RegisterDto): Promise<string> {
    const { email, password, name } = registerDto;

    this.logger.log(`Registration attempt for email: ${email}`);

    // Verifica se já existe usuário com o email
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed: email already exists: ${email}`);
      throw new ConflictException('Email already registered');
    }

    // Gera hash da senha
    const passwordHash = await hashPassword(password);

    // Cria novo usuário
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

    // Gerar token JWT
    return this.jwtService.sign({
      userId: user.id,
      sub: user.id,
    });
  }

  /**
   * Pega as informações do usuário logado
   * @param userId ID do usuário da sessão
   * @returns Dados do usuário
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
