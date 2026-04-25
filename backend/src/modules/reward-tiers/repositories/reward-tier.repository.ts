import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '../../../common/database';
import { RewardTier, mapRowToRewardTier } from '../models/reward-tier.model';
import { CreateRewardTierDto, UpdateRewardTierDto } from '../dto/reward-tier.dto';

@Injectable()
export class RewardTierRepository extends BaseRepository {
  async create(campaignId: string, dto: CreateRewardTierDto): Promise<RewardTier> {
    const query = `
      INSERT INTO reward_tiers (
        campaign_id, title, description, amount, currency, max_claims,
        estimated_delivery, includes_shipping, shipping_details, image_url,
        expires_at, items, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    const values = [
      campaignId,
      dto.title,
      dto.description,
      dto.amount,
      dto.currency || 'USD',
      dto.maxClaims ?? null,
      dto.estimatedDelivery || null,
      dto.includesShipping ?? false,
      dto.shippingDetails || null,
      dto.imageUrl || null,
      dto.expiresAt || null,
      JSON.stringify(dto.items || []),
      dto.sortOrder || 0,
    ];

    const row = await this.queryOne(query, values);
    return mapRowToRewardTier(row);
  }

  async findByCampaignId(campaignId: string, onlyActive = true): Promise<RewardTier[]> {
    const query = `
      SELECT * FROM reward_tiers 
      WHERE campaign_id = $1 ${onlyActive ? 'AND is_active = true' : ''}
      ORDER BY sort_order ASC, amount ASC;
    `;
    const rows = await this.queryMany(query, [campaignId]);
    return rows.map(mapRowToRewardTier);
  }

  async findById(id: string): Promise<RewardTier | null> {
    const row = await this.queryOne(`SELECT * FROM reward_tiers WHERE id = $1`, [id]);
    return row ? mapRowToRewardTier(row) : null;
  }

  async update(id: string, dto: UpdateRewardTierDto): Promise<RewardTier> {
    const { clause, values, nextIndex } = this.buildUpdateSet({
      title: dto.title,
      description: dto.description,
      amount: dto.amount,
      currency: dto.currency,
      maxClaims: dto.maxClaims,
      estimatedDelivery: dto.estimatedDelivery,
      includesShipping: dto.includesShipping,
      shippingDetails: dto.shippingDetails,
      imageUrl: dto.imageUrl,
      expiresAt: dto.expiresAt,
      items: dto.items ? JSON.stringify(dto.items) : undefined,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
    });

    const query = `UPDATE reward_tiers SET ${clause} WHERE id = $${nextIndex} RETURNING *;`;
    const row = await this.queryOne(query, [...values, id]);
    
    if (!row) throw new NotFoundException('Nivel de recompensa no encontrado');
    return mapRowToRewardTier(row);
  }

  async delete(id: string): Promise<void> {
    const result = await this.query(`DELETE FROM reward_tiers WHERE id = $1`, [id]);
    if (result.rowCount === 0) throw new NotFoundException('Nivel de recompensa no encontrado');
  }

  /**
   * Intenta reclamar una recompensa de forma atómica.
   * Retorna el tier actualizado si tuvo éxito, o lanza un error si está agotado.
   */
  async claimRewardAtomic(id: string, client?: any): Promise<RewardTier> {
    const query = `
      UPDATE reward_tiers
      SET current_claims = current_claims + 1
      WHERE id = $1 
        AND is_active = true
        AND (max_claims IS NULL OR current_claims < max_claims)
      RETURNING *;
    `;
    
    const db = client || this;
    const row = await db.queryOne(query, [id]);
    
    if (!row) {
      // Si no retorna fila, verificamos por qué
      const exists = await this.findById(id);
      if (!exists) throw new NotFoundException('La recompensa no existe.');
      if (!exists.isActive) throw new BadRequestException('Esta recompensa ya no está activa.');
      throw new BadRequestException('Esta recompensa ha alcanzado su límite máximo (Sold Out).');
    }
    
    return mapRowToRewardTier(row);
  }

  async getRewardClaims(campaignId: string): Promise<any[]> {
    const query = `
      SELECT 
        i.id as investment_id,
        i.amount,
        i.created_at as invested_at,
        rt.title as reward_title,
        rt.id as reward_id,
        rt.expires_at,
        u.email as investor_email,
        ip.first_name,
        ip.last_name
      FROM investments i
      JOIN reward_tiers rt ON i.reward_tier_id = rt.id
      JOIN users u ON i.investor_id = u.id
      JOIN investor_profiles ip ON i.investor_id = ip.user_id
      WHERE i.campaign_id = $1 AND i.status = 'completed'
      ORDER BY i.created_at DESC;
    `;
    return this.queryMany(query, [campaignId]);
  }
}
