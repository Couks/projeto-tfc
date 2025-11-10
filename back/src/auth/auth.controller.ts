import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCookieAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UnifiedGuard } from '../common/guards/unified.guard';
import { RequireAuth } from '../common/decorators/require-auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Login endpoint
   * @param loginDto Login credentials
   * @param res Express response object
   * @returns Success status
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password. Returns a session cookie on success.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Successfully logged in, session cookie set',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Credenciais inválidas' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const nodeEnv = process.env.NODE_ENV;
    const isProduction = nodeEnv === 'production';
    this.logger.log(`[ENV] NODE_ENV in login: ${nodeEnv}`);
    this.logger.log(`[ENV] Cookie secure flag: ${isProduction}`);

    const signedSession = await this.authService.login(loginDto);

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax' as const, // Permite cookies em navegação cross-site
      ...(isProduction && { domain: '.matheuscastroks.com.br' }),
    };

    res.cookie('admin_session', signedSession, cookieOptions);

    return { ok: true };
  }

  /**
   * Register endpoint
   * @param registerDto Registration data
   * @param res Express response object
   * @returns Success status
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User registration',
    description:
      'Create a new user account with email and password. Returns a session cookie on success.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Successfully registered, session cookie set',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid registration data' })
  @ApiConflictResponse({
    description: 'Email already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'E-mail já cadastrado' },
      },
    },
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const nodeEnv = process.env.NODE_ENV;
    const isProduction = nodeEnv === 'production';
    this.logger.log(`[ENV] NODE_ENV in register: ${nodeEnv}`);
    this.logger.log(`[ENV] Cookie secure flag: ${isProduction}`);

    const signedSession = await this.authService.register(registerDto);

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax' as const, // Permite cookies em navegação cross-site
      ...(isProduction && { domain: '.matheuscastroks.com.br' }),
    };

    res.cookie('admin_session', signedSession, cookieOptions);

    return { ok: true };
  }

  /**
   * Logout endpoint
   * @param res Express response object
   * @returns Success status
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User logout',
    description: 'Destroy current session and clear session cookie.',
  })
  @ApiCookieAuth('session-auth')
  @ApiOkResponse({
    description: 'Successfully logged out',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
      },
    },
  })
  logout(@Res({ passthrough: true }) res: Response) {
    const nodeEnv = process.env.NODE_ENV;
    const isProduction = nodeEnv === 'production';
    this.logger.log(`[ENV] NODE_ENV in logout: ${nodeEnv}`);
    this.logger.log(`[ENV] Cookie secure flag: ${isProduction}`);

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      path: '/',
      ...(isProduction && { domain: '.matheuscastroks.com.br' }),
    };

    res.clearCookie('admin_session', cookieOptions);

    return { ok: true };
  }

  /**
   * Get current user endpoint
   * @param userId Current user ID from session
   * @returns User data
   */
  @Get('me')
  @UseGuards(UnifiedGuard)
  @RequireAuth()
  @ApiOperation({
    summary: 'Get current user',
    description:
      'Get authenticated user information from session. Requires valid session cookie.',
  })
  @ApiCookieAuth('session-auth')
  @ApiOkResponse({
    description: 'Returns current user data',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clx123abc' },
        email: { type: 'string', example: 'user@example.com' },
        name: { type: 'string', example: 'John Doe', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated or invalid session',
  })
  async me(@CurrentUser() userId: string) {
    return this.authService.me(userId);
  }
}
