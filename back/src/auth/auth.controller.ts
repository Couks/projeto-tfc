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
    summary: 'Login de usuário',
    description:
      'Autentica usuário com email e senha. Retorna um cookie de sessão em caso de sucesso.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login realizado com sucesso, cookie de sessão definido',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Credenciais inválidas' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Corpo da requisição inválido' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const nodeEnv = process.env.NODE_ENV;
    const isProduction = nodeEnv === 'production';

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
    summary: 'Registro de usuário',
    description:
      'Cria uma nova conta de usuário com email e senha. Retorna um cookie de sessão em caso de sucesso.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Registro realizado com sucesso, cookie de sessão definido',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dados de registro inválidos' })
  @ApiConflictResponse({
    description: 'E-mail já cadastrado',
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
    summary: 'Logout de usuário',
    description: 'Destrói a sessão atual e limpa o cookie de sessão.',
  })
  @ApiCookieAuth('session-auth')
  @ApiOkResponse({
    description: 'Logout realizado com sucesso',
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
    summary: 'Obter usuário atual',
    description:
      'Obtém informações do usuário autenticado a partir da sessão. Requer cookie de sessão válido.',
  })
  @ApiCookieAuth('session-auth')
  @ApiOkResponse({
    description: 'Retorna dados do usuário atual',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'clx123abc' },
        email: { type: 'string', example: 'user@example.com' },
        name: { type: 'string', example: 'João Silva', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Não autenticado ou sessão inválida',
  })
  async me(@CurrentUser() userId: string) {
    return this.authService.me(userId);
  }
}
