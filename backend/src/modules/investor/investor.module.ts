import { Module } from '@nestjs/common';
import { InvestorController } from './controllers';
import { InvestorService } from './services';
import { InvestorProfileRepository } from './repositories';

@Module({
  controllers: [InvestorController],
  providers: [
    InvestorService,
    InvestorProfileRepository,
  ],
  exports: [InvestorService],
})
export class InvestorModule {}
