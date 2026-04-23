import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';
import { UserRepository } from '../../users/repositories';
import { EntrepreneurCampaignRepository } from '../../entrepreneur/repositories';
import { QueryAdminCampaignsDto } from '../dto/admin-campaigns.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly userRepo: UserRepository,
    private readonly campaignRepo: EntrepreneurCampaignRepository,
  ) {}

  async getDashboardStats() {
    return this.adminRepo.getDashboardStats();
  }

  async getAllUsers() {
    return this.adminRepo.getAllUsers();
  }

  async getAllCampaigns() {
    return this.adminRepo.getAllCampaigns();
  }

  async getPendingCampaigns(queryDto: QueryAdminCampaignsDto) {
    return this.adminRepo.findPendingCampaigns(queryDto);
  }

  async getCampaignDetail(id: string) {
    const campaign = await this.adminRepo.getCampaignDetailAdmin(id);
    if (!campaign) {
      throw new NotFoundException('Campaña no encontrada');
    }
    return campaign;
  }

  async updateCampaignStatus(campaignId: string, status: string, reviewerId: string, feedback?: string) {
    if (status === 'rejected' && (!feedback || feedback.trim().length < 3)) {
      throw new BadRequestException('Debe proporcionar un feedback válido (mínimo 3 caracteres) para rechazar la campaña.');
    }
    const updated = await this.adminRepo.updateCampaignStatus(campaignId, status, reviewerId, feedback);
    if (!updated) {
      throw new NotFoundException('Campaña no encontrada');
    }
    return updated;
  }

  async getCampaignHistory(campaignId: string) {
    return this.adminRepo.getCampaignHistory(campaignId);
  }

  async getCampaignFinancialProgress(campaignId: string) {
    return this.campaignRepo.getFinancialProgressAdmin(campaignId);
  }

  async createAdmin(email: string, passwordString: string) {
    const userExists = await this.userRepo.findByEmail(email);
    if (userExists) {
      throw new BadRequestException('El usuario ya existe');
    }

    const newUser = await this.userRepo.create({
      email,
      password: passwordString,
    });

    if (!newUser) {
       throw new BadRequestException('Error al crear usuario');
    }
       
    return this.adminRepo.createAdminProfile(newUser.id, 'admin');
  }

  async getAllAdmins() {
    return this.adminRepo.getAllAdmins();
  }

  async deleteAdminProfile(adminId: string) {
    const deleted = await this.adminRepo.deleteAdminProfile(adminId);
    if (!deleted) throw new NotFoundException('Perfil de administrador no encontrado');
    return deleted;
  }

  async softDeleteUser(userId: string) {
    const isTargetAdmin = await this.adminRepo.isUserAdmin(userId);
    if (isTargetAdmin) {
      throw new BadRequestException('Privilegios insuficientes: No puedes bloquear a otro administrador o super administrador desde este panel.');
    }
    const deleted = await this.adminRepo.softDeleteUser(userId);
    if (!deleted) throw new NotFoundException('Usuario no encontrado');
    return deleted;
  }

  async hardDeleteCampaign(campaignId: string, reviewerId: string) {
    try {
      const deleted = await this.adminRepo.hardDeleteCampaign(campaignId);
      if (!deleted) throw new NotFoundException('Campaña no encontrada');
      return deleted;
    } catch(err: any) {
      if (err.code === '23503') { // Foreign key constraint violation
        // Fallback: Si no se puede borrar porque tiene inversores/fondos, se cambia el status a "cancelled"
        return this.adminRepo.updateCampaignStatus(campaignId, 'cancelled', reviewerId);
      }
      throw err;
    }
  }
}
