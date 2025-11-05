import { SetMetadata } from '@nestjs/common';
import { REQUIRE_AUTH_KEY } from '../guards/unified.guard';

/**
 * Decorator to mark a route as requiring authentication
 */
export const RequireAuth = () => SetMetadata(REQUIRE_AUTH_KEY, true);
