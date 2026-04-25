import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database.module';
import { UsersModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { EntrepreneurModule } from './modules/entrepreneur/entrepreneur.module';
import { InvestorModule } from './modules/investor/investor.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CampaignsModule } from './modules/campaigns/campaign.module';
import { AdminModule } from './modules/admin/admin.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { RewardTiersModule } from './modules/reward-tiers/reward-tiers.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    EntrepreneurModule,
    InvestorModule,
    CategoriesModule,
    CampaignsModule,
    AdminModule,
    InvestmentsModule,
    RewardTiersModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
})
export class AppModule {}
