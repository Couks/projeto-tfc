import { SetMetadata } from '@nestjs/common';
import { REQUIRE_AUTH_KEY } from '../guards/unified.guard';

// Decorador para marcar rota que precisa de autenticação
export const RequireAuth = () => SetMetadata(REQUIRE_AUTH_KEY, true);
