import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { SearchAnalyzerService } from './analyzers/search-analyzer.service';
import { ConversionAnalyzerService } from './analyzers/conversion-analyzer.service';
import { PropertyAnalyzerService } from './analyzers/property-analyzer.service';
import { FormAnalyzerService } from './analyzers/form-analyzer.service';
import { EngagementAnalyzerService } from './analyzers/engagement-analyzer.service';

@Module({
  controllers: [InsightsController],
  providers: [
    InsightsService,
    SearchAnalyzerService,
    ConversionAnalyzerService,
    PropertyAnalyzerService,
    FormAnalyzerService,
    EngagementAnalyzerService,
  ],
  exports: [
    InsightsService,
    SearchAnalyzerService,
    ConversionAnalyzerService,
    PropertyAnalyzerService,
    FormAnalyzerService,
    EngagementAnalyzerService,
  ],
})
export class InsightsModule {}
