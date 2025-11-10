import { Module } from '@nestjs/common';
import { OverviewModule } from './overview/overview.module';
import { SearchModule } from './search/search.module';
import { PropertyModule } from './property/property.module';
import { ConversionModule } from './conversion/conversion.module';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { AuthModule } from '../auth/auth.module';
import { UnifiedGuard } from '../common/guards/unified.guard';

@Module({
  imports: [
    AuthModule,
    OverviewModule,
    SearchModule,
    PropertyModule,
    ConversionModule,
  ],
  controllers: [InsightsController], // Mantido para o endpoint admin/refresh
  providers: [InsightsService, UnifiedGuard], // Mantido para o endpoint admin/refresh
})
export class InsightsModule {}
