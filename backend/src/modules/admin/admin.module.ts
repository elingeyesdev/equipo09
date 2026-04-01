import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { SuperAdminController } from './controllers/superadmin.controller';
import { AdminService } from './services/admin.service';
import { AdminRepository } from './repositories/admin.repository';
import { UsersModule } from '../users/user.module';

@Module({
  imports: [UsersModule],
  controllers: [AdminController, SuperAdminController],
  providers: [AdminService, AdminRepository],
})
export class AdminModule {}
