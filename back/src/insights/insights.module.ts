import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { SearchAnalyzerService } from './analyzers/search-analyzer.service';
import { ConversionAnalyzerService } from './analyzers/conversion-analyzer.service';
import { PropertyAnalyzerService } from './analyzers/property-analyzer.service';
import { AuthModule } from '../auth/auth.module';
import { UnifiedGuard } from '../common/guards/unified.guard';

@Module({
  imports: [AuthModule], // Import AuthModule to access JwtService for UnifiedGuard
  controllers: [InsightsController],
  providers: [
    InsightsService,
    SearchAnalyzerService,
    ConversionAnalyzerService,
    PropertyAnalyzerService,
    UnifiedGuard,
  ],
  exports: [
    InsightsService,
    SearchAnalyzerService,
    ConversionAnalyzerService,
    PropertyAnalyzerService,
  ],
})
export class InsightsModule {}
