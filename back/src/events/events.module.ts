import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AuthModule } from '../auth/auth.module';
import { UnifiedGuard } from '../common/guards/unified.guard';

@Module({
  imports: [AuthModule], // Importa o AuthModule para usar JwtService no UnifiedGuard
  controllers: [EventsController],
  providers: [EventsService, UnifiedGuard],
  exports: [EventsService],
})
export class EventsModule {}
