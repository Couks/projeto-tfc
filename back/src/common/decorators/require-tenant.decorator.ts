import { SetMetadata } from '@nestjs/common';
import { REQUIRE_TENANT_KEY } from '../guards/unified.guard';

/**
 * Decorator to mark a route as requiring tenant (siteKey)
 */
export const RequireTenant = () => SetMetadata(REQUIRE_TENANT_KEY, true);
