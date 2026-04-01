import { Controller, Get, Patch, Param, Body, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiSuccessResponse } from '../../../common/dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard-stats')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  async getDashboardStats() {
    const stats = await this.adminService.getDashboardStats();
    return new ApiSuccessResponse(stats, 'Estadísticas obtenidas');
  }

  @Get('users')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Listar usuarios registrados' })
  async getAllUsers() {
    const users = await this.adminService.getAllUsers();
    return new ApiSuccessResponse(users, 'Usuarios listados');
  }

  @Get('campaigns')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Listar todas las campañas para revisión' })
  async getAllCampaigns() {
    const campaigns = await this.adminService.getAllCampaigns();
    return new ApiSuccessResponse(campaigns, 'Campañas listadas');
  }

  @Patch('campaigns/:id/status')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Aprobar o rechazar campañas' })
  async updateCampaignStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const updated = await this.adminService.updateCampaignStatus(id, status);
    return new ApiSuccessResponse(updated, 'Estado de campaña actualizado');
  }

  @Delete('users/:id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Desactiva un usuario lógicamente' })
  async softDeleteUser(@Param('id') id: string) {
    const deleted = await this.adminService.softDeleteUser(id);
    return new ApiSuccessResponse(deleted, 'Usuario inhabilitado con éxito');
  }

  @Delete('campaigns/:id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Borra físicamente una campaña, si aplica' })
  async deleteCampaign(@Param('id') id: string) {
    const deleted = await this.adminService.hardDeleteCampaign(id);
    return new ApiSuccessResponse(deleted, 'Campaña eliminada o cancelada con éxito');
  }
}
