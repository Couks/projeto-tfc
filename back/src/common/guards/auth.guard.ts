import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

export interface SessionData {
  userId: string;
}

export interface RequestWithAuthSession extends Request {
  authSession: SessionData;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private readonly authSecret: string;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('auth.secret');
    if (!secret) {
      throw new Error('AUTH_SECRET is not configured or is empty');
    }
    this.authSecret = secret;
  }

  /**
   * Verifies signed session cookie
   * @param signed Signed cookie value
   * @returns Decoded session data or null
   */
  private verifySignedCookie(signed: string): SessionData | null {
    if (!signed) return null;

    const lastDot = signed.lastIndexOf('.');
    if (lastDot <= 0) return null;

    const raw = signed.slice(0, lastDot);
    const sig = signed.slice(lastDot + 1);

    const check = crypto
      .createHmac('sha256', this.authSecret)
      .update(raw)
      .digest('hex');

    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(sig),
        Buffer.from(check),
      );

      if (!isValid) return null;

      const parsed = JSON.parse(raw) as SessionData;
      if (!parsed?.userId || typeof parsed.userId !== 'string') {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithAuthSession>();

    // Extract session cookie
    const cookies = request.cookies as Record<string, string> | undefined;
    const sessionCookie = cookies?.['admin_session'];

    if (!sessionCookie) {
      throw new UnauthorizedException('No session cookie found');
    }

    // Verify session
    const session = this.verifySignedCookie(sessionCookie);

    if (!session) {
      this.logger.warn('Invalid session cookie');
      throw new UnauthorizedException('Invalid session');
    }

    // Attach session to request
    request.authSession = session;

    return true;
  }
}
