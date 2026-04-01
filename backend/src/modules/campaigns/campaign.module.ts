import { Module } from '@nestjs/common';
import { CampaignService } from './services';
import { CampaignRepository } from './repositories';
import { EntrepreneurCampaignsController } from './controllers';

@Module({
  controllers: [EntrepreneurCampaignsController],
  providers: [CampaignService, CampaignRepository],
  exports: [CampaignService],
})
export class CampaignsModule {}
