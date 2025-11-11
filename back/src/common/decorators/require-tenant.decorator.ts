import { SetMetadata } from '@nestjs/common';
import { REQUIRE_TENANT_KEY } from '../guards/unified.guard';

/**
 * Decorador para marcar uma rota que exige tenant (siteKey)
 */
export const RequireTenant = () => SetMetadata(REQUIRE_TENANT_KEY, true);
