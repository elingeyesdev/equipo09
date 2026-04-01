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
  ],
})
export class AppModule {}
