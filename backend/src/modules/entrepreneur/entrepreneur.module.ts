import { Module } from '@nestjs/common';
import { EntrepreneurController } from './controllers';
import { EntrepreneurService } from './services';
import {
  EntrepreneurProfileRepository,
  EntrepreneurCampaignRepository,
} from './repositories';

@Module({
  controllers: [EntrepreneurController],
  providers: [
    EntrepreneurService,
    EntrepreneurProfileRepository,
    EntrepreneurCampaignRepository,
  ],
  exports: [EntrepreneurService],
})
export class EntrepreneurModule {}
