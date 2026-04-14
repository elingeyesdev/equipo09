import { Module } from '@nestjs/common';
import { CampaignService } from './services';
import { CampaignRepository } from './repositories';
import { EntrepreneurCampaignsController, PublicCampaignController } from './controllers';

@Module({
  controllers: [EntrepreneurCampaignsController, PublicCampaignController],
  providers: [CampaignService, CampaignRepository],
  exports: [CampaignService],
})
export class CampaignsModule {}
