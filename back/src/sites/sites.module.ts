import { Module } from '@nestjs/common';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { AuthModule } from '../auth/auth.module';
import { UnifiedGuard } from '../common/guards/unified.guard';

@Module({
  imports: [AuthModule],
  controllers: [SitesController],
  providers: [SitesService, UnifiedGuard],
  exports: [SitesService],
})
export class SitesModule {}
